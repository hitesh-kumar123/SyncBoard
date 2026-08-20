"use client";

import React, { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { BoardHeader } from "@/components/board/BoardHeader";
import { BoardToolbar } from "@/components/board/BoardToolbar";
import { BoardCanvas } from "@/components/board/BoardCanvas";
import { useBoardStore } from "@/store/useBoardStore";

export default function BoardEditorPage() {
  const params = useParams();
  const boardId = params?.boardId as string;
  const { loadBoard, initializeBoards } = useBoardStore();
  const stageRef = useRef<any>(null);

  useEffect(() => {
    initializeBoards();
    if (boardId) {
      loadBoard(boardId);
    }
  }, [boardId, loadBoard, initializeBoards]);

  return (
    <div className="bg-[#f0f3ff] text-[#151c27] h-screen w-screen overflow-hidden relative select-none">
      {/* Top Navigation */}
      <BoardHeader stageRef={stageRef} />

      {/* Floating Toolbar on the Left */}
      <BoardToolbar />

      {/* Canvas Area with Konva */}
      <BoardCanvas stageRef={stageRef} />
    </div>
  );
}
