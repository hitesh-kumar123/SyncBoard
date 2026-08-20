import React from "react";
import { Icon } from "@/components/ui/Icon";

interface EmptyBoardsStateProps {
  onCreateClick: () => void;
  isSearching?: boolean;
}

export const EmptyBoardsState: React.FC<EmptyBoardsStateProps> = ({
  onCreateClick,
  isSearching = false,
}) => {
  return (
    <div className="w-full py-16 px-6 bg-[#f0f3ff] border border-dashed border-[#c2c6d6] rounded-2xl flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-[#e7eefe] flex items-center justify-center text-[#0058be] mb-4 shadow-sm">
        <Icon name={isSearching ? "search_off" : "dashboard_customize"} size={32} />
      </div>

      <h3 className="text-xl font-bold text-[#151c27] mb-1">
        {isSearching ? "No boards found" : "No boards yet"}
      </h3>
      <p className="text-sm text-[#424754] max-w-sm mb-6">
        {isSearching
          ? "We couldn't find any boards matching your search. Try different keywords or create a new one."
          : "Create your first whiteboard to start collaborating, wireframing, and brainstorming with your team."}
      </p>

      <button
        onClick={onCreateClick}
        className="bg-[#0058be] text-white font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-[#2170e4] transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
      >
        <Icon name="add" size={18} />
        Create New Board
      </button>
    </div>
  );
};
