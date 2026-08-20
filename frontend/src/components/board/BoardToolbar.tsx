"use client";

import React from "react";
import { CanvasTool } from "@/types/board";
import { Icon } from "@/components/ui/Icon";
import { useBoardStore } from "@/store/useBoardStore";
import { cn } from "@/lib/cn";

export const BoardToolbar: React.FC = () => {
  const { selectedTool, setSelectedTool, currentUserRole, setSelectedElementIds } = useBoardStore();
  const isViewer = currentUserRole === "VIEWER";

  const handleToolSelect = (tool: CanvasTool) => {
    setSelectedTool(tool);
    if (tool !== "select") {
      setSelectedElementIds([]);
    }
  };

  const tools: { id: CanvasTool; label: string; icon: string; shortcut: string }[] = [
    { id: "pan", label: "Hand (Pan)", icon: "pan_tool", shortcut: "H / Space" },
    { id: "select", label: "Selection", icon: "near_me", shortcut: "V" },
    { id: "rectangle", label: "Rectangle", icon: "crop_square", shortcut: "R" },
    { id: "circle", label: "Circle", icon: "circle", shortcut: "C" },
    { id: "pencil", label: "Draw (Pen)", icon: "edit", shortcut: "P" },
    { id: "text", label: "Text", icon: "title", shortcut: "T" },
    { id: "eraser", label: "Eraser", icon: "ink_eraser", shortcut: "E" },
  ];

  if (isViewer) {
    return (
      <nav className="fixed top-16 left-1/2 -translate-x-1/2 rounded-2xl h-12 bg-white dark:bg-[#1e1e1e] border border-[#e2e8f0] dark:border-[#2d2d2d] shadow-excalidraw flex items-center gap-1.5 px-3 z-40">
        <button
          onClick={() => handleToolSelect("pan")}
          className={cn(
            "h-9 px-3 flex items-center gap-2 rounded-xl transition-all cursor-pointer font-medium text-xs",
            selectedTool === "pan"
              ? "bg-[#0058be] text-white shadow-sm"
              : "text-[#424754] dark:text-[#94a3b8] hover:bg-[#f1f5f9] dark:hover:bg-[#2d2d2d]"
          )}
          title="Pan (View Only)"
        >
          <Icon name="pan_tool" size={18} filled={selectedTool === "pan"} />
          <span>Pan (View Only)</span>
        </button>
      </nav>
    );
  }

  return (
    <nav className="fixed top-16 left-1/2 -translate-x-1/2 rounded-2xl h-12 bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-md border border-[#e2e8f0] dark:border-[#2d2d2d] shadow-excalidraw flex items-center gap-1 px-2 z-40">
      {tools.map((tool, index) => {
        const isActive = selectedTool === tool.id;

        return (
          <button
            key={tool.id}
            onClick={() => handleToolSelect(tool.id)}
            className={cn(
              "w-9 h-9 flex flex-col items-center justify-center rounded-xl transition-all group relative cursor-pointer",
              isActive
                ? "bg-[#0058be] dark:bg-[#38bdf8] text-white dark:text-[#0f172a] shadow-sm font-bold"
                : "text-[#424754] dark:text-[#94a3b8] hover:bg-[#f1f5f9] dark:hover:bg-[#2d2d2d] hover:text-[#151c27] dark:hover:text-white"
            )}
            title={`${tool.label} (${tool.shortcut})`}
            aria-label={tool.label}
          >
            <Icon name={tool.icon} size={20} filled={isActive} />

            {/* Shortcut number badge */}
            <span
              className={cn(
                "absolute -top-1.5 -right-1 text-[9px] font-mono px-1 rounded-full font-semibold",
                isActive
                  ? "bg-[#003c82] dark:bg-[#0284c7] text-white"
                  : "bg-[#e2e8f0] dark:bg-[#334155] text-[#64748b] dark:text-[#94a3b8]"
              )}
            >
              {index + 1}
            </span>

            {/* Hover Tooltip */}
            <div className="absolute top-full mt-2.5 px-2 py-1 bg-[#1e293b] text-white text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-md transition-opacity z-50">
              {tool.label} <span className="text-[#94a3b8]">({tool.shortcut})</span>
            </div>
          </button>
        );
      })}
    </nav>
  );
};
