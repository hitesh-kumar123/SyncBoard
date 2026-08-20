"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useBoardStore } from "@/store/useBoardStore";
import { TextElementData } from "@/types/board";
import { LiveCursors } from "./LiveCursors";
import { ZoomControls } from "./ZoomControls";
import { ViewerModeBanner } from "./ViewerModeBanner";
import { ElementPropertyBar } from "./ElementPropertyBar";
import { Icon } from "@/components/ui/Icon";

// Dynamically import the entire Konva Canvas component client-side with ssr: false
const KonvaCanvasStage = dynamic(
  () => import("./KonvaCanvasStage").then((mod) => mod.KonvaCanvasStage),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-white dark:bg-[#121212]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-7 h-7 border-2 border-[#0058be] dark:border-[#38bdf8] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#64748b] dark:text-[#94a3b8] font-medium">Loading Board...</span>
        </div>
      </div>
    ),
  }
);

interface BoardCanvasProps {
  stageRef: React.RefObject<any>;
}

export const BoardCanvas: React.FC<BoardCanvasProps> = ({ stageRef }) => {
  const {
    scale,
    stagePos,
    updateElement,
    undo,
    redo,
    selectedElementIds,
    deleteElements,
    selectedTool,
    setSelectedTool,
    currentUserRole,
    duplicateSelectedElements,
  } = useBoardStore();

  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState("");
  const [editingTextPos, setEditingTextPos] = useState({ x: 0, y: 0 });
  const [eraserCursorPos, setEraserCursorPos] = useState<{ x: number; y: number } | null>(null);

  const isViewer = currentUserRole === "VIEWER";

  // Handle window resizing
  useEffect(() => {
    const updateSize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 48,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (!isViewer && selectedElementIds.length > 0) {
          e.preventDefault();
          deleteElements(selectedElementIds);
        }
      } else if (e.key === "d" && (e.ctrlKey || e.metaKey)) {
        if (!isViewer && selectedElementIds.length > 0) {
          e.preventDefault();
          duplicateSelectedElements();
        }
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        if (!isViewer) {
          e.preventDefault();
          undo();
        }
      } else if (
        (e.key === "y" && (e.ctrlKey || e.metaKey)) ||
        (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey)
      ) {
        if (!isViewer) {
          e.preventDefault();
          redo();
        }
      } else if (e.key === "1") {
        setSelectedTool("pan");
      } else if (e.key === "2" || e.key === "v" || e.key === "V") {
        setSelectedTool("select");
      } else if (e.key === "3" || e.key === "r" || e.key === "R") {
        if (!isViewer) setSelectedTool("rectangle");
      } else if (e.key === "4" || e.key === "c" || e.key === "C") {
        if (!isViewer) setSelectedTool("circle");
      } else if (e.key === "5" || e.key === "p" || e.key === "P") {
        if (!isViewer) setSelectedTool("pencil");
      } else if (e.key === "6" || e.key === "t" || e.key === "T") {
        if (!isViewer) setSelectedTool("text");
      } else if (e.key === "7" || e.key === "e" || e.key === "E") {
        if (!isViewer) setSelectedTool("eraser");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isViewer, selectedElementIds, deleteElements, duplicateSelectedElements, undo, redo, setSelectedTool]);

  const handleTextDblClick = (e: any, element: TextElementData) => {
    if (isViewer) return;
    const stage = stageRef.current;
    if (!stage) return;

    const screenX = element.x * scale + stagePos.x;
    const screenY = element.y * scale + stagePos.y;

    setEditingTextPos({ x: screenX, y: screenY });
    setEditingTextValue(element.text);
    setEditingTextId(element.id);
  };

  const handleTextEditBlur = () => {
    if (editingTextId && editingTextValue.trim()) {
      updateElement(editingTextId, { text: editingTextValue });
    }
    setEditingTextId(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (selectedTool === "eraser") {
      setEraserCursorPos({ x: e.clientX, y: e.clientY - 48 });
    } else if (eraserCursorPos) {
      setEraserCursorPos(null);
    }
  };

  return (
    <main
      onMouseMove={handleCanvasMouseMove}
      onMouseLeave={() => setEraserCursorPos(null)}
      className="w-screen h-[calc(100vh-48px)] mt-[48px] relative overflow-hidden bg-white dark:bg-[#121212] select-none transition-colors duration-200"
    >
      {/* Excalidraw Dot Grid Background */}
      <div className="absolute inset-0 excalidraw-grid pointer-events-none opacity-80" />

      {/* Viewer Mode Banner if active */}
      <ViewerModeBanner />

      {/* Excalidraw Left Floating Property Sidebar */}
      <ElementPropertyBar />

      {/* Dynamic Konva Canvas Stage */}
      <KonvaCanvasStage
        stageRef={stageRef}
        dimensions={dimensions}
        onTextDblClick={handleTextDblClick}
      />

      {/* Custom Excalidraw Eraser Ring Cursor */}
      {selectedTool === "eraser" && eraserCursorPos && (
        <div
          className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            left: `${eraserCursorPos.x}px`,
            top: `${eraserCursorPos.y + 48}px`,
          }}
        >
          <div className="w-8 h-8 rounded-full border-2 border-[#e03131] bg-[#e03131]/20 backdrop-blur-[1px] shadow-sm flex items-center justify-center animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e03131]" />
          </div>
        </div>
      )}

      {/* Inline Text Editor Overlay */}
      {editingTextId && (
        <div
          className="absolute z-40"
          style={{
            left: `${editingTextPos.x}px`,
            top: `${editingTextPos.y}px`,
          }}
        >
          <textarea
            autoFocus
            value={editingTextValue}
            onChange={(e) => setEditingTextValue(e.target.value)}
            onBlur={handleTextEditBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleTextEditBlur();
              }
            }}
            className="p-1 bg-white dark:bg-[#1e1e1e] border-2 border-[#0058be] dark:border-[#38bdf8] rounded-lg font-sans text-[#151c27] dark:text-[#f8fafc] focus:outline-none shadow-excalidraw resize-none"
            style={{
              fontSize: "20px",
              minWidth: "200px",
              minHeight: "40px",
            }}
          />
        </div>
      )}

      {/* Live Remote Cursors */}
      <LiveCursors />

      {/* Zoom / Pan Controls (Bottom Right) */}
      <ZoomControls />
    </main>
  );
};
