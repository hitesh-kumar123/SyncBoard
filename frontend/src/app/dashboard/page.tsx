"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { BoardCard } from "@/components/dashboard/BoardCard";
import { CreateBoardModal } from "@/components/dashboard/CreateBoardModal";
import { EmptyBoardsState } from "@/components/dashboard/EmptyBoardsState";
import { Icon } from "@/components/ui/Icon";
import { useBoardStore } from "@/store/useBoardStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useThemeStore } from "@/store/useThemeStore";

export default function DashboardPage() {
  const router = useRouter();
  const { boards, initializeBoards } = useBoardStore();
  const { user, initializeAuth } = useAuthStore();
  const { notifications, initializeNotifications, markAsRead } = useNotificationStore();
  const { initializeTheme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "MINE" | "SHARED">("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    initializeAuth();
    initializeBoards();
    initializeNotifications();
    initializeTheme();
  }, [initializeAuth, initializeBoards, initializeNotifications, initializeTheme]);

  const userEmail = user?.email?.toLowerCase().trim() || "";

  // Categorize boards based on user email
  const myBoards = boards.filter((b) => {
    return (
      b.owner?.email?.toLowerCase().trim() === userEmail ||
      b.owner?.id === user?.id
    );
  });

  const sharedWithMeBoards = boards.filter((b) => {
    const isOwner =
      b.owner?.email?.toLowerCase().trim() === userEmail ||
      b.owner?.id === user?.id;
    const isMember = b.collaborators?.some(
      (c) => c.email.toLowerCase().trim() === userEmail
    );
    return !isOwner && isMember;
  });

  // Decide boards to display
  let displayedBoards = boards;
  if (activeTab === "MINE") {
    displayedBoards = myBoards;
  } else if (activeTab === "SHARED") {
    displayedBoards = sharedWithMeBoards;
  } else {
    if (userEmail) {
      const userRelevantBoards = boards.filter((b) => {
        const isOwner = b.owner?.email?.toLowerCase().trim() === userEmail || b.owner?.id === user?.id;
        const isMember = b.collaborators?.some((c) => c.email.toLowerCase().trim() === userEmail);
        return isOwner || isMember;
      });
      displayedBoards = userRelevantBoards.length > 0 ? userRelevantBoards : boards;
    } else {
      displayedBoards = boards;
    }
  }

  const finalFilteredBoards = displayedBoards.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Check for unread invitation notifications
  const userUnreadInvitations = notifications.filter(
    (n) => n.recipientEmail === userEmail && !n.isRead
  );

  return (
    <div className="bg-[#f9f9ff] dark:bg-[#0b1120] text-[#151c27] dark:text-[#f8fafc] min-h-screen flex flex-col pt-12 antialiased transition-colors duration-200">
      {/* Top Navbar */}
      <DashboardNav searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 flex flex-col gap-6">
        {/* Google/Canva-Style New Invitation Alert Banner */}
        {userUnreadInvitations.length > 0 && (
          <div className="bg-gradient-to-r from-[#d8e2ff] to-[#e7eefe] dark:from-[#1e293b] dark:to-[#0f172a] border border-[#0058be]/30 dark:border-[#38bdf8]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#0058be] dark:bg-[#38bdf8] text-white dark:text-[#0f172a] flex items-center justify-center shadow-sm">
                <Icon name="mail" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#004395] dark:text-[#38bdf8]">
                  🎉 You have {userUnreadInvitations.length} new board invitation(s)!
                </span>
                <span className="text-xs text-[#424754] dark:text-[#94a3b8]">
                  {userUnreadInvitations[0].senderName} invited you to collaborate on{" "}
                  <strong className="text-[#151c27] dark:text-white">'{userUnreadInvitations[0].boardTitle}'</strong> as{" "}
                  <span className="uppercase font-semibold text-[#0058be] dark:text-[#38bdf8]">{userUnreadInvitations[0].role}</span>.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => {
                  const target = userUnreadInvitations[0];
                  markAsRead(target.id);
                  router.push(`/board/${target.boardId}`);
                }}
                className="bg-[#0058be] dark:bg-[#38bdf8] text-white dark:text-[#0f172a] text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#2170e4] dark:hover:bg-[#7dd3fc] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>Accept & Open Board</span>
                <Icon name="arrow_forward" size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Page Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#151c27] dark:text-[#f8fafc] tracking-tight font-sans">
              My Boards
            </h1>
            <p className="text-sm text-[#424754] dark:text-[#94a3b8] mt-1">
              Manage and organize your collaborative workspaces.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex bg-[#e2e8f8] dark:bg-[#1e293b] p-1 rounded-lg border border-[#c2c6d6]/60 dark:border-[#334155] text-xs font-medium">
              <button
                onClick={() => setActiveTab("ALL")}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === "ALL"
                    ? "bg-white dark:bg-[#0f172a] text-[#0058be] dark:text-[#38bdf8] font-bold shadow-sm"
                    : "text-[#424754] dark:text-[#94a3b8] hover:text-[#151c27] dark:hover:text-[#f8fafc]"
                }`}
              >
                All ({displayedBoards.length})
              </button>
              <button
                onClick={() => setActiveTab("MINE")}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === "MINE"
                    ? "bg-white dark:bg-[#0f172a] text-[#0058be] dark:text-[#38bdf8] font-bold shadow-sm"
                    : "text-[#424754] dark:text-[#94a3b8] hover:text-[#151c27] dark:hover:text-[#f8fafc]"
                }`}
              >
                Created by Me ({myBoards.length})
              </button>
              <button
                onClick={() => setActiveTab("SHARED")}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  activeTab === "SHARED"
                    ? "bg-white dark:bg-[#0f172a] text-[#0058be] dark:text-[#38bdf8] font-bold shadow-sm"
                    : "text-[#424754] dark:text-[#94a3b8] hover:text-[#151c27] dark:hover:text-[#f8fafc]"
                }`}
              >
                Shared with Me ({sharedWithMeBoards.length})
              </button>
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#0058be] dark:bg-[#2170e4] text-white font-medium text-sm px-4 py-2.5 rounded-lg hover:bg-[#2170e4] dark:hover:bg-[#38bdf8] dark:hover:text-[#0f172a] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Icon name="add" size={18} />
              Create Board
            </button>
          </div>
        </header>

        {/* Boards Grid or Empty State */}
        {finalFilteredBoards.length === 0 ? (
          <EmptyBoardsState
            onCreateClick={() => setIsCreateModalOpen(true)}
            isSearching={!!searchQuery}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Create New Board Card */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#f0f3ff] dark:bg-[#1e293b]/60 border border-dashed border-[#c2c6d6] dark:border-[#334155] rounded-xl p-6 flex flex-col items-center justify-center h-[220px] hover:border-[#0058be] dark:hover:border-[#38bdf8] hover:bg-[#e7eefe]/50 dark:hover:bg-[#1e293b] transition-all group focus:outline-none focus:ring-2 focus:ring-[#0058be]/20 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#e7eefe] dark:bg-[#0f172a] flex items-center justify-center mb-2 group-hover:bg-[#0058be]/10 dark:group-hover:bg-[#38bdf8]/10 group-hover:text-[#0058be] dark:group-hover:text-[#38bdf8] transition-colors text-[#424754] dark:text-[#94a3b8]">
                <Icon name="add" size={24} />
              </div>
              <span className="text-lg font-semibold text-[#151c27] dark:text-[#f8fafc] group-hover:text-[#0058be] dark:group-hover:text-[#38bdf8] transition-colors">
                New Board
              </span>
              <span className="text-xs text-[#424754] dark:text-[#94a3b8] mt-1">
                Start with a blank canvas
              </span>
            </button>

            {/* Board Cards */}
            {finalFilteredBoards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        )}
      </main>

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
