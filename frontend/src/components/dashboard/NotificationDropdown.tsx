"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { useNotificationStore, BoardNotification } from "@/store/useNotificationStore";
import { useAuthStore } from "@/store/useAuthStore";

export const NotificationDropdown: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { notifications, markAsRead, markAllAsRead, initializeNotifications } =
    useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeNotifications();
  }, [initializeNotifications]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const userEmail = user?.email?.toLowerCase().trim() || "";

  // Notifications relevant to current logged in user
  const userNotifications = notifications.filter(
    (n) => n.recipientEmail === userEmail
  );

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const handleOpenBoard = (notif: BoardNotification) => {
    markAsRead(notif.id);
    setIsOpen(false);
    router.push(`/board/${notif.boardId}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e2e8f8] dark:hover:bg-[#1e293b] transition-colors text-[#424754] dark:text-[#94a3b8] relative cursor-pointer"
        title="Notifications & Invitations"
        aria-label="Notifications"
      >
        <Icon name="notifications" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#ba1a1a] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0f172a] border border-[#c2c6d6] dark:border-[#1e293b] rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.6)] py-2 z-50 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-[#c2c6d6]/60 dark:border-[#1e293b] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Icon name="notifications_active" size={18} className="text-[#0058be] dark:text-[#38bdf8]" />
              <h4 className="text-sm font-bold text-[#151c27] dark:text-[#f8fafc]">Invitations & Activity</h4>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-[#0058be] dark:text-[#38bdf8] hover:underline cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#c2c6d6]/40 dark:divide-[#1e293b]">
            {userNotifications.length === 0 ? (
              <div className="p-6 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#f0f3ff] dark:bg-[#1e293b] text-[#727785] dark:text-[#94a3b8] flex items-center justify-center">
                  <Icon name="mail" size={20} />
                </div>
                <p className="text-xs font-semibold text-[#151c27] dark:text-[#f8fafc]">No new invitations</p>
                <p className="text-[11px] text-[#727785] dark:text-[#64748b]">
                  When team members share boards with {userEmail || "you"}, you will be notified here.
                </p>
              </div>
            ) : (
              userNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 flex flex-col gap-2 hover:bg-[#f0f3ff] dark:hover:bg-[#1e293b]/60 transition-colors ${
                    !n.isRead ? "bg-[#e7eefe]/40 dark:bg-[#1e293b]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={n.senderName}
                      size="sm"
                      color="#0058be"
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#151c27] dark:text-[#e2e8f0] leading-relaxed">
                        <span className="font-bold text-[#0058be] dark:text-[#38bdf8]">{n.senderName}</span>{" "}
                        invited you to collaborate on{" "}
                        <span className="font-bold text-[#151c27] dark:text-white">'{n.boardTitle}'</span> as{" "}
                        <span className="font-semibold uppercase text-[#0058be] dark:text-[#38bdf8]">
                          {n.role}
                        </span>
                        .
                      </p>
                      <span className="text-[10px] text-[#727785] dark:text-[#64748b] mt-1 block">
                        {n.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      onClick={() => handleOpenBoard(n)}
                      className="px-3 py-1.5 bg-[#0058be] dark:bg-[#38bdf8] text-white dark:text-[#0f172a] text-xs font-semibold rounded-lg hover:bg-[#2170e4] dark:hover:bg-[#7dd3fc] transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      <span>Open Board</span>
                      <Icon name="arrow_forward" size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
