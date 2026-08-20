import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { CreateBoardSchema } from "@/lib/validation";
import { apiSuccess, apiError } from "@/lib/api-response";

// GET /api/boards — List all accessible boards
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user?.id) {
      return apiError("Authentication required", "UNAUTHORIZED", 401);
    }

    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true, color: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true, color: true },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Format boards for clean client consumption
    const formatted = boards.map((b) => {
      const userMemberRecord = b.members.find((m) => m.userId === user.id);
      const userRole = b.ownerId === user.id ? "OWNER" : userMemberRecord?.role || "VIEWER";

      return {
        id: b.id,
        title: b.name,
        name: b.name,
        description: b.description,
        category: b.category,
        userRole,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
        owner: b.owner,
        collaborators: [
          { ...b.owner, role: "OWNER" },
          ...b.members
            .filter((m) => m.userId !== b.ownerId)
            .map((m) => ({ ...m.user, role: m.role })),
        ],
      };
    });

    return apiSuccess(formatted);
  } catch (error: any) {
    console.error("GET /api/boards error:", error);
    return apiError("Failed to fetch boards", "INTERNAL_ERROR", 500);
  }
}

// POST /api/boards — Create new board
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user?.id) {
      return apiError("Authentication required", "UNAUTHORIZED", 401);
    }

    const body = await req.json();
    const parsed = CreateBoardSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.errors[0]?.message || "Invalid board data",
        "VALIDATION_ERROR",
        422,
        parsed.error.flatten()
      );
    }

    const { name, description, category } = parsed.data;

    // Create board and member in single transaction
    const newBoard = await prisma.$transaction(async (tx) => {
      const board = await tx.board.create({
        data: {
          name,
          description: description || null,
          category: category || "ACTIVE",
          ownerId: user.id,
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true, avatarUrl: true, color: true },
          },
        },
      });

      // Create OWNER membership
      await tx.boardMember.create({
        data: {
          boardId: board.id,
          userId: user.id,
          role: "OWNER",
        },
      });

      return board;
    });

    return apiSuccess(
      {
        id: newBoard.id,
        title: newBoard.name,
        name: newBoard.name,
        description: newBoard.description,
        category: newBoard.category,
        userRole: "OWNER",
        createdAt: newBoard.createdAt.toISOString(),
        updatedAt: newBoard.updatedAt.toISOString(),
        owner: newBoard.owner,
        collaborators: [{ ...newBoard.owner, role: "OWNER" }],
        elements: [],
      },
      201
    );
  } catch (error: any) {
    console.error("POST /api/boards error:", error);
    return apiError("Failed to create board", "INTERNAL_ERROR", 500);
  }
}
