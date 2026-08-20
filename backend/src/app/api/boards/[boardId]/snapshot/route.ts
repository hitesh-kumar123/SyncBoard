import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { checkBoardPermission } from "@/lib/permissions";
import { SaveSnapshotSchema } from "@/lib/validation";
import { apiSuccess, apiError } from "@/lib/api-response";

interface RouteContext {
  params: {
    boardId: string;
  };
}

// GET /api/boards/[boardId]/snapshot — Load Yjs state
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    const { boardId } = params;

    const access = await checkBoardPermission(user?.id, boardId, ["OWNER", "EDITOR", "VIEWER"]);
    if (!access.allowed) {
      return apiError(access.error!.message, access.error!.code, access.error!.status);
    }

    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: { id: true, name: true, snapshot: true, updatedAt: true },
    });

    return apiSuccess({
      boardId: board?.id,
      snapshot: board?.snapshot || null,
      updatedAt: board?.updatedAt.toISOString(),
    });
  } catch (error: any) {
    console.error("GET snapshot error:", error);
    return apiError("Failed to fetch board snapshot", "INTERNAL_ERROR", 500);
  }
}

// POST /api/boards/[boardId]/snapshot — Save debounced Yjs state
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    const { boardId } = params;

    // Only OWNER and EDITOR can save snapshots
    const access = await checkBoardPermission(user?.id, boardId, ["OWNER", "EDITOR"]);
    if (!access.allowed) {
      return apiError(access.error!.message, access.error!.code, access.error!.status);
    }

    const body = await req.json();
    const parsed = SaveSnapshotSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.errors[0]?.message || "Invalid snapshot data",
        "VALIDATION_ERROR",
        422
      );
    }

    const { snapshot } = parsed.data;

    const updated = await prisma.board.update({
      where: { id: boardId },
      data: { snapshot },
      select: { id: true, updatedAt: true },
    });

    return apiSuccess({
      message: "Snapshot saved successfully",
      boardId: updated.id,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error: any) {
    console.error("POST snapshot error:", error);
    return apiError("Failed to save board snapshot", "INTERNAL_ERROR", 500);
  }
}
