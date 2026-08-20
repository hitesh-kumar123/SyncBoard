import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import { BoardElement, SyncStatus } from "@/types/board";
import { RemoteCursor } from "@/types/collab";
import { User } from "@/types/auth";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:1234";

class YjsBoardManager {
  private ydoc: Y.Doc | null = null;
  private provider: WebsocketProvider | null = null;
  private indexeddbProvider: IndexeddbPersistence | null = null;
  private elementsMap: Y.Map<BoardElement> | null = null;
  private undoManager: Y.UndoManager | null = null;
  private currentBoardId: string | null = null;
  private localOrigin: any = null;

  // Listeners
  private onElementsChangeCallback: ((elements: BoardElement[]) => void) | null = null;
  private onCursorsChangeCallback: ((cursors: RemoteCursor[]) => void) | null = null;
  private onStatusChangeCallback: ((status: SyncStatus) => void) | null = null;
  private onUndoChangeCallback: ((canUndo: boolean, canRedo: boolean) => void) | null = null;

  public connect(
    boardId: string,
    user: User,
    callbacks: {
      onElementsChange: (elements: BoardElement[]) => void;
      onCursorsChange: (cursors: RemoteCursor[]) => void;
      onStatusChange: (status: SyncStatus) => void;
      onUndoChange: (canUndo: boolean, canRedo: boolean) => void;
    }
  ) {
    const cleanRoomName = boardId.startsWith("board-") ? boardId : `board-${boardId}`;

    // If already connected to the same room, just update callbacks
    if (this.currentBoardId === cleanRoomName && this.provider) {
      this.onElementsChangeCallback = callbacks.onElementsChange;
      this.onCursorsChangeCallback = callbacks.onCursorsChange;
      this.onStatusChangeCallback = callbacks.onStatusChange;
      this.onUndoChangeCallback = callbacks.onUndoChange;
      return;
    }

    // Clean up any previous connection
    this.disconnect();

    this.currentBoardId = cleanRoomName;
    this.onElementsChangeCallback = callbacks.onElementsChange;
    this.onCursorsChangeCallback = callbacks.onCursorsChange;
    this.onStatusChangeCallback = callbacks.onStatusChange;
    this.onUndoChangeCallback = callbacks.onUndoChange;

    // Create unique origin for local client transactions
    this.localOrigin = { clientId: user.id || "client-" + Math.random().toString(36).substring(2, 9) };

    // 1. Initialize Y.Doc
    this.ydoc = new Y.Doc();

    // 2. Offline Persistence via IndexedDB
    try {
      this.indexeddbProvider = new IndexeddbPersistence(cleanRoomName, this.ydoc);
      this.indexeddbProvider.on("synced", () => {
        this.emitElements();
      });
    } catch (e) {
      console.warn("[Yjs IndexedDB] Offline persistence:", e);
    }

    // 3. Connect WebsocketProvider to room
    try {
      this.provider = new WebsocketProvider(WS_URL, cleanRoomName, this.ydoc, {
        connect: true,
        maxBackoffTime: 3000,
      });

      // 4. Shared elements map
      this.elementsMap = this.ydoc.getMap<BoardElement>("elements");

      // Observe changes on elements map
      this.elementsMap.observe(() => {
        this.emitElements();
      });

      // 5. Scoped UndoManager for local user transactions
      this.undoManager = new Y.UndoManager(this.elementsMap, {
        trackedOrigins: new Set([this.localOrigin]),
      });

      this.undoManager.on("stack-item-added", () => this.updateUndoState());
      this.undoManager.on("stack-item-popped", () => this.updateUndoState());

      // 6. Awareness (Multiplayer Cursors & Presence)
      const awareness = this.provider.awareness;
      awareness.setLocalStateField("user", {
        id: user.id,
        name: user.name,
        email: user.email,
        color: user.color || "#0058be",
        avatarUrl: user.avatarUrl,
      });

      awareness.on("change", () => {
        this.emitCursors();
      });

      // 7. Status updates
      this.provider.on("status", (event: { status: string }) => {
        let status: SyncStatus = "CONNECTED";
        if (event.status === "connected") {
          status = "CONNECTED";
        } else if (event.status === "connecting") {
          status = "RECONNECTING";
        } else {
          status = "OFFLINE";
        }
        this.onStatusChangeCallback?.(status);
      });

      this.provider.on("sync", (isSynced: boolean) => {
        if (isSynced) {
          this.emitElements();
          this.onStatusChangeCallback?.("CONNECTED");
        }
      });
    } catch (err) {
      console.error("[Yjs Manager] Connection error:", err);
      this.onStatusChangeCallback?.("OFFLINE");
    }

    // Initial emit
    this.emitElements();
    this.updateUndoState();
  }

  private emitElements() {
    if (!this.elementsMap || !this.onElementsChangeCallback) return;
    const elements: BoardElement[] = [];
    this.elementsMap.forEach((el) => {
      if (el && el.id) {
        elements.push(el);
      }
    });
    this.onElementsChangeCallback(elements);
  }

  private emitCursors() {
    if (!this.provider || !this.onCursorsChangeCallback) return;
    const awareness = this.provider.awareness;
    const states = awareness.getStates();
    const localClientID = awareness.clientID;

    const cursors: RemoteCursor[] = [];

    states.forEach((state: any, clientID: number) => {
      if (clientID === localClientID) return;
      if (state.user && state.cursor) {
        cursors.push({
          userId: String(clientID),
          userName: state.user.name || "Collaborator",
          userColor: state.user.color || "#0058be",
          x: state.cursor.x,
          y: state.cursor.y,
          lastUpdate: Date.now(),
        });
      }
    });

    this.onCursorsChangeCallback(cursors);
  }

  private updateUndoState() {
    if (!this.undoManager || !this.onUndoChangeCallback) return;
    const canUndo = this.undoManager.undoStack.length > 0;
    const canRedo = this.undoManager.redoStack.length > 0;
    this.onUndoChangeCallback(canUndo, canRedo);
  }

  public addElement(element: BoardElement) {
    if (!this.ydoc || !this.elementsMap) return;
    this.ydoc.transact(() => {
      this.elementsMap!.set(element.id, element);
    }, this.localOrigin);
  }

  public updateElement(id: string, updates: Partial<BoardElement>) {
    if (!this.ydoc || !this.elementsMap) return;
    const existing = this.elementsMap.get(id);
    if (!existing) return;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    } as BoardElement;

    this.ydoc.transact(() => {
      this.elementsMap!.set(id, updated);
    }, this.localOrigin);
  }

  public deleteElements(ids: string[]) {
    if (!this.ydoc || !this.elementsMap) return;
    this.ydoc.transact(() => {
      ids.forEach((id) => {
        this.elementsMap!.delete(id);
      });
    }, this.localOrigin);
  }

  public setInitialElementsIfEmpty(elements: BoardElement[]) {
    if (!this.ydoc || !this.elementsMap) return;
    if (this.elementsMap.size === 0 && elements.length > 0) {
      this.ydoc.transact(() => {
        elements.forEach((el) => {
          this.elementsMap!.set(el.id, el);
        });
      }, this.localOrigin);
    }
  }

  public updateCursor(worldX: number, worldY: number) {
    if (!this.provider) return;
    this.provider.awareness.setLocalStateField("cursor", {
      x: worldX,
      y: worldY,
    });
  }

  public clearCursor() {
    if (!this.provider) return;
    this.provider.awareness.setLocalStateField("cursor", null);
  }

  public undo() {
    if (this.undoManager && this.undoManager.undoStack.length > 0) {
      this.undoManager.undo();
      this.updateUndoState();
    }
  }

  public redo() {
    if (this.undoManager && this.undoManager.redoStack.length > 0) {
      this.undoManager.redo();
      this.updateUndoState();
    }
  }

  public disconnect() {
    if (this.provider) {
      try {
        this.provider.disconnect();
        this.provider.destroy();
      } catch (e) {}
      this.provider = null;
    }
    if (this.indexeddbProvider) {
      try {
        this.indexeddbProvider.destroy();
      } catch (e) {}
      this.indexeddbProvider = null;
    }
    if (this.undoManager) {
      try {
        this.undoManager.destroy();
      } catch (e) {}
      this.undoManager = null;
    }
    if (this.ydoc) {
      try {
        this.ydoc.destroy();
      } catch (e) {}
      this.ydoc = null;
    }
    this.elementsMap = null;
    this.currentBoardId = null;
  }
}

export const yjsBoardManager = new YjsBoardManager();
