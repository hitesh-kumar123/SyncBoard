import { create } from "zustand";
import { Collaborator, SyncStatus, BoardRole } from "@/types/board";
import { RemoteCursor } from "@/types/collab";

interface CollabState {
  syncStatus: SyncStatus;
  collaborators: Collaborator[];
  remoteCursors: RemoteCursor[];
  isCollabActive: boolean;

  setSyncStatus: (status: SyncStatus) => void;
  setCollaborators: (collabs: Collaborator[]) => void;
  setRemoteCursors: (cursors: RemoteCursor[]) => void;
  inviteCollaborator: (email: string, role?: BoardRole) => void;
  updateCollaboratorRole: (id: string, role: BoardRole) => void;
  removeCollaborator: (id: string) => void;
  updateRemoteCursor: (cursor: RemoteCursor) => void;
  toggleCollabSimulation: (active: boolean) => void;
}

export const useCollabStore = create<CollabState>((set, get) => ({
  syncStatus: "CONNECTED",
  collaborators: [],
  remoteCursors: [],
  isCollabActive: true,

  setSyncStatus: (status) => set({ syncStatus: status }),
  setCollaborators: (collaborators) => set({ collaborators }),
  setRemoteCursors: (remoteCursors) => set({ remoteCursors }),

  inviteCollaborator: (email: string, role: BoardRole = "EDITOR") => {
    const rawName = email.split("@")[0] || "Guest";
    const name = rawName
      .split(/[._-]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const colors = ["#0058be", "#4648d4", "#b75b00", "#2170e4", "#6063ee", "#00796b"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newCollaborator: Collaborator = {
      id: "collab-" + Date.now(),
      name,
      email: email.toLowerCase().trim(),
      role,
      color: randomColor,
      avatarUrl: undefined,
      isOnline: true,
      lastActive: "Just now",
    };

    set((state) => ({
      collaborators: [...state.collaborators, newCollaborator],
    }));
  },

  updateCollaboratorRole: (id: string, role: BoardRole) => {
    set((state) => ({
      collaborators: state.collaborators.map((c) =>
        c.id === id ? { ...c, role } : c
      ),
    }));
  },

  removeCollaborator: (id: string) => {
    set((state) => ({
      collaborators: state.collaborators.filter((c) => c.id !== id),
    }));
  },

  updateRemoteCursor: (cursor: RemoteCursor) => {
    set((state) => {
      const existingIdx = state.remoteCursors.findIndex((c) => c.userId === cursor.userId);
      if (existingIdx >= 0) {
        const next = [...state.remoteCursors];
        next[existingIdx] = cursor;
        return { remoteCursors: next };
      }
      return { remoteCursors: [...state.remoteCursors, cursor] };
    });
  },

  toggleCollabSimulation: (active: boolean) => set({ isCollabActive: active }),
}));
