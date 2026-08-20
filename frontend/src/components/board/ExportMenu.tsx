"use client";

import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { useBoardStore } from "@/store/useBoardStore";
import { exportBoardAsJson, exportBoardAsSvg, exportCanvasAsPng } from "@/lib/exportUtils";

interface ExportMenuProps {
  stageRef?: any;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ stageRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { currentBoard } = useBoardStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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

  const handleExportPng = () => {
    if (!currentBoard) return;
    exportCanvasAsPng(stageRef?.current, currentBoard.title);
    setIsOpen(false);
  };

  const handleExportSvg = () => {
    if (!currentBoard) return;
    exportBoardAsSvg(currentBoard.elements, currentBoard.title);
    setIsOpen(false);
  };

  const handleExportJson = () => {
    if (!currentBoard) return;
    exportBoardAsJson(currentBoard);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 h-8 bg-white hover:bg-[#e7eefe] text-[#151c27] text-xs font-medium rounded-lg transition-colors border border-[#c2c6d6] cursor-pointer"
        title="Export board"
      >
        <Icon name="download" size={16} />
        <span className="hidden sm:inline">Export</span>
        <Icon name="expand_more" size={14} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-[#c2c6d6] rounded-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] p-2 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1 border-b border-[#c2c6d6]/60 mb-1">
            <span className="text-[11px] text-[#424754] uppercase tracking-wider font-semibold">
              Export As
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {/* PNG */}
            <button
              onClick={handleExportPng}
              className="flex items-center gap-3 px-3 py-2 text-left hover:bg-[#f0f3ff] rounded-lg transition-colors w-full group cursor-pointer"
            >
              <Icon
                name="image"
                size={20}
                className="text-[#424754] group-hover:text-[#0058be] transition-colors"
              />
              <div className="flex flex-col">
                <span className="text-sm text-[#151c27] group-hover:text-[#0058be] transition-colors font-medium">
                  PNG Image
                </span>
                <span className="text-[11px] text-[#727785]">High resolution</span>
              </div>
            </button>

            {/* SVG */}
            <button
              onClick={handleExportSvg}
              className="flex items-center gap-3 px-3 py-2 text-left hover:bg-[#f0f3ff] rounded-lg transition-colors w-full group cursor-pointer"
            >
              <Icon
                name="polyline"
                size={20}
                className="text-[#424754] group-hover:text-[#0058be] transition-colors"
              />
              <div className="flex flex-col">
                <span className="text-sm text-[#151c27] group-hover:text-[#0058be] transition-colors font-medium">
                  SVG Vector
                </span>
                <span className="text-[11px] text-[#727785]">Scalable format</span>
              </div>
            </button>

            {/* JSON */}
            <button
              onClick={handleExportJson}
              className="flex items-center gap-3 px-3 py-2 text-left hover:bg-[#f0f3ff] rounded-lg transition-colors w-full group cursor-pointer"
            >
              <Icon
                name="data_object"
                size={20}
                className="text-[#424754] group-hover:text-[#0058be] transition-colors"
              />
              <div className="flex flex-col">
                <span className="text-sm text-[#151c27] group-hover:text-[#0058be] transition-colors font-medium">
                  JSON Data
                </span>
                <span className="text-[11px] text-[#727785]">Raw board structure</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
