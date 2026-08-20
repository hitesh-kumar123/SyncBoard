import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { checkBoardPermission } from "@/lib/permissions";
import { UpdateMemberRoleSchema } from "@/lib/validation";
import { apiSuccess, apiError } from "@/lib/api-response";

interface RouteContext {
  params: {
    boardId: string;
    memberId: string;
  };
}

// PATCH /api/boards/[boardId]/members/[memberId] — Update role
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    const { boardId, memberId } = params;

    // Only OWNER can modify member roles
    const access = await checkBoardPermission(user?.id, boardId, ["OWNER"]);
    if (!access.allowed) {
      return apiError(access.error!.message, access.error!.code, access.error!.status);
    }

    const body = await req.json();
    const parsed = UpdateMemberRoleSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.errors[0]?.message || "Invalid role data",
        "VALIDATION_ERROR",
        422,
        parsed.error.flatten()
      );
    }

    const { role } = parsed.data;

    // Find member by ID or userId
    const member = await prisma.boardMember.findFirst({
      where: {
        boardId,
        OR: [{ id: memberId }, { userId: memberId }],
      },
    });

    if (!member) {
      return apiError("Board member not found", "NOT_FOUND", 404);
    }

    const updated = await prisma.boardMember.update({
      where: { id: member.id },
      data: { role },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true, color: true },
        },
      },
    });

    return apiSuccess({
      id: updated.id,
      userId: updated.userId,
      name: updated.user.name,
      email: updated.user.email,
      role: updated.role,
      message: "Member role updated successfully",
    });
  } catch (error: any) {
    console.error("PATCH member error:", error);
    return apiError("Failed to update member role", "INTERNAL_ERROR", 500);
  }
}

// DELETE /api/boards/[boardId]/members/[memberId] — Remove member
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();
    const { boardId, memberId } = params;

    // Only OWNER can remove members (or user removing self)
    const access = await checkBoardPermission(user?.id, boardId, ["OWNER", "EDITOR", "VIEWER"]);
    if (!access.allowed) {
      return apiError(access.error!.message, access.error!.code, access.error!.status);
    }

    const member = await prisma.boardMember.findFirst({
      where: {
        boardId,
        OR: [{ id: memberId }, { userId: memberId }],
      },
    });

    if (!member) {
      return apiError("Board member not found", "NOT_FOUND", 404);
    }

    // If not OWNER, only self removal is permitted
    if (access.role !== "OWNER" && member.userId !== user?.id) {
      return apiError("Only the board owner can remove other members", "FORBIDDEN", 403);
    }

    await prisma.boardMember.delete({
      where: { id: member.id },
    });

    return apiSuccess({
      message: "Member removed from board",
      memberId: member.id,
      userId: member.userId,
    });
  } catch (error: any) {
    console.error("DELETE member error:", error);
    return apiError("Failed to remove member", "INTERNAL_ERROR", 500);
  }
}
