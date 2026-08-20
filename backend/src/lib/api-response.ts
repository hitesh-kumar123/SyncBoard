import { NextResponse } from "next/server";

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR"
  | "BAD_REQUEST";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function apiError(message: string, code: ErrorCode, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details: details || null,
      },
    },
    { status }
  );
}
