import { NextResponse } from "next/server";
import { MESSAGES } from "@/constants/messages";
import { logger } from "@/lib/logger";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export function apiSuccess<T>(data: T, message?: string, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, message, data },
    { status }
  );
}

export function apiError(error: string, status = 400) {
  return NextResponse.json<ApiResponse>(
    { success: false, error },
    { status }
  );
}

function clientSafeErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error) || !error.message) return fallback;
  let message = error.message;
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (databaseUrl) {
    message = message.split(databaseUrl).join("[database]");
  }
  return message;
}

export function handleServerError(
  error: unknown,
  fallbackMessage: string = MESSAGES.SYSTEM.SERVER_ERROR
) {
  logger.error("API server error", {
    error,
    fallbackMessage,
  });
  return apiError(clientSafeErrorMessage(error, fallbackMessage), 500);
}
