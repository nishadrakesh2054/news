import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";

export type CategoryViewStat = {
  id: string;
  name: string;
  articlesCount: number;
  views: number;
  percentage: number;
};

/** Aggregate category views in DB instead of loading every article row. */
export async function getCategoryViewStats(totalViews?: number): Promise<CategoryViewStat[]> {
  const [categories, grouped] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true, nameNp: true },
    }),
    prisma.article.groupBy({
      by: ["categoryId"],
      where: { status: ArticleStatus.PUBLISHED },
      _sum: { views: true },
      _count: { id: true },
    }),
  ]);

  const statsMap = new Map(
    grouped.map((row) => [
      row.categoryId,
      { views: row._sum.views ?? 0, count: row._count.id },
    ])
  );

  const denominator =
    totalViews ??
    grouped.reduce((sum, row) => sum + (row._sum.views ?? 0), 0);

  return categories
    .map((cat) => {
      const stat = statsMap.get(cat.id);
      const views = stat?.views ?? 0;
      const articlesCount = stat?.count ?? 0;
      return {
        id: cat.id,
        name: cat.nameNp || cat.name,
        articlesCount,
        views,
        percentage: denominator > 0 ? Number(((views / denominator) * 100).toFixed(1)) : 0,
      };
    })
    .sort((a, b) => b.views - a.views);
}
