"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Board } from "@/types/board";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { useBoardStore } from "@/store/useBoardStore";
import { useAuthStore } from "@/store/useAuthStore";

interface BoardCardProps {
  board: Board;
}

export const BoardCard: React.FC<BoardCardProps> = ({ board }) => {
  const router = useRouter();
  const { deleteBoard, duplicateBoard, updateBoardTitle } = useBoardStore();
  const { user } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [titleInput, setTitleInput] = useState(board.title);

  const currentUserEmail = user?.email?.toLowerCase().trim() || "";
  const isOwner =
    board.owner?.email?.toLowerCase().trim() === currentUserEmail ||
    board.owner?.id === user?.id;

  const myCollaboratorRecord = board.collaborators?.find(
    (c) => c.email.toLowerCase().trim() === currentUserEmail
  );

  const userRole = isOwner ? "OWNER" : myCollaboratorRecord?.role || "VIEWER";

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("input")) {
      return;
    }
    router.push(`/board/${board.id}`);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleInput.trim()) {
      updateBoardTitle(board.id, titleInput.trim());
    }
    setIsRenaming(false);
  };

  const roleBadge = isOwner ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#d8e2ff] dark:bg-[#004395]/40 text-[#004395] dark:text-[#adc6ff] border border-[#0058be]/20 dark:border-[#38bdf8]/20">
      <Icon name="verified_user" size={12} />
      Owner
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e1e0ff] dark:bg-[#2f2ebe]/40 text-[#2f2ebe] dark:text-[#c0c1ff] border border-[#6063ee]/20 dark:border-[#818cf8]/20">
      <Icon name={userRole === "EDITOR" ? "edit" : "visibility"} size={12} />
      {userRole === "EDITOR" ? "Shared (Editor)" : "Shared (Viewer)"}
    </span>
  );

  return (
    <article
      onClick={handleCardClick}
      className="bg-white dark:bg-[#131b2e] border border-[#c2c6d6] dark:border-[#1e293b] rounded-xl p-4 flex flex-col h-[220px] hover:border-[#0058be] dark:hover:border-[#38bdf8] hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.4)] transition-all cursor-pointer group relative"
    >
      {/* Top Header */}
      <div className="flex justify-between items-start mb-auto">
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-1.5 mb-2">
            {roleBadge}
            <span className="text-[10px] text-[#727785] dark:text-[#64748b] uppercase tracking-wider font-mono font-medium">
              {board.category || "ACTIVE"}
            </span>
          </div>

          {isRenaming ? (
            <form onSubmit={handleRenameSubmit} className="mt-1">
              <input
                type="text"
                autoFocus
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleRenameSubmit}
                className="w-full px-2 py-1 border border-[#0058be] dark:border-[#38bdf8] rounded text-sm text-[#151c27] dark:text-[#f8fafc] bg-white dark:bg-[#1e293b] focus:outline-none"
              />
            </form>
          ) : (
            <h3 className="text-base font-semibold text-[#151c27] dark:text-[#f8fafc] line-clamp-2 leading-snug group-hover:text-[#0058be] dark:group-hover:text-[#38bdf8] transition-colors">
              {board.title}
            </h3>
          )}
        </div>

        {/* 3-dots Menu Button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-[#727785] dark:text-[#94a3b8] hover:text-[#151c27] dark:hover:text-[#f8fafc] p-1 rounded-md hover:bg-[#e7eefe] dark:hover:bg-[#1e293b] transition-colors focus:outline-none cursor-pointer"
            aria-label="Board actions"
          >
            <Icon name="more_horiz" size={20} />
          </button>

          {showMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#0f172a] border border-[#c2c6d6] dark:border-[#1e293b] rounded-lg shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.5)] py-1 z-30 animate-in fade-in zoom-in-95"
            >
              {isOwner && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setIsRenaming(true);
                  }}
                  className="w-full text-left px-3 py-1.5 text-[#151c27] dark:text-[#f8fafc] hover:bg-[#e7eefe] dark:hover:bg-[#1e293b] transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Icon name="edit" size={16} />
                  Rename
                </button>
              )}
              <button
                onClick={() => {
                  setShowMenu(false);
                  duplicateBoard(board.id);
                }}
                className="w-full text-left px-3 py-1.5 text-[#151c27] dark:text-[#f8fafc] hover:bg-[#e7eefe] dark:hover:bg-[#1e293b] transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="content_copy" size={16} />
                Duplicate
              </button>
              {isOwner && (
                <>
                  <div className="w-full h-px bg-[#c2c6d6] dark:bg-[#1e293b] my-1" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (confirm(`Delete board "${board.title}"?`)) {
                        deleteBoard(board.id);
                      }
                    }}
                    className="w-full text-left px-3 py-1.5 text-[#ba1a1a] dark:text-[#f87171] hover:bg-[#ffdad6]/40 dark:hover:bg-[#991b1b]/20 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Icon name="delete" size={16} />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Details */}
      <div className="mt-4 flex flex-col gap-2 border-t border-[#c2c6d6]/50 dark:border-[#1e293b] pt-3">
        <div className="flex items-center justify-between text-[#424754] dark:text-[#94a3b8]">
          <div className="flex items-center gap-1 text-xs">
            <Icon name="schedule" size={14} />
            <span>{board.updatedAt || "Recently"}</span>
          </div>

          <span className="text-[11px] text-[#727785] dark:text-[#64748b]">
            {board.elements?.length || 0} items
          </span>
        </div>

        <div className="flex items-center justify-between">
          {/* Owner Info */}
          <div className="flex items-center gap-1.5 min-w-0">
            <Avatar
              name={board.owner?.name || "Owner"}
              src={board.owner?.avatarUrl}
              size="xs"
              color={board.owner?.color || "#0058be"}
            />
            <span className="text-xs font-medium text-[#151c27] dark:text-[#f8fafc] truncate max-w-[110px]">
              {isOwner ? "You (Owner)" : board.owner?.name || "Owner"}
            </span>
          </div>

          {/* Collaborator Avatars Stack */}
          {board.collaborators && board.collaborators.length > 1 && (
            <div className="flex -space-x-1.5 items-center" title={`${board.collaborators.length} collaborators`}>
              {board.collaborators.slice(0, 3).map((collab, index) => (
                <div key={collab.id || collab.email || index} className="relative" style={{ zIndex: 20 - index }}>
                  <Avatar
                    name={collab.name}
                    src={collab.avatarUrl}
                    size="xs"
                    color={collab.color}
                    className="border-2 border-white dark:border-[#131b2e] ring-1 ring-black/5"
                  />
                </div>
              ))}
              {board.collaborators.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-[#e7eefe] dark:bg-[#1e293b] text-[#0058be] dark:text-[#38bdf8] border-2 border-white dark:border-[#131b2e] flex items-center justify-center text-[9px] font-bold z-0">
                  +{board.collaborators.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
