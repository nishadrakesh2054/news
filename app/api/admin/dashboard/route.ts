import { ArticleStatus, CommentStatus, SubscriberStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { requireStaff } from "@/lib/admin-auth";

const articleListSelect = {
  id: true,
  title: true,
  titleNp: true,
  slug: true,
  status: true,
  views: true,
  isBreaking: true,
  isFeatured: true,
  type: true,
  publishedAt: true,
  updatedAt: true,
  createdAt: true,
  category: { select: { name: true, nameNp: true } },
  author: { select: { name: true } },
} as const;

export async function GET() {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      publishedCount,
      draftCount,
      pendingCount,
      archivedCount,
      breakingCount,
      featuredCount,
      liveCount,
      totalViewsAgg,
      pendingCommentsCount,
      activeAdsCount,
      newsletterCount,
      publishedToday,
      needsReview,
      recentDrafts,
      recentPublished,
      topArticles,
      pendingComments,
      recentActivity,
      activeBreaking,
    ] = await Promise.all([
      prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      prisma.article.count({ where: { status: ArticleStatus.DRAFT } }),
      prisma.article.count({ where: { status: ArticleStatus.PENDING } }),
      prisma.article.count({ where: { status: ArticleStatus.ARCHIVED } }),
      prisma.article.count({
        where: { isBreaking: true, status: ArticleStatus.PUBLISHED },
      }),
      prisma.article.count({
        where: { isFeatured: true, status: ArticleStatus.PUBLISHED },
      }),
      prisma.article.count({
        where: { type: "LIVE", status: ArticleStatus.PUBLISHED },
      }),
      prisma.article.aggregate({ _sum: { views: true } }),
      prisma.comment.count({ where: { status: CommentStatus.PENDING } }),
      prisma.ad.count({ where: { isActive: true } }),
      prisma.newsletterSubscriber.count({
        where: { status: SubscriberStatus.ACTIVE },
      }),
      prisma.article.count({
        where: {
          status: ArticleStatus.PUBLISHED,
          publishedAt: { gte: startOfToday },
        },
      }),
      prisma.article.findMany({
        where: { status: ArticleStatus.PENDING },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: articleListSelect,
      }),
      prisma.article.findMany({
        where: { status: ArticleStatus.DRAFT },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: articleListSelect,
      }),
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        orderBy: { publishedAt: "desc" },
        take: 8,
        select: articleListSelect,
      }),
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        orderBy: { views: "desc" },
        take: 8,
        select: articleListSelect,
      }),
      prisma.comment.findMany({
        where: { status: CommentStatus.PENDING },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          content: true,
          authorName: true,
          createdAt: true,
          article: { select: { id: true, title: true, titleNp: true } },
        },
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          details: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }),
      prisma.article.findMany({
        where: { isBreaking: true, status: ArticleStatus.PUBLISHED },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: articleListSelect,
      }),
    ]);

    return apiSuccess({
      stats: {
        published: publishedCount,
        drafts: draftCount,
        pending: pendingCount,
        archived: archivedCount,
        breaking: breakingCount,
        featured: featuredCount,
        live: liveCount,
        totalViews: totalViewsAgg._sum.views ?? 0,
        pendingComments: pendingCommentsCount,
        activeAds: activeAdsCount,
        newsletter: newsletterCount,
        publishedToday,
        totalArticles:
          publishedCount + draftCount + pendingCount + archivedCount,
      },
      queues: {
        needsReview,
        recentDrafts,
        recentPublished,
        topArticles,
        pendingComments,
        activeBreaking,
        recentActivity,
      },
    });
  } catch (error) {
    return handleServerError(error, "Failed to load dashboard");
  }
}
