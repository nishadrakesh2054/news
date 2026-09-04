import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleType } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import {
  clearExpiredBreakingArticles,
  getBreakingExpiries,
  setBreakingExpiry,
} from "@/lib/breaking-expiry";
import { sendBreakingArticlePush } from "@/lib/notification-dispatch";
import { invalidatePublicArticles, invalidatePublicBreaking } from "@/lib/cache-invalidation";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    await clearExpiredBreakingArticles();
    const expiries = await getBreakingExpiries();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10) || 50));
    const skip = (page - 1) * limit;

    const where = { isBreaking: true as const };
    const [breakingArticles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: {
          id: true,
          title: true,
          titleNp: true,
          slug: true,
          status: true,
          coverImage: true,
          isBreaking: true,
          updatedAt: true,
          category: {
            select: { name: true, nameNp: true },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    const withExpiry = breakingArticles.map((article) => ({
      ...article,
      breakingExpiresAt: expiries[article.id] ?? null,
    }));

    return apiSuccess(
      { items: withExpiry, page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
      "Breaking news items retrieved successfully"
    );
  } catch (error) {
    return handleServerError(error, "Failed to retrieve breaking news items");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { articleId, isBreaking, expiresAt } = await request.json();

    if (!articleId) {
      return apiError("Article ID is required", 400);
    }

    const article = await prisma.article.update({
      where: { id: articleId },
      data: {
        isBreaking: Boolean(isBreaking),
        ...(isBreaking !== false
          ? { type: ArticleType.BREAKING }
          : { type: ArticleType.STANDARD }),
      },
    });

    if (isBreaking === false) {
      await setBreakingExpiry(articleId, null);
    } else if (expiresAt) {
      const expiryDate = new Date(expiresAt);
      if (Number.isNaN(expiryDate.getTime())) {
        return apiError("Invalid expiry date", 400);
      }
      await setBreakingExpiry(articleId, expiryDate);
    } else {
      await setBreakingExpiry(articleId, null);
    }

    if (isBreaking !== false) {
      sendBreakingArticlePush({
        title: article.title,
        titleNp: article.titleNp,
        slug: article.slug,
      }).catch(() => {});
    }

    invalidatePublicBreaking();
    invalidatePublicArticles();

    return apiSuccess(
      {
        ...article,
        breakingExpiresAt: expiresAt ?? null,
      },
      isBreaking ? "Added to Breaking News ticker" : "Removed from Breaking News ticker"
    );
  } catch (error) {
    return handleServerError(error, "Failed to update breaking news status");
  }
}
