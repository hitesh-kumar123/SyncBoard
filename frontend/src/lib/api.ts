import { useAuthStore } from "@/store/useAuthStore";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: { code: string; message: string } }> {
  try {
    let userId = "";
    let userEmail = "";

    try {
      const user = useAuthStore.getState().user;
      if (user) {
        userId = user.id;
        userEmail = user.email;
      } else if (typeof window !== "undefined") {
        const stored = localStorage.getItem("syncboard_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          userId = parsed.id || "";
          userEmail = parsed.email || "";
        }
      }
    } catch {}

    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        ...(userId ? { "x-user-id": userId } : {}),
        ...(userEmail ? { "x-user-email": userEmail } : {}),
        ...options.headers,
      },
    });

    const json = await res.json();
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: err.message || "Failed to communicate with backend server",
      },
    };
  }
}

export const boardApi = {
  getBoards: () => apiRequest("/api/boards"),
  createBoard: (data: { name: string; description?: string; category?: string }) =>
    apiRequest("/api/boards", { method: "POST", body: JSON.stringify(data) }),
  getBoard: (boardId: string) => apiRequest(`/api/boards/${boardId}`),
  updateBoard: (boardId: string, data: any) =>
    apiRequest(`/api/boards/${boardId}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteBoard: (boardId: string) =>
    apiRequest(`/api/boards/${boardId}`, { method: "DELETE" }),
  getMembers: (boardId: string) =>
    apiRequest(`/api/boards/${boardId}/members`),
  inviteMember: (boardId: string, email: string, role: string) =>
    apiRequest(`/api/boards/${boardId}/members`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    }),
  updateMemberRole: (boardId: string, memberId: string, role: string) =>
    apiRequest(`/api/boards/${boardId}/members/${memberId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  removeMember: (boardId: string, memberId: string) =>
    apiRequest(`/api/boards/${boardId}/members/${memberId}`, {
      method: "DELETE",
    }),
  saveSnapshot: (boardId: string, snapshot: string) =>
    apiRequest(`/api/boards/${boardId}/snapshot`, {
      method: "POST",
      body: JSON.stringify({ snapshot }),
    }),
};
