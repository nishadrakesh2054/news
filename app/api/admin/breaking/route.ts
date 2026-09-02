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

export async function GET() {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    await clearExpiredBreakingArticles();
    const expiries = await getBreakingExpiries();

    const breakingArticles = await prisma.article.findMany({
      where: { isBreaking: true },
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
    });

    const withExpiry = breakingArticles.map((article) => ({
      ...article,
      breakingExpiresAt: expiries[article.id] ?? null,
    }));

    return apiSuccess(withExpiry, "Breaking news items retrieved successfully");
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
