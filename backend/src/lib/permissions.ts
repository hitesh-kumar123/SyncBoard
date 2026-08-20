import { prisma } from "./prisma";

export type BoardRole = "OWNER" | "EDITOR" | "VIEWER";

export interface PermissionCheckResult {
  allowed: boolean;
  role?: BoardRole;
  board?: any;
  error?: {
    code: "UNAUTHORIZED" | "NOT_FOUND" | "FORBIDDEN";
    message: string;
    status: number;
  };
}

export async function checkBoardPermission(
  userId: string | undefined,
  boardId: string,
  allowedRoles: BoardRole[]
): Promise<PermissionCheckResult> {
  if (!userId) {
    return {
      allowed: false,
      error: {
        code: "UNAUTHORIZED",
        message: "You must be logged in to perform this action.",
        status: 401,
      },
    };
  }

  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      owner: {
        select: { id: true, name: true, email: true, color: true, avatarUrl: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, color: true, avatarUrl: true },
          },
        },
      },
    },
  });

  if (!board) {
    return {
      allowed: false,
      error: {
        code: "NOT_FOUND",
        message: "Board not found.",
        status: 404,
      },
    };
  }

  // Check if owner
  if (board.ownerId === userId) {
    return {
      allowed: allowedRoles.includes("OWNER"),
      role: "OWNER",
      board,
      error: allowedRoles.includes("OWNER")
        ? undefined
        : {
            code: "FORBIDDEN",
            message: "Action not permitted for your role.",
            status: 403,
          },
    };
  }

  // Check member role
  const membership = board.members.find((m) => m.userId === userId);
  if (!membership) {
    return {
      allowed: false,
      error: {
        code: "FORBIDDEN",
        message: "You do not have access to this board.",
        status: 403,
      },
    };
  }

  const userRole = membership.role as BoardRole;
  const isAllowed = allowedRoles.includes(userRole);

  if (!isAllowed) {
    return {
      allowed: false,
      role: userRole,
      board,
      error: {
        code: "FORBIDDEN",
        message: `Your role (${userRole}) does not have permission to perform this action.`,
        status: 403,
      },
    };
  }

  return {
    allowed: true,
    role: userRole,
    board,
  };
}
