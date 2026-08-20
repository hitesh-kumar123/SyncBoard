import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import * as Y from "yjs";
// @ts-ignore
import { setupWSConnection, setPersistence } from "y-websocket/bin/utils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const port = parseInt(process.env.WS_PORT || "1234", 10);

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "Yjs WebSocket Server Active", port }));
});

const wss = new WebSocketServer({ server });

// Map of debounce timers for saving rooms to database
const saveDebounceTimers = new Map<string, NodeJS.Timeout>();

// Configure Yjs Persistence with SQLite via Prisma
setPersistence({
  bindState: async (docName: string, ydoc: Y.Doc) => {
    // docName is the boardId
    try {
      const board = await prisma.board.findUnique({
        where: { id: docName },
        select: { snapshot: true },
      });

      if (board?.snapshot) {
        try {
          const binary = Buffer.from(board.snapshot, "base64");
          Y.applyUpdate(ydoc, new Uint8Array(binary));
          console.log(`[Yjs Persistence] Loaded snapshot for board ${docName}`);
        } catch (e) {
          console.error(`[Yjs Persistence] Error parsing snapshot for board ${docName}:`, e);
        }
      }
    } catch (err) {
      console.error(`[Yjs Persistence] Error loading state for ${docName}:`, err);
    }

    // Listen to document updates and trigger debounced database save
    ydoc.on("update", (update: Uint8Array) => {
      const existingTimer = saveDebounceTimers.get(docName);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Debounce saving by 1500ms so we don't spam SQLite
      const timer = setTimeout(async () => {
        try {
          const state = Y.encodeStateAsUpdate(ydoc);
          const base64State = Buffer.from(state).toString("base64");

          await prisma.board.update({
            where: { id: docName },
            data: { snapshot: base64State },
          });

          console.log(`[Yjs Persistence] Auto-saved snapshot for board ${docName}`);
          saveDebounceTimers.delete(docName);
        } catch (err) {
          console.error(`[Yjs Persistence] Failed to save snapshot for ${docName}:`, err);
        }
      }, 1500);

      saveDebounceTimers.set(docName, timer);
    });
  },
  writeState: async (docName: string, ydoc: Y.Doc) => {
    try {
      const state = Y.encodeStateAsUpdate(ydoc);
      const base64State = Buffer.from(state).toString("base64");

      await prisma.board.update({
        where: { id: docName },
        data: { snapshot: base64State },
      });
      console.log(`[Yjs Persistence] Explicit writeState for board ${docName}`);
    } catch (err) {
      console.error(`[Yjs Persistence] Error in writeState for ${docName}:`, err);
    }
  },
});

wss.on("connection", (conn: WebSocket, req: http.IncomingMessage) => {
  setupWSConnection(conn, req, {
    gc: true,
  });
});

server.listen(port, () => {
  console.log(`=================================================`);
  console.log(`🚀 Yjs Real-Time Collaboration Server running on:`);
  console.log(`   ws://localhost:${port}`);
  console.log(`   http://localhost:${port}`);
  console.log(`   SQLite Persistence: Active (Prisma)`);
  console.log(`=================================================`);
});
