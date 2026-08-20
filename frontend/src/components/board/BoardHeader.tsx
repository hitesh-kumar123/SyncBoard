"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { SyncStatusBadge } from "./SyncStatusBadge";
import { CollaboratorsList } from "./CollaboratorsList";
import { ExportMenu } from "./ExportMenu";
import { ShareModal } from "./ShareModal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useBoardStore } from "@/store/useBoardStore";
import { useCollabStore } from "@/store/useCollabStore";
import { useAuthStore } from "@/store/useAuthStore";
import { BoardRole } from "@/types/board";

interface BoardHeaderProps {
  stageRef?: any;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({ stageRef }) => {
  const router = useRouter();
  const { currentBoard, updateBoardTitle, undo, redo, canUndo, canRedo, currentUserRole, setCurrentUserRole } = useBoardStore();
  const { syncStatus, setSyncStatus, collaborators } = useCollabStore();
  const { user, logout, initializeAuth } = useAuthStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(currentBoard?.title || "Untitled Board");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentBoard && titleInput.trim()) {
      updateBoardTitle(currentBoard.id, titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const toggleSyncStatus = () => {
    const statuses = ["CONNECTED", "SYNCING", "OFFLINE", "RECONNECTING"] as const;
    const currentIdx = statuses.indexOf(syncStatus as any);
    const nextStatus = statuses[(currentIdx + 1) % statuses.length];
    setSyncStatus(nextStatus);
  };

  const roleBadgeConfig = {
    OWNER: {
      label: "Owner",
      bg: "bg-[#d8e2ff] dark:bg-[#004395]/40",
      text: "text-[#004395] dark:text-[#adc6ff]",
      icon: "verified_user",
    },
    EDITOR: {
      label: "Editor",
      bg: "bg-[#e1e0ff] dark:bg-[#2f2ebe]/40",
      text: "text-[#2f2ebe] dark:text-[#c0c1ff]",
      icon: "edit",
    },
    VIEWER: {
      label: "Viewer",
      bg: "bg-[#e2e8f8] dark:bg-[#1e293b]",
      text: "text-[#424754] dark:text-[#94a3b8]",
      icon: "visibility",
    },
  }[currentUserRole] || {
    label: "Owner",
    bg: "bg-[#d8e2ff] dark:bg-[#004395]/40",
    text: "text-[#004395] dark:text-[#adc6ff]",
    icon: "verified_user",
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-12 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-[#c2c6d6] dark:border-[#1e293b] flex items-center justify-between px-3 md:px-4 z-40">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="text-xl font-bold text-[#0058be] dark:text-[#38bdf8] flex items-center gap-2 hover:opacity-90 transition-opacity"
            title="Back to Dashboard"
          >
            <Icon name="dashboard_customize" size={24} filled className="text-[#0058be] dark:text-[#38bdf8]" />
            <span className="tracking-tight hidden sm:inline">SyncBoard</span>
          </Link>

          <div className="w-px h-6 bg-[#c2c6d6] dark:bg-[#334155] hidden sm:block" />

          {/* Editable Board Title */}
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center">
              <input
                type="text"
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                className="px-2 py-0.5 border border-[#0058be] dark:border-[#38bdf8] rounded text-sm font-medium text-[#151c27] dark:text-[#f8fafc] bg-white dark:bg-[#1e293b] focus:outline-none"
              />
            </form>
          ) : (
            <div
              onClick={() => {
                if (currentUserRole !== "VIEWER") {
                  setTitleInput(currentBoard?.title || "");
                  setIsEditingTitle(true);
                }
              }}
              className="flex items-center gap-2 group cursor-pointer hover:bg-[#e2e8f8] dark:hover:bg-[#1e293b] px-2.5 py-1 rounded-md transition-colors"
              title="Click to rename board"
            >
              <span className="text-sm text-[#151c27] dark:text-[#f8fafc] font-semibold max-w-[140px] sm:max-w-[240px] truncate">
                {currentBoard?.title || "Untitled Board"}
              </span>
              {currentUserRole !== "VIEWER" && (
                <Icon
                  name="edit"
                  size={16}
                  className="text-[#727785] dark:text-[#64748b] opacity-0 group-hover:opacity-100 transition-opacity"
                />
              )}
            </div>
          )}

          {/* User Role Badge on Board */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadgeConfig.bg} ${roleBadgeConfig.text}`}
            title={`Your Role: ${roleBadgeConfig.label}`}
          >
            <Icon name={roleBadgeConfig.icon} size={14} />
            <span>{roleBadgeConfig.label}</span>
          </div>

          {/* Sync Status Badge */}
          <div className="hidden lg:flex items-center ml-1">
            <SyncStatusBadge status={syncStatus} onClick={toggleSyncStatus} />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo buttons */}
          {currentUserRole !== "VIEWER" && (
            <div className="hidden sm:flex items-center border border-[#c2c6d6] dark:border-[#334155] rounded-lg bg-white dark:bg-[#1e293b] overflow-hidden">
              <button
                onClick={undo}
                disabled={!canUndo}
                aria-label="Undo"
                className="p-1.5 text-[#424754] dark:text-[#94a3b8] hover:bg-[#e7eefe] dark:hover:bg-[#334155] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <Icon name="undo" size={18} />
              </button>
              <div className="w-px h-4 bg-[#c2c6d6] dark:bg-[#334155]" />
              <button
                onClick={redo}
                disabled={!canRedo}
                aria-label="Redo"
                className="p-1.5 text-[#424754] dark:text-[#94a3b8] hover:bg-[#e7eefe] dark:hover:bg-[#334155] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
              >
                <Icon name="redo" size={18} />
              </button>
            </div>
          )}

          {/* Theme Toggle (Dark/Light) */}
          <ThemeToggle />

          <div className="w-px h-6 bg-[#c2c6d6] dark:bg-[#334155] mx-1 hidden sm:block" />

          {/* Collaborator Avatars on this board */}
          <CollaboratorsList
            collaborators={collaborators}
            onShareClick={() => setIsShareModalOpen(true)}
          />

          {/* Share Button */}
          {currentUserRole === "OWNER" && (
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="ml-1 bg-[#0058be] text-white text-xs font-medium px-3.5 h-8 rounded-lg flex items-center gap-1.5 hover:bg-[#2170e4] transition-colors shadow-sm cursor-pointer"
            >
              <Icon name="share" size={16} />
              <span>Share</span>
            </button>
          )}

          {/* Export Menu */}
          <ExportMenu stageRef={stageRef} />

          <div className="w-px h-6 bg-[#c2c6d6] dark:bg-[#334155] mx-1 hidden md:block" />

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 rounded-full p-0.5 border border-[#c2c6d6] dark:border-[#334155] hover:border-[#0058be] transition-colors focus:outline-none cursor-pointer"
              aria-label="User menu"
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

                <div className="px-4 py-2 border-b border-[#c2c6d6]/50 dark:border-[#1e293b]">
                  <p className="text-[11px] text-[#727785] dark:text-[#64748b] mb-1">Simulate Role:</p>
                  <div className="flex gap-1">
                    {(["OWNER", "EDITOR", "VIEWER"] as BoardRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => setCurrentUserRole(r)}
                        className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                          currentUserRole === r
                            ? "bg-[#0058be] text-white"
                            : "bg-[#e2e8f8] dark:bg-[#1e293b] text-[#424754] dark:text-[#94a3b8] hover:bg-[#dce2f3]"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-xs text-[#151c27] dark:text-[#e2e8f0] hover:bg-[#e7eefe] dark:hover:bg-[#1e293b] transition-colors"
                  >
                    <Icon name="dashboard" size={16} />
                    Back to Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      router.push("/login");
                    }}
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

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        boardTitle={currentBoard?.title || "Untitled Board"}
      />
    </>
  );
};
