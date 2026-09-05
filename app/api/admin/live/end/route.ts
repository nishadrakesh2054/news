import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleType } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { invalidatePublicArticles } from "@/lib/cache-invalidation";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { articleId } = await request.json();
    if (!articleId) {
      return apiError("articleId is required", 400);
    }

    const article = await prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
      return apiError("Article not found", 404);
    }

    const updated = await prisma.article.update({
      where: { id: articleId },
      data: { type: ArticleType.STANDARD },
    });

    invalidatePublicArticles();
    return apiSuccess(updated, "Live coverage ended — article moved to standard format");
  } catch (error) {
    return handleServerError(error, "Failed to end live coverage");
  }
}
