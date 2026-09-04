import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { getRecentMonthBuckets, startOfMonthsAgo } from "@/lib/analytics-time-series";
import {
  getAdPerformanceSummary,
  getArticlesPublishedByMonth,
  getDeviceBreakdown,
  getPageViewsByMonth,
  getPeakHours,
  getUserGrowthByMonth,
} from "@/lib/analytics-aggregate";
import { getCategoryViewStats } from "@/lib/category-stats";
import { requireEditor } from "@/lib/admin-auth";

const CHART_MONTHS = 12;

export async function GET() {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const monthBuckets = getRecentMonthBuckets(CHART_MONTHS);
    const rangeStart = startOfMonthsAgo(CHART_MONTHS);

    const [totalAggregate, publishedCount, breakingCount, topArticles] = await Promise.all([
      prisma.article.aggregate({
        _sum: { views: true },
        _count: { id: true },
      }),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.article.count({ where: { isBreaking: true } }),
      prisma.article.findMany({
        take: 5,
        where: { status: "PUBLISHED" },
        orderBy: { views: "desc" },
        select: {
          id: true,
          title: true,
          titleNp: true,
          slug: true,
          views: true,
          createdAt: true,
          category: { select: { name: true, nameNp: true } },
          author: { select: { name: true } },
        },
      }),
    ]);

    const totalViews = totalAggregate._sum.views || 0;
    const totalArticles = totalAggregate._count.id || 0;

    const [categoryStats, deviceBreakdown, peakHours, pageViewsByMonth, adPerformance, monthlyUserGrowth, articlesPublished] =
      await Promise.all([
        getCategoryViewStats(totalViews),
        getDeviceBreakdown(rangeStart),
        getPeakHours(rangeStart),
        getPageViewsByMonth(CHART_MONTHS),
        getAdPerformanceSummary(),
        getUserGrowthByMonth(rangeStart, monthBuckets),
        getArticlesPublishedByMonth(rangeStart, monthBuckets),
      ]);

    const articlesByCategory = [...categoryStats]
      .sort((a, b) => b.articlesCount - a.articlesCount)
      .slice(0, 8)
      .map((category) => ({
        name: category.name,
        articles: category.articlesCount,
      }));

    return apiSuccess(
      {
        totalViews,
        totalArticles,
        publishedCount,
        breakingCount,
        topArticles,
        categoryStats,
        monthlyUserGrowth,
        articlesPublished,
        articlesByCategory,
        pageViewsByMonth,
        deviceBreakdown,
        peakHours,
        adPerformance,
      },
      "Analytics data retrieved",
      200
    );
  } catch (error) {
    return handleServerError(error, "Failed to retrieve analytics");
  }
}
