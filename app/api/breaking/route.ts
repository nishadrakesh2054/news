import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { clearExpiredBreakingArticles } from "@/lib/breaking-expiry";

export async function GET() {
  try {
    await clearExpiredBreakingArticles();

    const breakingArticles = await prisma.article.findMany({
      where: {
        isBreaking: true,
        status: ArticleStatus.PUBLISHED,
      },
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        updatedAt: true,
        category: {
          select: { name: true, nameNp: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

    const res = apiSuccess(breakingArticles, "Breaking news items retrieved successfully");
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    return res;
  } catch (error) {
    return handleServerError(error, "Failed to retrieve breaking news items");
  }
}
