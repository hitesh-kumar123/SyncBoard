import { create } from "zustand";

type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const THEME_STORAGE_KEY = "syncboard_theme";

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  isDark: false,

  initializeTheme: () => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    const initialTheme: ThemeMode = saved || "light";
    let isDark = initialTheme === "dark";

    if (initialTheme === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    set({ theme: initialTheme, isDark });
  },

  setTheme: (theme) => {
    if (typeof window === "undefined") return;

    let isDark = theme === "dark";
    if (theme === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    localStorage.setItem(THEME_STORAGE_KEY, theme);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    set({ theme, isDark });
  },

  toggleTheme: () => {
    const { isDark } = get();
    const nextMode: ThemeMode = isDark ? "light" : "dark";
    get().setTheme(nextMode);
  },
}));
