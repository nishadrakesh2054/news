import { ArticleStatus, Role } from "@prisma/client";
import { apiError } from "@/lib/api-response";
import type { NextResponse } from "next/server";

const PRIVILEGED_STATUSES: ArticleStatus[] = [
  ArticleStatus.PUBLISHED,
  ArticleStatus.ARCHIVED,
];

/** Authors may only save drafts or submit for review unless editor/admin. */
export function assertArticleStatusPermission(
  role: Role,
  status: ArticleStatus
): NextResponse | null {
  if (role === Role.ADMIN || role === Role.EDITOR) return null;
  if (role === Role.AUTHOR && !PRIVILEGED_STATUSES.includes(status)) return null;
  return apiError(
    "Unauthorized: Only editors or admins can publish, archive, or feature articles",
    403
  ) as NextResponse;
}

export function assertBreakingPermission(role: Role, isBreaking: boolean): NextResponse | null {
  if (!isBreaking) return null;
  if (role === Role.ADMIN || role === Role.EDITOR) return null;
  return apiError("Unauthorized: Only editors or admins can mark breaking news", 403) as NextResponse;
}

export function assertFeaturedPermission(role: Role, isFeatured: boolean): NextResponse | null {
  if (!isFeatured) return null;
  if (role === Role.ADMIN || role === Role.EDITOR) return null;
  return apiError("Unauthorized: Only editors or admins can feature articles", 403) as NextResponse;
}
