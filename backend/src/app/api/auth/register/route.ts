import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/validation";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.errors[0]?.message || "Invalid input",
        "VALIDATION_ERROR",
        422,
        parsed.error.flatten()
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return apiError("A user with this email already exists", "CONFLICT", 409);
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    const colors = ["#0058be", "#4648d4", "#b75b00", "#2170e4", "#6063ee"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        color: randomColor,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        color: true,
        createdAt: true,
      },
    });

    return apiSuccess(user, 201);
  } catch (error: any) {
    console.error("Registration error:", error);
    return apiError("Internal server error during registration", "INTERNAL_ERROR", 500);
  }
}
