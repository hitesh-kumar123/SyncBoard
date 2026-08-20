import { create } from "zustand";
import { Board, BoardElement, CanvasTool, BoardRole, Collaborator } from "@/types/board";
import { mockBoards } from "@/lib/mockData";
import { useAuthStore } from "./useAuthStore";
import { useCollabStore } from "./useCollabStore";
import { boardApi } from "@/lib/api";
import { yjsBoardManager } from "@/lib/yjs/yjsManager";

const STORAGE_KEY = "syncboard_boards";

function getAvatarColor(str: string): string {
  const colors = ["#0058be", "#4648d4", "#b75b00", "#2170e4", "#6063ee", "#00796b", "#c2185b"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getStoredBoards(): Board[] {
  if (typeof window === "undefined") return mockBoards;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse stored boards:", e);
  }
  return mockBoards;
}

function saveStoredBoards(boards: Board[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
  } catch (e) {
    console.error("Failed to save boards to localStorage:", e);
  }
}

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  currentUserRole: BoardRole;
  selectedTool: CanvasTool;
  selectedElementIds: string[];

  // Active Tool & Element Properties
  activeStrokeColor: string;
  activeFillColor: string;
  activeStrokeWidth: number;
  activeFontSize: number;
  
  // Viewport / Transformation
  scale: number;
  stagePos: { x: number; y: number };
  
  // History for Undo/Redo
  canUndo: boolean;
  canRedo: boolean;

  // Actions
  initializeBoards: () => void;
  setBoards: (boards: Board[]) => void;
  loadBoard: (boardId: string) => Board | null;
  createBoard: (title: string, description?: string) => Board;
  deleteBoard: (boardId: string) => void;
  duplicateBoard: (boardId: string) => void;
  updateBoardTitle: (boardId: string, title: string) => void;
  
  // Collaborator management
  inviteCollaboratorToBoard: (email: string, role: BoardRole) => Collaborator;
  updateCollaboratorRoleInBoard: (collabId: string, role: BoardRole) => void;
  removeCollaboratorFromBoard: (collabId: string) => void;

  setCurrentUserRole: (role: BoardRole) => void;
  setSelectedTool: (tool: CanvasTool) => void;
  setSelectedElementIds: (ids: string[]) => void;

  // Property setters
  setActiveStrokeColor: (color: string) => void;
  setActiveFillColor: (color: string) => void;
  setActiveStrokeWidth: (width: number) => void;
  setActiveFontSize: (size: number) => void;
  duplicateSelectedElements: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  
  setScale: (scale: number | ((prev: number) => number)) => void;
  setStagePos: (pos: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  
  // Canvas Elements Manipulation (Yjs Synchronized)
  addElement: (element: BoardElement) => void;
  updateElement: (id: string, updates: Partial<BoardElement>) => void;
  deleteElements: (ids: string[]) => void;
  setRemoteElements: (elements: BoardElement[]) => void;
  setUndoRedoState: (canUndo: boolean, canRedo: boolean) => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: mockBoards,
  currentBoard: mockBoards[0],
  currentUserRole: "OWNER",
  selectedTool: "select",
  selectedElementIds: [],

  // Default colors
  activeStrokeColor: "#0058be",
  activeFillColor: "#d8e2ff",
  activeStrokeWidth: 3,
  activeFontSize: 18,

  scale: 1,
  stagePos: { x: 0, y: 0 },
  canUndo: false,
  canRedo: false,

  initializeBoards: () => {
    if (typeof window !== "undefined") {
      const stored = getStoredBoards();
      set({ boards: stored });
    }
  },

  setBoards: (boards) => {
    saveStoredBoards(boards);
    set({ boards });
  },

  loadBoard: (boardId: string) => {
    const stored = getStoredBoards();
    const currentUser = useAuthStore.getState().user || {
      id: "user-" + Date.now(),
      name: "Guest",
      email: "guest@example.com",
      color: "#0058be",
    };
    
    // Find board by ID
    let board = stored.find((b) => b.id === boardId);
    
    // If not found in local storage (e.g. opened directly via link in new tab or session),
    // construct exact board model for this boardId so it connects to the real Yjs room!
    if (!board) {
      board = {
        id: boardId,
        title: "Collaborative Whiteboard",
        description: "",
        category: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: "Just now",
        owner: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: "OWNER",
          color: currentUser.color || "#0058be",
        },
        collaborators: [],
        elements: [],
      };
      const nextStored = [...stored, board];
      saveStoredBoards(nextStored);
    }
    
    let role: BoardRole = "VIEWER";
    if (board.owner?.id === currentUser.id || board.owner?.email?.toLowerCase().trim() === currentUser.email?.toLowerCase().trim()) {
      role = "OWNER";
    } else {
      const membership = board.collaborators?.find(
        (c) => c.id === currentUser.id || c.email?.toLowerCase().trim() === currentUser.email?.toLowerCase().trim()
      );
      if (membership) {
        role = membership.role;
      } else {
        role = "EDITOR"; // Default invited link access
      }
    }

    set({
      boards: stored,
      currentBoard: board,
      currentUserRole: role,
      canUndo: false,
      canRedo: false,
      selectedElementIds: [],
      scale: 1,
      stagePos: { x: 0, y: 0 },
    });

    if (board.collaborators && board.collaborators.length > 0) {
      useCollabStore.getState().setCollaborators(board.collaborators);
    }

    // Connect Yjs Real-Time CRDT Manager to the exact room
    yjsBoardManager.connect(board.id, currentUser, {
      onElementsChange: (elements) => {
        get().setRemoteElements(elements);
      },
      onCursorsChange: (cursors) => {
        useCollabStore.getState().setRemoteCursors(cursors);
      },
      onStatusChange: (status) => {
        useCollabStore.getState().setSyncStatus(status);
      },
      onUndoChange: (canUndo, canRedo) => {
        get().setUndoRedoState(canUndo, canRedo);
      },
    });

    // Initialize Yjs elements from board if Yjs document is empty
    if (board.elements && board.elements.length > 0) {
      yjsBoardManager.setInitialElementsIfEmpty(board.elements);
    }

    return board;
  },

  createBoard: (title: string, description?: string) => {
    const { boards } = get();
    const currentUser = useAuthStore.getState().user || {
      id: "user-" + Date.now(),
      name: "User",
      email: "user@example.com",
      color: "#0058be",
    };

    const ownerCollaborator: Collaborator = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: "OWNER",
      color: currentUser.color || "#0058be",
      avatarUrl: currentUser.avatarUrl,
      isOnline: true,
      lastActive: "Just now",
    };

    const newBoard: Board = {
      id: "board-" + Date.now(),
      title: title.trim() || "Untitled Board",
      description: description?.trim() || "",
      category: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: "Just now",
      owner: ownerCollaborator,
      collaborators: [ownerCollaborator],
      elements: [], // Clean blank canvas!
    };

    const nextBoards = [newBoard, ...boards];
    saveStoredBoards(nextBoards);

    set({
      boards: nextBoards,
      currentBoard: newBoard,
      currentUserRole: "OWNER",
      canUndo: false,
      canRedo: false,
      selectedElementIds: [],
      scale: 1,
      stagePos: { x: 0, y: 0 },
    });

    useCollabStore.getState().setCollaborators([ownerCollaborator]);

    // Connect Yjs for new board
    yjsBoardManager.connect(newBoard.id, currentUser, {
      onElementsChange: (elements) => {
        get().setRemoteElements(elements);
      },
      onCursorsChange: (cursors) => {
        useCollabStore.getState().setRemoteCursors(cursors);
      },
      onStatusChange: (status) => {
        useCollabStore.getState().setSyncStatus(status);
      },
      onUndoChange: (canUndo, canRedo) => {
        get().setUndoRedoState(canUndo, canRedo);
      },
    });

    return newBoard;
  },

  deleteBoard: (boardId: string) => {
    set((state) => {
      const updated = state.boards.filter((b) => b.id !== boardId);
      saveStoredBoards(updated);
      return {
        boards: updated,
        currentBoard: state.currentBoard?.id === boardId ? updated[0] || null : state.currentBoard,
      };
    });
  },

  duplicateBoard: (boardId: string) => {
    const { boards } = get();
    const target = boards.find((b) => b.id === boardId);
    if (!target) return;
    const duplicated: Board = {
      ...target,
      id: "board-" + Date.now(),
      title: `${target.title} (Copy)`,
      updatedAt: "Just now",
      elements: JSON.parse(JSON.stringify(target.elements)),
    };
    const nextBoards = [duplicated, ...boards];
    saveStoredBoards(nextBoards);
    set({ boards: nextBoards });
  },

  updateBoardTitle: (boardId: string, title: string) => {
    set((state) => {
      const updatedBoards = state.boards.map((b) =>
        b.id === boardId ? { ...b, title, updatedAt: "Just now" } : b
      );
      saveStoredBoards(updatedBoards);
      return {
        boards: updatedBoards,
        currentBoard: state.currentBoard?.id === boardId ? { ...state.currentBoard, title } : state.currentBoard,
      };
    });
  },

  inviteCollaboratorToBoard: (email: string, role: BoardRole) => {
    const { currentBoard, boards } = get();
    const cleanEmail = email.toLowerCase().trim();
    const rawName = cleanEmail.split("@")[0] || "User";
    const name = rawName
      .split(/[._-]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const existingCollabs = currentBoard?.collaborators || [];
    const existingIdx = existingCollabs.findIndex(
      (c) => c.email.toLowerCase() === cleanEmail
    );

    let nextCollabs: Collaborator[];
    let targetCollab: Collaborator;

    if (existingIdx >= 0) {
      targetCollab = { ...existingCollabs[existingIdx], role };
      nextCollabs = existingCollabs.map((c, i) => (i === existingIdx ? targetCollab : c));
    } else {
      targetCollab = {
        id: "collab-" + Date.now(),
        name,
        email: cleanEmail,
        role,
        color: getAvatarColor(cleanEmail),
        avatarUrl: undefined,
        isOnline: true,
        lastActive: "Just now",
      };
      nextCollabs = [...existingCollabs, targetCollab];
    }

    if (currentBoard) {
      const updatedBoard = { ...currentBoard, collaborators: nextCollabs, updatedAt: "Just now" };
      const updatedBoards = boards.map((b) => (b.id === currentBoard.id ? updatedBoard : b));
      saveStoredBoards(updatedBoards);

      set({
        boards: updatedBoards,
        currentBoard: updatedBoard,
      });

      useCollabStore.getState().setCollaborators(nextCollabs);
      boardApi.inviteMember(currentBoard.id, cleanEmail, role).catch(() => {});
    }

    return targetCollab;
  },

  updateCollaboratorRoleInBoard: (collabId: string, role: BoardRole) => {
    const { currentBoard, boards } = get();
    if (!currentBoard) return;

    const nextCollabs = (currentBoard.collaborators || []).map((c) =>
      c.id === collabId || c.email === collabId ? { ...c, role } : c
    );

    const updatedBoard = { ...currentBoard, collaborators: nextCollabs, updatedAt: "Just now" };
    const updatedBoards = boards.map((b) => (b.id === currentBoard.id ? updatedBoard : b));
    saveStoredBoards(updatedBoards);

    set({
      boards: updatedBoards,
      currentBoard: updatedBoard,
    });

    useCollabStore.getState().setCollaborators(nextCollabs);
  },

  removeCollaboratorFromBoard: (collabId: string) => {
    const { currentBoard, boards } = get();
    if (!currentBoard) return;

    const nextCollabs = (currentBoard.collaborators || []).filter(
      (c) => c.id !== collabId && c.email !== collabId
    );

    const updatedBoard = { ...currentBoard, collaborators: nextCollabs, updatedAt: "Just now" };
    const updatedBoards = boards.map((b) => (b.id === currentBoard.id ? updatedBoard : b));
    saveStoredBoards(updatedBoards);

    set({
      boards: updatedBoards,
      currentBoard: updatedBoard,
    });

    useCollabStore.getState().setCollaborators(nextCollabs);
  },

  setCurrentUserRole: (role) => set({ currentUserRole: role }),
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setSelectedElementIds: (ids) => set({ selectedElementIds: ids }),

  setActiveStrokeColor: (color) => {
    const { selectedElementIds, currentBoard } = get();
    set({ activeStrokeColor: color });

    if (currentBoard && selectedElementIds.length > 0) {
      selectedElementIds.forEach((id) => {
        get().updateElement(id, { strokeColor: color });
      });
    }
  },

  setActiveFillColor: (color) => {
    const { selectedElementIds, currentBoard } = get();
    set({ activeFillColor: color });

    if (currentBoard && selectedElementIds.length > 0) {
      selectedElementIds.forEach((id) => {
        get().updateElement(id, { fillColor: color });
      });
    }
  },

  setActiveStrokeWidth: (width) => {
    const { selectedElementIds, currentBoard } = get();
    set({ activeStrokeWidth: width });

    if (currentBoard && selectedElementIds.length > 0) {
      selectedElementIds.forEach((id) => {
        get().updateElement(id, { strokeWidth: width });
      });
    }
  },

  setActiveFontSize: (fontSize) => {
    const { selectedElementIds, currentBoard } = get();
    set({ activeFontSize: fontSize });

    if (currentBoard && selectedElementIds.length > 0) {
      selectedElementIds.forEach((id) => {
        get().updateElement(id, { fontSize } as any);
      });
    }
  },

  duplicateSelectedElements: () => {
    const { currentBoard, selectedElementIds } = get();
    if (!currentBoard || selectedElementIds.length === 0) return;

    selectedElementIds.forEach((id) => {
      const el = currentBoard.elements.find((item) => item.id === id);
      if (el) {
        const newId = el.type + "-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
        const duplicated: BoardElement = {
          ...JSON.parse(JSON.stringify(el)),
          id: newId,
          x: el.x + 25,
          y: el.y + 25,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        get().addElement(duplicated);
      }
    });
  },

  bringForward: () => {
    const { currentBoard, selectedElementIds } = get();
    if (!currentBoard || selectedElementIds.length === 0) return;

    selectedElementIds.forEach((id) => {
      const el = currentBoard.elements.find((item) => item.id === id);
      if (el) {
        get().updateElement(id, { updatedAt: Date.now() });
      }
    });
  },

  sendBackward: () => {
    const { currentBoard, selectedElementIds } = get();
    if (!currentBoard || selectedElementIds.length === 0) return;

    selectedElementIds.forEach((id) => {
      const el = currentBoard.elements.find((item) => item.id === id);
      if (el) {
        get().updateElement(id, { updatedAt: Date.now() - 100000 });
      }
    });
  },

  setScale: (scale) =>
    set((state) => ({
      scale: Math.max(0.1, Math.min(5, typeof scale === "function" ? scale(state.scale) : scale)),
    })),

  setStagePos: (pos) =>
    set((state) => ({
      stagePos: typeof pos === "function" ? pos(state.stagePos) : pos,
    })),

  // Local add element -> Broadcasts to Yjs
  addElement: (element) => {
    const { currentBoard, boards } = get();
    if (!currentBoard) return;
    const nextElements = [...currentBoard.elements, element];

    const updatedBoard = { ...currentBoard, elements: nextElements, updatedAt: "Just now" };
    const updatedBoards = boards.map((b) => (b.id === currentBoard.id ? updatedBoard : b));
    saveStoredBoards(updatedBoards);

    set({
      boards: updatedBoards,
      currentBoard: updatedBoard,
      selectedElementIds: [element.id],
    });

    // Send through Yjs
    yjsBoardManager.addElement(element);
  },

  // Local update element -> Broadcasts to Yjs
  updateElement: (id, updates) => {
    const { currentBoard, boards } = get();
    if (!currentBoard) return;

    const nextElements = currentBoard.elements.map((el) =>
      el.id === id ? ({ ...el, ...updates, updatedAt: Date.now() } as BoardElement) : el
    );
    const updatedBoard = { ...currentBoard, elements: nextElements, updatedAt: "Just now" };
    const updatedBoards = boards.map((b) => (b.id === currentBoard.id ? updatedBoard : b));
    saveStoredBoards(updatedBoards);

    set({
      boards: updatedBoards,
      currentBoard: updatedBoard,
    });

    // Send through Yjs
    yjsBoardManager.updateElement(id, updates);
  },

  // Local delete elements -> Broadcasts to Yjs
  deleteElements: (ids) => {
    const { currentBoard, boards } = get();
    if (!currentBoard || ids.length === 0) return;
    const nextElements = currentBoard.elements.filter((el) => !ids.includes(el.id));

    const updatedBoard = { ...currentBoard, elements: nextElements, updatedAt: "Just now" };
    const updatedBoards = boards.map((b) => (b.id === currentBoard.id ? updatedBoard : b));
    saveStoredBoards(updatedBoards);

    set({
      boards: updatedBoards,
      currentBoard: updatedBoard,
      selectedElementIds: [],
    });

    // Send through Yjs
    yjsBoardManager.deleteElements(ids);
  },

  // Incoming remote Yjs updates -> updates rendered canvas without re-transacting
  setRemoteElements: (elements) => {
    const { currentBoard, boards } = get();
    if (!currentBoard) return;

    const updatedBoard = { ...currentBoard, elements, updatedAt: "Just now" };
    const updatedBoards = boards.map((b) => (b.id === currentBoard.id ? updatedBoard : b));
    saveStoredBoards(updatedBoards);

    set({
      boards: updatedBoards,
      currentBoard: updatedBoard,
    });
  },

  setUndoRedoState: (canUndo, canRedo) => {
    set({ canUndo, canRedo });
  },

  undo: () => {
    yjsBoardManager.undo();
  },

  redo: () => {
    yjsBoardManager.redo();
  },
}));
