"use client";

import React from "react";
import { useCollabStore } from "@/store/useCollabStore";
import { useBoardStore } from "@/store/useBoardStore";

export const LiveCursors: React.FC = () => {
  const { remoteCursors } = useCollabStore();
  const { scale, stagePos } = useBoardStore();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {remoteCursors.map((cursor) => {
        // Convert canvas world coordinates to screen viewport coordinates
        const screenX = cursor.x * scale + stagePos.x;
        const screenY = cursor.y * scale + stagePos.y;

        return (
          <div
            key={cursor.userId}
            className="absolute transition-transform duration-75 ease-out pointer-events-none"
            style={{
              transform: `translate3d(${screenX}px, ${screenY}px, 0)`,
            }}
          >
            {/* SVG Cursor Pointer */}
            <svg
              className="drop-shadow-md"
              fill="none"
              height="24"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.5 3L18.5 12L11 13L8 20L5.5 3Z"
                fill={cursor.userColor || "#0058be"}
                stroke="white"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>

            {/* Name Tag */}
            <div
              className="absolute top-5 left-4 text-[11px] px-2 py-0.5 rounded-md shadow-sm whitespace-nowrap text-white font-semibold select-none border border-white/20"
              style={{
                backgroundColor: cursor.userColor || "#0058be",
              }}
            >
              {cursor.userName}
            </div>
          </div>
        );
      })}
    </div>
  );
};
