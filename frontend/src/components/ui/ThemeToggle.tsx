"use client";

import React, { useEffect } from "react";
import { Icon } from "./Icon";
import { useThemeStore } from "@/store/useThemeStore";

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { isDark, toggleTheme, initializeTheme } = useThemeStore();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <button
      onClick={toggleTheme}
      className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer text-[#424754] hover:bg-[#e2e8f8] dark:text-[#94a3b8] dark:hover:bg-[#1e293b] dark:hover:text-[#f8fafc] ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
    >
      <Icon name={isDark ? "light_mode" : "dark_mode"} size={20} />
    </button>
  );
};
