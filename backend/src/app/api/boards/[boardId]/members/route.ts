import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { checkBoardPermission } from "@/lib/permissions";
import { InviteMemberSchema } from "@/lib/validation";
import { apiSuccess, apiError } from "@/lib/api-response";

interface RouteContext {
  params: {
    boardId: string;
  };
}

// GET /api/boards/[boardId]/members
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser(req);
    const { boardId } = params;

    const access = await checkBoardPermission(user?.id, boardId, ["OWNER", "EDITOR", "VIEWER"]);
    if (!access.allowed) {
      return apiError(access.error!.message, access.error!.code, access.error!.status);
    }

    const members = await prisma.boardMember.findMany({
      where: { boardId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true, color: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const formatted = members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      avatarUrl: m.user.avatarUrl,
      color: m.user.color,
      role: m.role,
      joinedAt: m.createdAt.toISOString(),
    }));

    return apiSuccess(formatted);
  } catch (error: any) {
    console.error("GET members error:", error);
    return apiError("Failed to fetch board members", "INTERNAL_ERROR", 500);
  }
}

// POST /api/boards/[boardId]/members — Invite collaborator by email
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const user = await getCurrentUser(req);
    const { boardId } = params;

    // Check board permission
    const access = await checkBoardPermission(user?.id, boardId, ["OWNER"]);
    if (!access.allowed) {
      return apiError(access.error!.message, access.error!.code, access.error!.status);
    }

    const body = await req.json();
    const parsed = InviteMemberSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.errors[0]?.message || "Invalid invite payload",
        "VALIDATION_ERROR",
        422,
        parsed.error.flatten()
      );
    }

    const { email, role } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists in database
    const invitee = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!invitee) {
      return apiError(
        "User with this email is not registered yet. Please have them create an account first.",
        "NOT_FOUND",
        404
      );
    }

    // Check if already a member
    const existingMembership = await prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: invitee.id,
        },
      },
    });

    if (existingMembership) {
      // Update role if already member
      const updated = await prisma.boardMember.update({
        where: { id: existingMembership.id },
        data: { role },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true, color: true },
          },
        },
      });

      return apiSuccess({
        id: updated.id,
        userId: updated.user.id,
        name: updated.user.name,
        email: updated.user.email,
        avatarUrl: updated.user.avatarUrl,
        color: updated.user.color,
        role: updated.role,
        message: "Collaborator role updated",
      });
    }

    // Create new membership
    const newMember = await prisma.boardMember.create({
      data: {
        boardId,
        userId: invitee.id,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true, color: true },
        },
      },
    });

    return apiSuccess(
      {
        id: newMember.id,
        userId: newMember.user.id,
        name: newMember.user.name,
        email: newMember.user.email,
        avatarUrl: newMember.user.avatarUrl,
        color: newMember.user.color,
        role: newMember.role,
        message: "Collaborator invited successfully",
      },
      201
    );
  } catch (error: any) {
    console.error("POST member error:", error);
    return apiError("Failed to invite member", "INTERNAL_ERROR", 500);
  }
}
