"use client";

import React from "react";
import { Icon } from "@/components/ui/Icon";
import { useBoardStore } from "@/store/useBoardStore";
import { cn } from "@/lib/cn";

// Excalidraw Authentic Color Palettes
const STROKE_PALETTE = [
  { name: "Black / Dark", value: "#1e1e1e" },
  { name: "White", value: "#ffffff" },
  { name: "Red", value: "#e03131" },
  { name: "Green", value: "#2f9e44" },
  { name: "Blue", value: "#1971c2" },
  { name: "Orange", value: "#f08c00" },
  { name: "Purple", value: "#9c36b5" },
];

const FILL_PALETTE = [
  { name: "Transparent", value: "transparent" },
  { name: "Soft Red", value: "#ffc9c9" },
  { name: "Soft Green", value: "#b2f2bb" },
  { name: "Soft Blue", value: "#a5d8ff" },
  { name: "Soft Yellow", value: "#ffec99" },
  { name: "Soft Purple", value: "#eebefa" },
  { name: "Solid White", value: "#ffffff" },
];

const STROKE_WIDTHS = [
  { label: "S", value: 2, desc: "Thin" },
  { label: "M", value: 3.5, desc: "Medium" },
  { label: "L", value: 6, desc: "Bold" },
];

const FONT_SIZES = [
  { label: "S", size: 16 },
  { label: "M", size: 22 },
  { label: "L", size: 30 },
];

export const ElementPropertyBar: React.FC = () => {
  const {
    selectedTool,
    selectedElementIds,
    currentBoard,
    currentUserRole,
    activeStrokeColor,
    activeFillColor,
    activeStrokeWidth,
    activeFontSize,
    setActiveStrokeColor,
    setActiveFillColor,
    setActiveStrokeWidth,
    setActiveFontSize,
    deleteElements,
    duplicateSelectedElements,
    bringForward,
    sendBackward,
  } = useBoardStore();

  const isViewer = currentUserRole === "VIEWER";
  if (isViewer) return null;

  const hasSelectedElements = selectedElementIds.length > 0;
  const selectedElements =
    currentBoard?.elements.filter((el) => selectedElementIds.includes(el.id)) || [];

  const isShapeSelected =
    selectedElements.some((el) => el.type === "rectangle" || el.type === "circle") ||
    selectedTool === "rectangle" ||
    selectedTool === "circle";

  const isTextSelected =
    selectedElements.some((el) => el.type === "text") || selectedTool === "text";

  const shouldShow =
    hasSelectedElements ||
    selectedTool === "pencil" ||
    selectedTool === "rectangle" ||
    selectedTool === "circle" ||
    selectedTool === "text";

  if (!shouldShow) return null;

  return (
    <aside className="fixed left-4 top-20 z-40 bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-md border border-[#e2e8f0] dark:border-[#2d2d2d] rounded-2xl p-3 shadow-excalidraw flex flex-col gap-3.5 w-56 animate-in fade-in slide-in-from-left-2">
      {/* Header / Active Tool Status */}
      <div className="flex items-center justify-between border-b border-[#e2e8f0] dark:border-[#2d2d2d] pb-2">
        <span className="text-[11px] font-bold text-[#64748b] dark:text-[#94a3b8] uppercase tracking-wider">
          {hasSelectedElements ? `${selectedElementIds.length} Selected` : `${selectedTool} properties`}
        </span>
        <span className="w-2 h-2 rounded-full bg-[#0058be] dark:bg-[#38bdf8] animate-pulse" />
      </div>

      {/* 1. Stroke / Line Color */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-[#475569] dark:text-[#cbd5e1]">
          Stroke
        </span>
        <div className="flex flex-wrap gap-1.5 items-center">
          {STROKE_PALETTE.map((c) => (
            <button
              key={c.value}
              onClick={() => setActiveStrokeColor(c.value)}
              className={cn(
                "w-6 h-6 rounded-lg border transition-transform hover:scale-110 cursor-pointer flex items-center justify-center",
                activeStrokeColor === c.value
                  ? "ring-2 ring-[#0058be] dark:ring-[#38bdf8] ring-offset-1 border-transparent"
                  : "border-[#cbd5e1] dark:border-[#475569]"
              )}
              style={{ backgroundColor: c.value }}
              title={c.name}
            >
              {activeStrokeColor === c.value && (
                <Icon
                  name="check"
                  size={12}
                  className={c.value === "#ffffff" ? "text-black" : "text-white"}
                />
              )}
            </button>
          ))}
          {/* Custom Color Input */}
          <label className="w-6 h-6 rounded-lg border border-[#cbd5e1] dark:border-[#475569] flex items-center justify-center cursor-pointer hover:bg-[#f1f5f9] dark:hover:bg-[#2d2d2d]" title="Custom Hex Color">
            <Icon name="colorize" size={14} className="text-[#64748b] dark:text-[#94a3b8]" />
            <input
              type="color"
              value={activeStrokeColor}
              onChange={(e) => setActiveStrokeColor(e.target.value)}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      {/* 2. Background Fill (For shapes) */}
      {isShapeSelected && (
        <div className="flex flex-col gap-1.5 pt-1 border-t border-[#e2e8f0] dark:border-[#2d2d2d]">
          <span className="text-[11px] font-semibold text-[#475569] dark:text-[#cbd5e1]">
            Background
          </span>
          <div className="flex flex-wrap gap-1.5 items-center">
            {FILL_PALETTE.map((c) => (
              <button
                key={c.value}
                onClick={() => setActiveFillColor(c.value)}
                className={cn(
                  "w-6 h-6 rounded-lg border transition-transform hover:scale-110 cursor-pointer flex items-center justify-center",
                  activeFillColor === c.value
                    ? "ring-2 ring-[#0058be] dark:ring-[#38bdf8] ring-offset-1 border-transparent"
                    : "border-[#cbd5e1] dark:border-[#475569]",
                  c.value === "transparent" ? "bg-white dark:bg-[#1e1e1e]" : ""
                )}
                style={{
                  backgroundColor: c.value === "transparent" ? undefined : c.value,
                }}
                title={c.name}
              >
                {c.value === "transparent" ? (
                  <Icon name="block" size={12} className="text-red-500" />
                ) : (
                  activeFillColor === c.value && (
                    <Icon name="check" size={12} className="text-black/80" />
                  )
                )}
              </button>
            ))}
            {/* Custom Fill Input */}
            <label className="w-6 h-6 rounded-lg border border-[#cbd5e1] dark:border-[#475569] flex items-center justify-center cursor-pointer hover:bg-[#f1f5f9] dark:hover:bg-[#2d2d2d]" title="Custom Fill Color">
              <Icon name="palette" size={14} className="text-[#64748b] dark:text-[#94a3b8]" />
              <input
                type="color"
                value={activeFillColor === "transparent" ? "#ffffff" : activeFillColor}
                onChange={(e) => setActiveFillColor(e.target.value)}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      )}

      {/* 3. Stroke Width */}
      <div className="flex flex-col gap-1.5 pt-1 border-t border-[#e2e8f0] dark:border-[#2d2d2d]">
        <span className="text-[11px] font-semibold text-[#475569] dark:text-[#cbd5e1]">
          Stroke Width
        </span>
        <div className="flex gap-1 bg-[#f1f5f9] dark:bg-[#2d2d2d] p-1 rounded-xl">
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w.value}
              onClick={() => setActiveStrokeWidth(w.value)}
              className={cn(
                "flex-1 py-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer",
                activeStrokeWidth === w.value
                  ? "bg-white dark:bg-[#1e1e1e] text-[#0058be] dark:text-[#38bdf8] shadow-sm"
                  : "text-[#64748b] dark:text-[#94a3b8] hover:text-[#1e293b]"
              )}
              title={w.desc}
            >
              <span>{w.label}</span>
              <span
                className="w-2.5 bg-current rounded-full"
                style={{ height: `${Math.min(w.value, 4)}px` }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 4. Font Size (If Text) */}
      {isTextSelected && (
        <div className="flex flex-col gap-1.5 pt-1 border-t border-[#e2e8f0] dark:border-[#2d2d2d]">
          <span className="text-[11px] font-semibold text-[#475569] dark:text-[#cbd5e1]">
            Font Size
          </span>
          <div className="flex gap-1 bg-[#f1f5f9] dark:bg-[#2d2d2d] p-1 rounded-xl">
            {FONT_SIZES.map((f) => (
              <button
                key={f.size}
                onClick={() => setActiveFontSize(f.size)}
                className={cn(
                  "flex-1 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer",
                  activeFontSize === f.size
                    ? "bg-white dark:bg-[#1e1e1e] text-[#0058be] dark:text-[#38bdf8] shadow-sm"
                    : "text-[#64748b] dark:text-[#94a3b8] hover:text-[#1e293b]"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Excalidraw Quick Actions (When Elements Selected) */}
      {hasSelectedElements && (
        <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0] dark:border-[#2d2d2d]">
          <button
            onClick={duplicateSelectedElements}
            className="p-1.5 text-[#64748b] dark:text-[#94a3b8] hover:text-[#0058be] dark:hover:text-[#38bdf8] hover:bg-[#f1f5f9] dark:hover:bg-[#2d2d2d] rounded-lg transition-colors cursor-pointer"
            title="Duplicate (Ctrl+D)"
          >
            <Icon name="content_copy" size={16} />
          </button>

          <button
            onClick={bringForward}
            className="p-1.5 text-[#64748b] dark:text-[#94a3b8] hover:text-[#0058be] dark:hover:text-[#38bdf8] hover:bg-[#f1f5f9] dark:hover:bg-[#2d2d2d] rounded-lg transition-colors cursor-pointer"
            title="Bring to Front"
          >
            <Icon name="flip_to_front" size={16} />
          </button>

          <button
            onClick={sendBackward}
            className="p-1.5 text-[#64748b] dark:text-[#94a3b8] hover:text-[#0058be] dark:hover:text-[#38bdf8] hover:bg-[#f1f5f9] dark:hover:bg-[#2d2d2d] rounded-lg transition-colors cursor-pointer"
            title="Send to Back"
          >
            <Icon name="flip_to_back" size={16} />
          </button>

          <button
            onClick={() => deleteElements(selectedElementIds)}
            className="p-1.5 text-[#e03131] hover:bg-[#ffe3e3] dark:hover:bg-[#e03131]/20 rounded-lg transition-colors cursor-pointer"
            title="Delete (Del)"
          >
            <Icon name="delete" size={16} />
          </button>
        </div>
      )}
    </aside>
  );
};
