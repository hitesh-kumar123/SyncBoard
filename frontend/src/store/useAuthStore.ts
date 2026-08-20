import { create } from "zustand";
import { User, AuthState } from "@/types/auth";

interface AuthActions {
  initializeAuth: () => void;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

// Generate consistent pleasing color for user avatar
function getAvatarColor(str: string): string {
  const colors = [
    "#0058be", // Primary Blue
    "#4648d4", // Indigo
    "#b75b00", // Amber / Tertiary
    "#2170e4", // Cerulean
    "#6063ee", // Purple
    "#00796b", // Teal
    "#c2185b", // Pink
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const defaultInitialUser: User = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  color: "#0058be",
  avatarUrl: undefined, // uses initials "JD" with theme color
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: defaultInitialUser,
  isAuthenticated: true,
  isLoading: false,

  initializeAuth: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("syncboard_user");
      if (stored) {
        try {
          const user = JSON.parse(stored);
          set({ user, isAuthenticated: true });
        } catch {
          // ignore
        }
      }
    }
  },

  login: async (email: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // Format a friendly name from email if not given
    const localPart = email.split("@")[0] || "User";
    const formattedName = localPart
      .split(/[._-]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const user: User = {
      id: "user-" + Date.now(),
      name: formattedName,
      email: email.toLowerCase().trim(),
      avatarUrl: undefined, // Dynamic initials avatar
      color: getAvatarColor(email),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("syncboard_user", JSON.stringify(user));
    }
    set({ user, isAuthenticated: true, isLoading: false });
    return true;
  },

  signup: async (name: string, email: string) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));

    const user: User = {
      id: "user-" + Date.now(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      avatarUrl: undefined, // Dynamic initials avatar matching user name
      color: getAvatarColor(email || name),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("syncboard_user", JSON.stringify(user));
    }
    set({ user, isAuthenticated: true, isLoading: false });
    return true;
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("syncboard_user");
    }
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
