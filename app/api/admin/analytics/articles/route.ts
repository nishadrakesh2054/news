import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
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
    });

    const byCategory = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        articles: {
          where: { status: "PUBLISHED" },
          select: { views: true },
        },
      },
    });

    const categoryStats = byCategory.map((c) => ({
      id: c.id,
      name: c.name,
      articles: c.articles.length,
      views: c.articles.reduce((sum, a) => sum + a.views, 0),
    }));

    return apiSuccess({ topArticles: articles, categoryStats });
  } catch (error) {
    return handleServerError(error, "Failed to fetch article analytics");
  }
}
