import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { checkBoardPermission } from "@/lib/permissions";
import { UpdateBoardSchema } from "@/lib/validation";
import { apiSuccess, apiError } from "@/lib/api-response";

interface RouteContext {
  params: {
    boardId: string;
  };
}

// GET /api/boards/[boardId]
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    const { boardId } = params;

    const access = await checkBoardPermission(user?.id, boardId, ["OWNER", "EDITOR", "VIEWER"]);
    if (!access.allowed) {
      return apiError(access.error!.message, access.error!.code, access.error!.status);
    }

    const b = access.board;

    return apiSuccess({
      id: b.id,
      title: b.name,
      name: b.name,
      description: b.description,
      category: b.category,
      snapshot: b.snapshot,
      userRole: access.role,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      owner: b.owner,
      collaborators: [
        { ...b.owner, role: "OWNER" },
        ...b.members
          .filter((m: any) => m.userId !== b.ownerId)
          .map((m: any) => ({ ...m.user, role: m.role })),
      ],
    });
  } catch (error: any) {
    console.error("GET /api/boards/[boardId] error:", error);
    return apiError("Failed to fetch board", "INTERNAL_ERROR", 500);
  }
}

// PATCH /api/boards/[boardId]
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    const { boardId } = params;

    // Only OWNER and EDITOR can modify board properties
    const access = await checkBoardPermission(user?.id, boardId, ["OWNER", "EDITOR"]);
    if (!access.allowed) {
      return apiError(access.error!.message, access.error!.code, access.error!.status);
    }

    const body = await req.json();
    const parsed = UpdateBoardSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.errors[0]?.message || "Invalid update data",
        "VALIDATION_ERROR",
        422,
        parsed.error.flatten()
      );
    }

    const { name, description, category, snapshot } = parsed.data;

    const updated = await prisma.board.update({
      where: { id: boardId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(snapshot !== undefined && { snapshot }),
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true, color: true },
        },
      },
    });

    return apiSuccess({
      id: updated.id,
      title: updated.name,
      name: updated.name,
      description: updated.description,
      category: updated.category,
      snapshot: updated.snapshot,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error: any) {
    console.error("PATCH /api/boards/[boardId] error:", error);
    return apiError("Failed to update board", "INTERNAL_ERROR", 500);
  }
}

// DELETE /api/boards/[boardId]
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    const { boardId } = params;

    // Only OWNER can delete a board
    const access = await checkBoardPermission(user?.id, boardId, ["OWNER"]);
    if (!access.allowed) {
      return apiError(access.error!.message, access.error!.code, access.error!.status);
    }

    await prisma.board.delete({
      where: { id: boardId },
    });

    return apiSuccess({ message: "Board deleted successfully", boardId });
  } catch (error: any) {
    console.error("DELETE /api/boards/[boardId] error:", error);
    return apiError("Failed to delete board", "INTERNAL_ERROR", 500);
  }
}
