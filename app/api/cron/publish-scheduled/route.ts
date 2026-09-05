import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { verifyCronSecret } from "@/lib/admin-auth";
import { getJsonSetting } from "@/lib/settings-store";
import { invalidatePublicArticles } from "@/lib/cache-invalidation";

const DEFAULT_MAINTENANCE = {
  maintenanceMode: false,
  maintenanceMessage: "Site is under maintenance. Please check back soon.",
  cacheEnabled: true,
  cronEnabled: true,
};

export async function GET(request: NextRequest) {
  try {
    const authError = verifyCronSecret(request);
    if (authError) return authError;

    const maintenance = await getJsonSetting("system_maintenance", DEFAULT_MAINTENANCE);
    if (!maintenance.cronEnabled) {
      return apiSuccess({ publishedCount: 0 }, "Cron is disabled in maintenance settings.");
    }

    const now = new Date();

    // Only editor-approved PENDING items — never auto-publish author DRAFTs.
    const scheduledArticles = await prisma.article.findMany({
      where: {
        status: ArticleStatus.PENDING,
        scheduledAt: { lte: now },
      },
      select: { id: true, title: true, titleNp: true },
    });

    if (scheduledArticles.length === 0) {
      return apiSuccess({ publishedCount: 0 }, "No scheduled articles due for publication.");
    }

    const ids = scheduledArticles.map((article) => article.id);

    await prisma.article.updateMany({
      where: { id: { in: ids } },
      data: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: now,
      },
    });

    invalidatePublicArticles();

    return apiSuccess(
      {
        publishedCount: scheduledArticles.length,
        publishedArticles: scheduledArticles,
      },
      `Successfully published ${scheduledArticles.length} scheduled articles.`
    );
  } catch (error) {
    return handleServerError(error, "Failed to publish scheduled articles.");
  }
}
