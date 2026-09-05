import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleType, Role } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireStaff } from "@/lib/admin-auth";
import { sanitizeLiveUpdateHtml } from "@/lib/sanitize-html";
import { invalidatePublicArticles } from "@/lib/cache-invalidation";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const session = auth.session!;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));
    const skip = (page - 1) * limit;

    const where =
      session.user.role === Role.AUTHOR
        ? { type: ArticleType.LIVE, authorId: session.user.id }
        : { type: ArticleType.LIVE };

    const [liveArticles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: {
          id: true,
          title: true,
          titleNp: true,
          slug: true,
          status: true,
          updatedAt: true,
          authorId: true,
          category: {
            select: { name: true, nameNp: true },
          },
          _count: { select: { liveUpdates: true } },
          liveUpdates: {
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              id: true,
              title: true,
              content: true,
              createdAt: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return apiSuccess(
      { items: liveArticles, page, limit, total, totalPages: Math.ceil(total / limit) },
      "Live coverage articles retrieved successfully"
    );
  } catch (error) {
    return handleServerError(error, "Failed to retrieve live coverage articles");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;
    const session = auth.session!;

    const { articleId, title, content } = await request.json();

    if (!articleId || !title || !content) {
      return apiError("Article ID, update title, and content are required", 400);
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, type: true, authorId: true },
    });
    if (!article || article.type !== ArticleType.LIVE) {
      return apiError("Live article not found", 404);
    }
    if (session.user.role === Role.AUTHOR && article.authorId !== session.user.id) {
      return apiError("Unauthorized: You can only update your own live coverage", 403);
    }

    const liveUpdate = await prisma.liveUpdate.create({
      data: {
        articleId,
        title: title.trim(),
        content: sanitizeLiveUpdateHtml(content),
      },
    });

    await prisma.article.update({
      where: { id: articleId },
      data: { updatedAt: new Date() },
    });

    invalidatePublicArticles();
    return apiSuccess(liveUpdate, "Live update posted successfully", 201);
  } catch (error) {
    return handleServerError(error, "Failed to post live update");
  }
}
