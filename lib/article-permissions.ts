import { ArticleStatus, Role } from "@prisma/client";
import { apiError } from "@/lib/api-response";
import type { NextResponse } from "next/server";
import { canRole, isSuperAdmin } from "@/lib/permissions";

const PRIVILEGED_STATUSES: ArticleStatus[] = [
  ArticleStatus.PUBLISHED,
  ArticleStatus.ARCHIVED,
];

/**
 * Status changes to published/archived require `articles.publish`.
 * Authors without publish may only use draft / in-review.
 */
export async function assertArticleStatusPermission(
  role: Role,
  status: ArticleStatus
): Promise<NextResponse | null> {
  if (!PRIVILEGED_STATUSES.includes(status)) return null;
  if (await canRole(role, "articles.publish")) return null;
  return apiError(
    "Unauthorized: missing permission to publish or archive articles",
    403
  ) as NextResponse;
}

/** Breaking flag requires breaking.update (or create path) — editors with articles.update historically; use breaking.update. */
export async function assertBreakingPermission(
  role: Role,
  isBreaking: boolean
): Promise<NextResponse | null> {
  if (!isBreaking) return null;
  if (await canRole(role, "breaking.update")) return null;
  if (await canRole(role, "articles.publish")) return null;
  return apiError("Unauthorized: missing permission to mark breaking news", 403) as NextResponse;
}

export async function assertFeaturedPermission(
  role: Role,
  isFeatured: boolean
): Promise<NextResponse | null> {
  if (!isFeatured) return null;
  if (await canRole(role, "featured.update")) return null;
  if (await canRole(role, "articles.publish")) return null;
  return apiError("Unauthorized: missing permission to feature articles", 403) as NextResponse;
}

/** Authors may only delete their own articles unless Super Admin / has broad delete without author scope. */
export function assertArticleOwnershipForDelete(
  role: Role,
  actorId: string,
  authorId: string
): NextResponse | null {
  if (isSuperAdmin(role)) return null;
  if (role === Role.AUTHOR && actorId !== authorId) {
    return apiError("Unauthorized: authors can only delete their own articles", 403) as NextResponse;
  }
  return null;
}
