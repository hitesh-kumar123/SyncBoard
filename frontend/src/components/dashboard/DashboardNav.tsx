"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationDropdown } from "./NotificationDropdown";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface DashboardNavProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const DashboardNav: React.FC<DashboardNavProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-12 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-[#c2c6d6] dark:border-[#1e293b] flex items-center justify-between px-4 z-40">
      {/* Left: Brand Identity */}
      <Link href="/dashboard" className="flex items-center gap-2 select-none group">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0058be] to-[#2170e4] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
          <Icon name="gesture" size={18} />
        </div>
        <span className="font-bold text-base text-[#151c27] dark:text-[#f8fafc] tracking-tight">
          SyncBoard
        </span>
      </Link>

      {/* Center: Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8 items-center relative">
        <span className="absolute left-3 text-[#727785] dark:text-[#64748b] flex items-center pointer-events-none">
          <Icon name="search" size={18} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search boards..."
          className="w-full h-8 pl-9 pr-8 bg-white dark:bg-[#1e293b] border border-[#c2c6d6] dark:border-[#334155] rounded-lg text-sm text-[#151c27] dark:text-[#f8fafc] focus:outline-none focus:border-[#0058be] dark:focus:border-[#38bdf8] focus:ring-2 focus:ring-[#0058be]/20 transition-all placeholder:text-[#727785] dark:placeholder:text-[#64748b]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 text-[#727785] hover:text-[#151c27] dark:hover:text-white"
          >
            <Icon name="close" size={16} />
          </button>
        )}
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2 relative">
        {/* Real-time Notifications & Invitations Dropdown */}
        <NotificationDropdown />

        {/* Dark Mode Toggle */}
        <ThemeToggle />

        <div className="w-px h-4 bg-[#c2c6d6] dark:bg-[#334155] mx-1 hidden md:block" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-[#e2e8f8] dark:hover:bg-[#1e293b] transition-colors focus:outline-none cursor-pointer"
            aria-label="User profile"
          >
            <Avatar
              name={user?.name || "User"}
              src={user?.avatarUrl}
              size="sm"
              color={user?.color || "#0058be"}
            />
          </button>

          {showProfileMenu && (
            <div
              onClick={() => setShowProfileMenu(false)}
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0f172a] border border-[#c2c6d6] dark:border-[#1e293b] rounded-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5)] py-2 z-50 animate-in fade-in zoom-in-95"
            >
              <div className="px-4 py-2 border-b border-[#c2c6d6]/50 dark:border-[#1e293b]">
                <p className="text-sm font-semibold text-[#151c27] dark:text-[#f8fafc] truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-[#424754] dark:text-[#94a3b8] truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-xs text-[#151c27] dark:text-[#e2e8f0] hover:bg-[#e7eefe] dark:hover:bg-[#1e293b] transition-colors"
                >
                  <Icon name="dashboard" size={16} />
                  My Boards
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-[#ba1a1a] dark:text-[#f87171] hover:bg-[#ffdad6]/40 dark:hover:bg-[#991b1b]/20 transition-colors cursor-pointer"
                >
                  <Icon name="logout" size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
