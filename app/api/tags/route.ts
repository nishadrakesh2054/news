import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { apiSuccess, handleServerError } from "@/lib/api-response";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            articles: {
              where: { status: ArticleStatus.PUBLISHED },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const data = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      articlesCount: tag._count.articles,
    }));

    const res = apiSuccess(data, "Tags retrieved successfully");
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res;
  } catch (error) {
    return handleServerError(error, "Failed to retrieve tags");
  }
}
