import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

export interface BoardNotification {
  id: string;
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  boardId: string;
  boardTitle: string;
  role: string;
  createdAt: string;
  isRead: boolean;
}

const NOTIFICATIONS_STORAGE_KEY = "syncboard_notifications";

function getStoredNotifications(): BoardNotification[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to parse notifications:", e);
  }
  return [];
}

function saveStoredNotifications(notifs: BoardNotification[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
  } catch (e) {
    console.error("Failed to save notifications:", e);
  }
}

interface NotificationState {
  notifications: BoardNotification[];
  initializeNotifications: () => void;
  addInvitationNotification: (
    recipientEmail: string,
    boardId: string,
    boardTitle: string,
    role: string
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  initializeNotifications: () => {
    if (typeof window !== "undefined") {
      const stored = getStoredNotifications();
      set({ notifications: stored });
    }
  },

  addInvitationNotification: (recipientEmail, boardId, boardTitle, role) => {
    const sender = useAuthStore.getState().user;
    const newNotif: BoardNotification = {
      id: "notif-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      recipientEmail: recipientEmail.toLowerCase().trim(),
      senderName: sender?.name || "A collaborator",
      senderEmail: sender?.email || "",
      boardId,
      boardTitle,
      role,
      createdAt: "Just now",
      isRead: false,
    };

    const next = [newNotif, ...get().notifications];
    saveStoredNotifications(next);
    set({ notifications: next });
  },

  markAsRead: (id) => {
    const next = get().notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    saveStoredNotifications(next);
    set({ notifications: next });
  },

  markAllAsRead: () => {
    const currentUserEmail = useAuthStore.getState().user?.email?.toLowerCase().trim() || "";
    const next = get().notifications.map((n) =>
      n.recipientEmail === currentUserEmail ? { ...n, isRead: true } : n
    );
    saveStoredNotifications(next);
    set({ notifications: next });
  },

  clearNotifications: () => {
    saveStoredNotifications([]);
    set({ notifications: [] });
  },
}));
