import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const CreateBoardSchema = z.object({
  name: z.string().min(1, "Board name is required").max(100, "Board name too long"),
  description: z.string().max(500, "Description too long").optional(),
  category: z.enum(["ACTIVE", "DESIGN", "ARCHIVE"]).optional().default("ACTIVE"),
});

export const UpdateBoardSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(["ACTIVE", "DESIGN", "ARCHIVE"]).optional(),
  snapshot: z.string().optional(),
});

export const InviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["EDITOR", "VIEWER"]).default("EDITOR"),
});

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(["OWNER", "EDITOR", "VIEWER"]),
});

export const SaveSnapshotSchema = z.object({
  snapshot: z.string().min(1, "Snapshot state cannot be empty"),
});
