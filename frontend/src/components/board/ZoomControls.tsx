"use client";

import React from "react";
import { Icon } from "@/components/ui/Icon";
import { useBoardStore } from "@/store/useBoardStore";

export const ZoomControls: React.FC = () => {
  const { scale, setScale, setStagePos } = useBoardStore();

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev / 1.2, 0.2));
  };

  const handleResetZoom = () => {
    setScale(1);
    setStagePos({ x: 0, y: 0 });
  };

  const percentage = Math.round(scale * 100);

  return (
    <div className="absolute bottom-6 right-6 flex items-center gap-2 z-40 bg-white/95 backdrop-blur-sm p-1.5 rounded-xl border border-[#c2c6d6] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-2px_rgba(0,0,0,0.05)]">
      {/* Zoom Out Button */}
      <button
        onClick={handleZoomOut}
        className="w-8 h-8 bg-white border border-[#c2c6d6] shadow-sm rounded-full flex items-center justify-center text-[#424754] hover:bg-[#e7eefe] transition-colors cursor-pointer active:scale-95"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <Icon name="remove" size={18} />
      </button>

      {/* Percentage Indicator & Reset Button */}
      <button
        onClick={handleResetZoom}
        className="h-8 px-3 bg-white border border-[#c2c6d6] shadow-sm rounded-lg flex items-center justify-center font-mono text-xs text-[#151c27] hover:text-[#0058be] cursor-pointer hover:bg-[#e7eefe] transition-colors select-none"
        title="Click to reset zoom to 100%"
      >
        {percentage}%
      </button>

      {/* Zoom In Button */}
      <button
        onClick={handleZoomIn}
        className="w-8 h-8 bg-white border border-[#c2c6d6] shadow-sm rounded-full flex items-center justify-center text-[#424754] hover:bg-[#e7eefe] transition-colors cursor-pointer active:scale-95"
        title="Zoom In"
        aria-label="Zoom In"
      >
        <Icon name="add" size={18} />
      </button>

      {/* Fit to View Button */}
      <button
        onClick={handleResetZoom}
        className="w-8 h-8 bg-white border border-[#c2c6d6] shadow-sm rounded-lg flex items-center justify-center text-[#424754] hover:bg-[#e7eefe] transition-colors cursor-pointer active:scale-95"
        title="Center Canvas"
      >
        <Icon name="center_focus_strong" size={16} />
      </button>
    </div>
  );
};
