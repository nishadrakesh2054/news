import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { getCategoryViewStats } from "@/lib/category-stats";

export async function GET() {
  try {
    const [topArticles, categoryStats] = await Promise.all([
      prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { views: "desc" },
        take: 20,
        select: {
          id: true,
          title: true,
          titleNp: true,
          slug: true,
          views: true,
          status: true,
          type: true,
          publishedAt: true,
          category: { select: { name: true } },
          author: { select: { name: true } },
        },
      }),
      getCategoryViewStats(),
    ]);

    const formattedCategoryStats = categoryStats.map((c) => ({
      id: c.id,
      name: c.name,
      articles: c.articlesCount,
      views: c.views,
    }));

    return apiSuccess({ topArticles, categoryStats: formattedCategoryStats });
  } catch (error) {
    return handleServerError(error, "Failed to fetch article analytics");
  }
}
