import { ArticleStatus } from "@prisma/client";

export function isFutureScheduledDate(scheduledAt: Date | null | undefined): boolean {
  if (!scheduledAt) return false;
  return scheduledAt.getTime() > Date.now();
}

export function resolvePublishedAt(
  status: ArticleStatus,
  scheduledAt: Date | null | undefined,
  existingPublishedAt: Date | null | undefined
): Date | null {
  if (status !== ArticleStatus.PUBLISHED) {
    return existingPublishedAt ?? null;
  }

  if (isFutureScheduledDate(scheduledAt)) {
    return existingPublishedAt ?? null;
  }

  return existingPublishedAt ?? new Date();
}

export function normalizeStatusForSchedule(
  status: ArticleStatus,
  scheduledAt: Date | null | undefined
): ArticleStatus {
  if (!isFutureScheduledDate(scheduledAt)) {
    return status;
  }

  if (status === ArticleStatus.PUBLISHED) {
    return ArticleStatus.PENDING;
  }

  return status;
}
