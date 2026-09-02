import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import {
  countByMonth,
  getRecentMonthBuckets,
  startOfMonthsAgo,
} from "@/lib/analytics-time-series";
import {
  getAdPerformanceSummary,
  getDeviceBreakdown,
  getPageViewsByMonth,
  getPeakHours,
} from "@/lib/analytics-aggregate";

const CHART_MONTHS = 12;

export async function GET() {
  try {
    const monthBuckets = getRecentMonthBuckets(CHART_MONTHS);
    const rangeStart = startOfMonthsAgo(CHART_MONTHS);

    const totalAggregate = await prisma.article.aggregate({
      _sum: { views: true },
      _count: { id: true },
    });

    const totalViews = totalAggregate._sum.views || 0;
    const totalArticles = totalAggregate._count.id || 0;

    const publishedCount = await prisma.article.count({
      where: { status: "PUBLISHED" },
    });

    const breakingCount = await prisma.article.count({
      where: { isBreaking: true },
    });

    const topArticles = await prisma.article.findMany({
      take: 5,
      orderBy: { views: "desc" },
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        views: true,
        createdAt: true,
        category: {
          select: { name: true, nameNp: true },
        },
        author: {
          select: { name: true },
        },
      },
    });

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        nameNp: true,
        articles: {
          select: { views: true },
        },
      },
    });

    const categoryStats = categories
      .map((cat) => {
        const viewsSum = cat.articles.reduce((acc, a) => acc + (a.views || 0), 0);
        const percentage = totalViews > 0 ? Number(((viewsSum / totalViews) * 100).toFixed(1)) : 0;
        return {
          id: cat.id,
          name: cat.nameNp || cat.name,
          articlesCount: cat.articles.length,
          views: viewsSum,
          percentage,
        };
      })
      .sort((a, b) => b.views - a.views);

    const [recentUsers, recentPublishedArticles, deviceBreakdown, peakHours, pageViewsByMonth, adPerformance] =
      await Promise.all([
        prisma.user.findMany({
          where: { createdAt: { gte: rangeStart } },
          select: { createdAt: true },
        }),
        prisma.article.findMany({
          where: {
            status: "PUBLISHED",
            OR: [
              { publishedAt: { gte: rangeStart } },
              { publishedAt: null, createdAt: { gte: rangeStart } },
            ],
          },
          select: { publishedAt: true, createdAt: true },
        }),
        getDeviceBreakdown(rangeStart),
        getPeakHours(rangeStart),
        getPageViewsByMonth(CHART_MONTHS),
        getAdPerformanceSummary(),
      ]);

    const usersByMonth = countByMonth(recentUsers, (user) => user.createdAt, monthBuckets);
    const articlesByMonth = countByMonth(
      recentPublishedArticles,
      (article) => article.publishedAt ?? article.createdAt,
      monthBuckets
    );

    const monthlyUserGrowth = monthBuckets.map((bucket) => ({
      month: bucket.label,
      users: usersByMonth[bucket.key],
    }));

    const articlesPublished = monthBuckets.map((bucket) => ({
      month: bucket.label,
      articles: articlesByMonth[bucket.key],
    }));

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
