"use client";

import React from "react";
import { Icon } from "@/components/ui/Icon";
import { useBoardStore } from "@/store/useBoardStore";

export const ViewerModeBanner: React.FC = () => {
  const { currentUserRole, setCurrentUserRole } = useBoardStore();

  if (currentUserRole !== "VIEWER") return null;

  return (
    <div className="bg-[#e2e8f8] border-b border-[#c2c6d6]/60 px-4 py-2 flex items-center justify-between z-30 text-[#151c27] text-xs font-medium">
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 bg-[#dce2f3] text-[#424754] rounded font-mono font-bold text-[10px] tracking-wide uppercase">
          View Only
        </span>
        <span className="text-[#424754]">
          You have view-only access to this board. Canvas panning and zooming are enabled.
        </span>
      </div>

      <button
        onClick={() => setCurrentUserRole("EDITOR")}
        className="text-[#0058be] hover:text-[#2170e4] text-xs hover:underline flex items-center gap-1 cursor-pointer font-semibold"
        title="Switch to Editor role for demo testing"
      >
        <Icon name="swap_horiz" size={14} />
        Switch to Editor Mode (Demo)
      </button>
    </div>
  );
};
