"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { useBoardStore } from "@/store/useBoardStore";

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { createBoard } = useBoardStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const newBoard = createBoard(title.trim(), description.trim());
    setIsSubmitting(false);
    onClose();
    router.push(`/board/${newBoard.id}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Board"
      maxWidth="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#424754] dark:text-[#94a3b8] hover:bg-[#e7eefe] dark:hover:bg-[#1e293b] hover:text-[#151c27] dark:hover:text-white transition-colors cursor-pointer border border-transparent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#0058be] dark:bg-[#38bdf8] text-white dark:text-[#0f172a] hover:bg-[#2170e4] dark:hover:bg-[#7dd3fc] transition-colors shadow-sm cursor-pointer border border-transparent flex items-center gap-1.5 disabled:opacity-50"
          >
            <Icon name="add" size={18} />
            {isSubmitting ? "Creating..." : "Create Board"}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Board Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#424754] dark:text-[#94a3b8] uppercase tracking-wider" htmlFor="boardName">
            Board Name
          </label>
          <input
            id="boardName"
            type="text"
            autoFocus
            autoComplete="off"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q3 Product Roadmap"
            required
            className="w-full bg-white dark:bg-[#1e293b] border border-[#c2c6d6] dark:border-[#334155] rounded-lg px-4 py-2.5 text-sm text-[#151c27] dark:text-[#f8fafc] placeholder:text-[#727785] dark:placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#0058be] dark:focus:ring-[#38bdf8] focus:border-[#0058be] dark:focus:border-[#38bdf8] transition-shadow"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#424754] dark:text-[#94a3b8] uppercase tracking-wider" htmlFor="boardDesc">
            Description <span className="text-[#727785] dark:text-[#64748b] font-normal lowercase">(optional)</span>
          </label>
          <textarea
            id="boardDesc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is the purpose of this board?"
            className="w-full bg-white dark:bg-[#1e293b] border border-[#c2c6d6] dark:border-[#334155] rounded-lg px-4 py-2.5 text-sm text-[#151c27] dark:text-[#f8fafc] placeholder:text-[#727785] dark:placeholder:text-[#64748b] resize-none focus:outline-none focus:ring-2 focus:ring-[#0058be] dark:focus:ring-[#38bdf8] focus:border-[#0058be] dark:focus:border-[#38bdf8] transition-shadow"
          />
        </div>
      </form>
    </Modal>
  );
};
