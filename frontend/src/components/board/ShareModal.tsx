"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { BoardRole, Collaborator } from "@/types/board";
import { useBoardStore } from "@/store/useBoardStore";
import { useCollabStore } from "@/store/useCollabStore";
import { useNotificationStore } from "@/store/useNotificationStore";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardTitle: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  boardTitle,
}) => {
  const { currentBoard, inviteCollaboratorToBoard, updateCollaboratorRoleInBoard, removeCollaboratorFromBoard } = useBoardStore();
  const { collaborators } = useCollabStore();
  const { addInvitationNotification } = useNotificationStore();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<BoardRole>("EDITOR");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;

    const invited = inviteCollaboratorToBoard(email, inviteRole);
    if (currentBoard) {
      addInvitationNotification(email, currentBoard.id, currentBoard.title, inviteRole);
    }
    setInviteEmail("");
    setFeedback(`Success! Added ${invited.name} (${email}) as ${inviteRole.toLowerCase()}`);
    setTimeout(() => setFeedback(""), 4000);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && currentBoard) {
      const url = `${window.location.origin}/board/${currentBoard.id}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const currentCollaborators = currentBoard?.collaborators || collaborators;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Share '${boardTitle}'`}
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full">
          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0058be] dark:text-[#38bdf8] hover:bg-[#e7eefe] dark:hover:bg-[#1e293b] rounded-lg transition-colors border border-[#c2c6d6] dark:border-[#334155] cursor-pointer"
          >
            <Icon name={copiedLink ? "check" : "link"} size={16} />
            <span>{copiedLink ? "Link Copied!" : "Copy Board Link"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-[#0058be] dark:bg-[#38bdf8] text-white dark:text-[#0f172a] text-sm font-semibold px-6 py-2 rounded-lg hover:bg-[#2170e4] dark:hover:bg-[#7dd3fc] transition-colors shadow-sm cursor-pointer"
          >
            Done
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Invite Form */}
        <form onSubmit={handleInvite} className="flex gap-2.5">
          <div className="relative flex-1">
            <input
              type="email"
              placeholder="Add email address (e.g. user2@example.com)..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full bg-white dark:bg-[#1e293b] border border-[#c2c6d6] dark:border-[#334155] rounded-lg px-4 py-2.5 text-sm text-[#151c27] dark:text-[#f8fafc] placeholder:text-[#727785] dark:placeholder:text-[#64748b] focus:outline-none focus:border-[#0058be] dark:focus:border-[#38bdf8] focus:ring-2 focus:ring-[#0058be]/20 transition-all"
            />
          </div>

          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as BoardRole)}
            className="bg-white dark:bg-[#1e293b] border border-[#c2c6d6] dark:border-[#334155] rounded-lg px-3 py-2.5 text-xs font-medium text-[#151c27] dark:text-[#f8fafc] focus:outline-none focus:border-[#0058be] dark:focus:border-[#38bdf8] cursor-pointer"
          >
            <option value="EDITOR">Editor</option>
            <option value="VIEWER">Viewer</option>
          </select>

          <button
            type="submit"
            disabled={!inviteEmail.trim()}
            className="bg-[#0058be] dark:bg-[#38bdf8] text-white dark:text-[#0f172a] text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#2170e4] dark:hover:bg-[#7dd3fc] transition-colors cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1"
          >
            <Icon name="person_add" size={16} />
            <span>Invite</span>
          </button>
        </form>

        {feedback && (
          <div className="p-3 bg-[#d8e2ff] dark:bg-[#004395]/40 text-[#004395] dark:text-[#adc6ff] rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <Icon name="check_circle" size={18} />
            <span>{feedback}</span>
          </div>
        )}

        {/* Access List */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-[#424754] dark:text-[#94a3b8] uppercase tracking-wider">
            People with access ({currentCollaborators.length})
          </h3>

          <div className="flex flex-col divide-y divide-[#c2c6d6]/40 dark:divide-[#1e293b]">
            {currentCollaborators.map((collab: Collaborator) => (
              <div
                key={collab.id || collab.email}
                className="flex items-center justify-between py-3.5 group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Avatar
                    name={collab.name}
                    src={collab.avatarUrl}
                    size="md"
                    color={collab.color}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-[#151c27] dark:text-[#f8fafc] truncate">
                      {collab.name}
                    </span>
                    <span className="text-xs text-[#424754] dark:text-[#94a3b8] truncate">
                      {collab.email}
                    </span>
                  </div>
                </div>

                {/* Role dropdown or Owner label */}
                {collab.role === "OWNER" ? (
                  <span className="text-xs font-semibold text-[#0058be] dark:text-[#38bdf8] px-3 py-1 bg-[#d8e2ff] dark:bg-[#004395]/40 rounded-md flex items-center gap-1">
                    <Icon name="verified_user" size={14} />
                    Owner
                  </span>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === collab.id ? null : collab.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[#151c27] dark:text-[#f8fafc] text-xs font-medium bg-[#f0f3ff] dark:bg-[#1e293b] hover:bg-[#e7eefe] dark:hover:bg-[#334155] rounded-lg transition-colors border border-[#c2c6d6]/60 dark:border-[#334155] cursor-pointer"
                    >
                      <span>{collab.role === "EDITOR" ? "Editor" : "Viewer"}</span>
                      <Icon name="expand_more" size={16} />
                    </button>

                    {activeMenuId === collab.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#0f172a] border border-[#c2c6d6] dark:border-[#1e293b] rounded-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.6)] py-1.5 z-50 animate-in fade-in zoom-in-95">
                        <button
                          onClick={() => {
                            updateCollaboratorRoleInBoard(collab.id, "EDITOR");
                            setActiveMenuId(null);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs hover:bg-[#e7eefe] dark:hover:bg-[#1e293b] flex items-center justify-between cursor-pointer ${
                            collab.role === "EDITOR" ? "font-bold text-[#0058be] dark:text-[#38bdf8]" : "text-[#151c27] dark:text-[#f8fafc]"
                          }`}
                        >
                          Editor
                          {collab.role === "EDITOR" && <Icon name="check" size={14} />}
                        </button>
                        <button
                          onClick={() => {
                            updateCollaboratorRoleInBoard(collab.id, "VIEWER");
                            setActiveMenuId(null);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs hover:bg-[#e7eefe] dark:hover:bg-[#1e293b] flex items-center justify-between cursor-pointer ${
                            collab.role === "VIEWER" ? "font-bold text-[#0058be] dark:text-[#38bdf8]" : "text-[#151c27] dark:text-[#f8fafc]"
                          }`}
                        >
                          Viewer
                          {collab.role === "VIEWER" && <Icon name="check" size={14} />}
                        </button>
                        <div className="w-full h-px bg-[#c2c6d6] dark:bg-[#1e293b] my-1" />
                        <button
                          onClick={() => {
                            removeCollaboratorFromBoard(collab.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs text-[#ba1a1a] dark:text-[#f87171] hover:bg-[#ffdad6]/40 dark:hover:bg-[#991b1b]/20 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Icon name="remove_circle_outline" size={14} />
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
