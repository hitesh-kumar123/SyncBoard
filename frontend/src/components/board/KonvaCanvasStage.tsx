"use client";

import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Circle, Line, Text, Transformer } from "react-konva";
import { useBoardStore } from "@/store/useBoardStore";
import { BoardElement, RectElementData, CircleElementData, FreehandElementData, TextElementData } from "@/types/board";
import { yjsBoardManager } from "@/lib/yjs/yjsManager";

interface KonvaCanvasStageProps {
  stageRef: React.RefObject<any>;
  dimensions: { width: number; height: number };
  onTextDblClick: (e: any, element: TextElementData) => void;
}

export const KonvaCanvasStage: React.FC<KonvaCanvasStageProps> = ({
  stageRef,
  dimensions,
  onTextDblClick,
}) => {
  const {
    currentBoard,
    currentUserRole,
    selectedTool,
    setSelectedTool,
    selectedElementIds,
    setSelectedElementIds,
    activeStrokeColor,
    activeFillColor,
    activeStrokeWidth,
    activeFontSize,
    scale,
    setScale,
    stagePos,
    setStagePos,
    addElement,
    updateElement,
    deleteElements,
  } = useBoardStore();

  const isDrawingRef = useRef(false);
  const isErasingRef = useRef(false);
  const currentPencilIdRef = useRef<string | null>(null);
  const transformerRef = useRef<any>(null);
  const [hoveredEraserId, setHoveredEraserId] = useState<string | null>(null);

  const isViewer = currentUserRole === "VIEWER";

  // Update Transformer selection in Select mode only
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;
    const stage = stageRef.current;

    if (selectedTool !== "select" || isViewer) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
      return;
    }

    const selectedNodes = selectedElementIds
      .map((id) => stage.findOne(`#${id}`))
      .filter(Boolean);

    transformerRef.current.nodes(selectedNodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedElementIds, selectedTool, currentBoard?.elements, stageRef, isViewer]);

  // Zoom on Wheel
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stagePos.x) / oldScale,
      y: (pointer.y - stagePos.y) / oldScale,
    };

    const scaleBy = 1.08;
    const direction = e.evt.deltaY < 0 ? 1 : -1;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.15, Math.min(5, newScale));

    setScale(clampedScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  };

  // Find target element to erase under pointer
  const findElementAtPointer = (stage: any, pointer: { x: number; y: number }): string | null => {
    const worldX = (pointer.x - stagePos.x) / scale;
    const worldY = (pointer.y - stagePos.y) / scale;

    const shape = stage.getIntersection(pointer);
    if (shape && shape.id() && shape.name() !== "bg-grid") {
      return shape.id();
    }

    // Check proximity for pencil lines (within 20px)
    const elements = currentBoard?.elements || [];
    for (const el of elements) {
      if (el.type === "pencil" && (el as FreehandElementData).points) {
        const pts = (el as FreehandElementData).points;
        for (let i = 0; i < pts.length; i += 2) {
          const px = pts[i] + (el.x || 0);
          const py = pts[i + 1] + (el.y || 0);
          if (Math.hypot(px - worldX, py - worldY) < 22) {
            return el.id;
          }
        }
      }
    }

    return null;
  };

  // Stage Mouse Down
  const handleMouseDown = (e: any) => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const clickedOnEmpty = e.target === stage || e.target.name() === "bg-grid";

    if (clickedOnEmpty && selectedTool === "select") {
      setSelectedElementIds([]);
    }

    if (isViewer || selectedTool === "pan") return;

    const worldX = (pointer.x - stagePos.x) / scale;
    const worldY = (pointer.y - stagePos.y) / scale;

    // Eraser Tool
    if (selectedTool === "eraser") {
      isErasingRef.current = true;
      const targetId = findElementAtPointer(stage, pointer);
      if (targetId) {
        deleteElements([targetId]);
        setHoveredEraserId(null);
      }
      return;
    }

    // Pencil / Freehand Tool
    if (selectedTool === "pencil") {
      isDrawingRef.current = true;
      setSelectedElementIds([]); // Never select during pencil draw
      const newId = "pencil-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
      currentPencilIdRef.current = newId;

      const newPencil: FreehandElementData = {
        id: newId,
        type: "pencil",
        x: 0,
        y: 0,
        points: [worldX, worldY],
        strokeColor: activeStrokeColor || "#1e1e1e",
        strokeWidth: activeStrokeWidth || 3,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addElement(newPencil);
      return;
    }

    // Rectangle Tool
    if (selectedTool === "rectangle") {
      const newRect: RectElementData = {
        id: "rect-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        type: "rectangle",
        x: worldX - 90,
        y: worldY - 55,
        width: 180,
        height: 110,
        fillColor: activeFillColor === "transparent" ? "transparent" : activeFillColor || "#a5d8ff",
        strokeColor: activeStrokeColor || "#1e1e1e",
        strokeWidth: activeStrokeWidth || 2,
        cornerRadius: 6,
        opacity: 0.95,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addElement(newRect);
      setSelectedTool("select");
      return;
    }

    // Circle Tool
    if (selectedTool === "circle") {
      const newCircle: CircleElementData = {
        id: "circle-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        type: "circle",
        x: worldX,
        y: worldY,
        radius: 55,
        fillColor: activeFillColor === "transparent" ? "transparent" : activeFillColor || "#ffc9c9",
        strokeColor: activeStrokeColor || "#e03131",
        strokeWidth: activeStrokeWidth || 2,
        opacity: 0.95,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addElement(newCircle);
      setSelectedTool("select");
      return;
    }

    // Text Tool
    if (selectedTool === "text") {
      const newText: TextElementData = {
        id: "text-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        type: "text",
        x: worldX - 80,
        y: worldY - 12,
        text: "Double click to edit text",
        fontSize: activeFontSize || 20,
        strokeColor: activeStrokeColor || "#1e1e1e",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addElement(newText);
      setSelectedTool("select");
      return;
    }
  };

  // Stage Mouse Move
  const handleMouseMove = (e: any) => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const worldX = (pointer.x - stagePos.x) / scale;
    const worldY = (pointer.y - stagePos.y) / scale;

    // Broadcast cursor position to others via Yjs
    yjsBoardManager.updateCursor(worldX, worldY);

    // Eraser Tool Hover & Drag Erase
    if (selectedTool === "eraser" && !isViewer) {
      const targetId = findElementAtPointer(stage, pointer);
      setHoveredEraserId(targetId);

      if (isErasingRef.current && targetId) {
        deleteElements([targetId]);
        setHoveredEraserId(null);
      }
      return;
    }

    // Freehand Pencil Draw
    if (isDrawingRef.current && selectedTool === "pencil" && !isViewer && currentPencilIdRef.current) {
      const { currentBoard } = useBoardStore.getState();
      const currentElement = currentBoard?.elements.find((el) => el.id === currentPencilIdRef.current);
      if (!currentElement || currentElement.type !== "pencil") return;

      const pts = (currentElement as FreehandElementData).points;
      const lastX = pts[pts.length - 2];
      const lastY = pts[pts.length - 1];

      // Smooth point addition
      if (Math.hypot(worldX - lastX, worldY - lastY) > 2.5) {
        const newPoints = [...pts, worldX, worldY];
        updateElement(currentElement.id, { points: newPoints });
      }
    }
  };

  // Stage Mouse Up
  const handleMouseUp = () => {
    isDrawingRef.current = false;
    isErasingRef.current = false;
    currentPencilIdRef.current = null;
  };

  // Stage Mouse Leave
  const handleMouseLeave = () => {
    isDrawingRef.current = false;
    isErasingRef.current = false;
    currentPencilIdRef.current = null;
    setHoveredEraserId(null);
    yjsBoardManager.clearCursor();
  };

  // Element Click
  const handleElementClick = (e: any, element: BoardElement) => {
    if (isViewer) return;

    if (selectedTool === "eraser") {
      e.cancelBubble = true;
      deleteElements([element.id]);
      setHoveredEraserId(null);
      return;
    }

    if (selectedTool === "select") {
      e.cancelBubble = true;
      if (e.evt.shiftKey) {
        if (selectedElementIds.includes(element.id)) {
          setSelectedElementIds(selectedElementIds.filter((id) => id !== element.id));
        } else {
          setSelectedElementIds([...selectedElementIds, element.id]);
        }
      } else {
        setSelectedElementIds([element.id]);
      }
    }
  };

  const elements = currentBoard?.elements || [];

  return (
    <Stage
      ref={stageRef}
      width={dimensions.width}
      height={dimensions.height}
      x={stagePos.x}
      y={stagePos.y}
      scaleX={scale}
      scaleY={scale}
      draggable={selectedTool === "pan" || isViewer}
      onDragEnd={(e) => {
        if (e.target === stageRef.current) {
          setStagePos({ x: e.target.x(), y: e.target.y() });
        }
      }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={
        selectedTool === "pan" || isViewer
          ? "cursor-grab active:cursor-grabbing"
          : selectedTool === "eraser"
          ? "cursor-none"
          : selectedTool === "pencil"
          ? "cursor-crosshair"
          : selectedTool === "text"
          ? "cursor-text"
          : "cursor-default"
      }
    >
      <Layer>
        {elements.map((el) => {
          const isDraggable = selectedTool === "select" && !isViewer;
          const isEraserTarget = hoveredEraserId === el.id;

          if (el.type === "rectangle") {
            const rectEl = el as RectElementData;
            return (
              <Rect
                key={rectEl.id}
                id={rectEl.id}
                x={rectEl.x}
                y={rectEl.y}
                width={rectEl.width}
                height={rectEl.height}
                fill={rectEl.fillColor === "transparent" ? undefined : rectEl.fillColor || "#a5d8ff"}
                stroke={isEraserTarget ? "#e03131" : rectEl.strokeColor || "#1e1e1e"}
                strokeWidth={isEraserTarget ? (rectEl.strokeWidth || 2) + 2 : rectEl.strokeWidth || 2}
                dash={isEraserTarget ? [6, 4] : undefined}
                cornerRadius={rectEl.cornerRadius || 6}
                opacity={isEraserTarget ? 0.6 : rectEl.opacity ?? 0.95}
                rotation={rectEl.rotation || 0}
                draggable={isDraggable}
                onClick={(e) => handleElementClick(e, rectEl)}
                onTap={(e) => handleElementClick(e, rectEl)}
                onDragEnd={(e) => {
                  updateElement(rectEl.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  });
                }}
                onTransformEnd={(e) => {
                  const node = e.target;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();
                  node.scaleX(1);
                  node.scaleY(1);
                  updateElement(rectEl.id, {
                    x: node.x(),
                    y: node.y(),
                    width: Math.max(20, node.width() * scaleX),
                    height: Math.max(20, node.height() * scaleY),
                    rotation: node.rotation(),
                  });
                }}
              />
            );
          }

          if (el.type === "circle") {
            const circleEl = el as CircleElementData;
            return (
              <Circle
                key={circleEl.id}
                id={circleEl.id}
                x={circleEl.x}
                y={circleEl.y}
                radius={circleEl.radius}
                fill={circleEl.fillColor === "transparent" ? undefined : circleEl.fillColor || "#ffc9c9"}
                stroke={isEraserTarget ? "#e03131" : circleEl.strokeColor || "#e03131"}
                strokeWidth={isEraserTarget ? (circleEl.strokeWidth || 2) + 2 : circleEl.strokeWidth || 2}
                dash={isEraserTarget ? [6, 4] : undefined}
                opacity={isEraserTarget ? 0.6 : circleEl.opacity ?? 0.95}
                rotation={circleEl.rotation || 0}
                draggable={isDraggable}
                onClick={(e) => handleElementClick(e, circleEl)}
                onTap={(e) => handleElementClick(e, circleEl)}
                onDragEnd={(e) => {
                  updateElement(circleEl.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  });
                }}
                onTransformEnd={(e) => {
                  const node = e.target;
                  const scaleX = node.scaleX();
                  node.scaleX(1);
                  node.scaleY(1);
                  updateElement(circleEl.id, {
                    x: node.x(),
                    y: node.y(),
                    radius: Math.max(10, circleEl.radius * scaleX),
                    rotation: node.rotation(),
                  });
                }}
              />
            );
          }

          if (el.type === "pencil") {
            const pencilEl = el as FreehandElementData;
            return (
              <Line
                key={pencilEl.id}
                id={pencilEl.id}
                x={pencilEl.x || 0}
                y={pencilEl.y || 0}
                points={pencilEl.points || []}
                stroke={isEraserTarget ? "#e03131" : pencilEl.strokeColor || "#1e1e1e"}
                strokeWidth={isEraserTarget ? (pencilEl.strokeWidth || 3) + 3 : pencilEl.strokeWidth || 3}
                dash={isEraserTarget ? [6, 4] : undefined}
                lineCap="round"
                lineJoin="round"
                tension={0.5}
                draggable={isDraggable}
                onClick={(e) => handleElementClick(e, pencilEl)}
                onTap={(e) => handleElementClick(e, pencilEl)}
                onDragEnd={(e) => {
                  updateElement(pencilEl.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  });
                }}
              />
            );
          }

          if (el.type === "text") {
            const textEl = el as TextElementData;
            return (
              <Text
                key={textEl.id}
                id={textEl.id}
                x={textEl.x}
                y={textEl.y}
                text={textEl.text}
                fontSize={textEl.fontSize || 20}
                fontFamily="Inter, 'Segoe UI', sans-serif"
                fill={isEraserTarget ? "#e03131" : textEl.strokeColor || "#1e1e1e"}
                rotation={textEl.rotation || 0}
                draggable={isDraggable}
                onClick={(e) => handleElementClick(e, textEl)}
                onDblClick={(e) => onTextDblClick(e, textEl)}
                onDblTap={(e) => onTextDblClick(e, textEl)}
                onDragEnd={(e) => {
                  updateElement(textEl.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  });
                }}
                onTransformEnd={(e) => {
                  const node = e.target;
                  node.scaleX(1);
                  node.scaleY(1);
                  updateElement(textEl.id, {
                    x: node.x(),
                    y: node.y(),
                    rotation: node.rotation(),
                  });
                }}
              />
            );
          }

          return null;
        })}

        {/* Excalidraw Style Minimal Transformer (Select Mode Only) */}
        {!isViewer && selectedTool === "select" && selectedElementIds.length > 0 && (
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 15 || newBox.height < 15) {
                return oldBox;
              }
              return newBox;
            }}
            borderStroke="#0058be"
            borderStrokeWidth={1.5}
            anchorFill="#ffffff"
            anchorStroke="#0058be"
            anchorSize={7}
            anchorCornerRadius={2}
          />
        )}
      </Layer>
    </Stage>
  );
};
