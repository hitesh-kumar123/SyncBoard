import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { LoginSchema } from "./validation";
import { NextRequest } from "next/server";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "syncboard_super_secret_local_jwt_key_2026",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("Invalid email or password format");
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatarUrl,
          color: user.color,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.color = (user as any).color;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id as string;
        (session.user as any).color = token.color as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export async function getCurrentUser(req?: NextRequest) {
  // 1. Try NextAuth session
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return session.user as { id: string; name: string; email: string; color?: string; image?: string };
    }
  } catch {}

  // 2. Try x-user-id / x-user-email headers from local frontend client
  if (req) {
    const headerUserId = req.headers.get("x-user-id");
    const headerUserEmail = req.headers.get("x-user-email");
    if (headerUserId || headerUserEmail) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            ...(headerUserId ? [{ id: headerUserId }] : []),
            ...(headerUserEmail ? [{ email: headerUserEmail.toLowerCase().trim() }] : []),
          ],
        },
        select: { id: true, name: true, email: true, color: true, avatarUrl: true },
      });
      if (user) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          color: user.color,
          image: user.avatarUrl || undefined,
        };
      }
    }
  }

  return undefined;
}
