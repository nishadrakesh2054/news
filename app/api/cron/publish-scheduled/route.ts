import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { apiSuccess, handleServerError } from "@/lib/api-response";

export async function GET() {
  try {
    const now = new Date();

    // Find all articles scheduled to be published on or before right now
    const scheduledArticles = await prisma.article.findMany({
      where: {
        status: { in: [ArticleStatus.DRAFT, ArticleStatus.PENDING] },
        scheduledAt: { lte: now },
      },
      select: { id: true, title: true, titleNp: true },
    });

    if (scheduledArticles.length === 0) {
      return apiSuccess({ publishedCount: 0 }, "No scheduled articles due for publication.");
    }

    const ids = scheduledArticles.map((a) => a.id);

    // Update their status to PUBLISHED
    await prisma.article.updateMany({
      where: { id: { in: ids } },
      data: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: now,
      },
    });

    return apiSuccess({
      publishedCount: scheduledArticles.length,
      publishedArticles: scheduledArticles,
    }, `Successfully published ${scheduledArticles.length} scheduled articles.`);
  } catch (error) {
    return handleServerError(error, "Failed to publish scheduled articles.");
  }
}
