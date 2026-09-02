import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleType } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireStaff } from "@/lib/admin-auth";

export async function GET() {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const liveArticles = await prisma.article.findMany({
      where: { type: ArticleType.LIVE },
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        status: true,
        updatedAt: true,
        category: {
          select: { name: true, nameNp: true },
        },
        liveUpdates: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return apiSuccess(liveArticles, "Live coverage articles retrieved successfully");
  } catch (error) {
    return handleServerError(error, "Failed to retrieve live coverage articles");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const { articleId, title, content } = await request.json();

    if (!articleId || !title || !content) {
      return apiError("Article ID, update title, and content are required", 400);
    }

    const liveUpdate = await prisma.liveUpdate.create({
      data: {
        articleId,
        title: title.trim(),
        content: content.trim(),
      },
    });

    await prisma.article.update({
      where: { id: articleId },
      data: { updatedAt: new Date() },
    });

    return apiSuccess(liveUpdate, "Live update posted successfully", 201);
  } catch (error) {
    return handleServerError(error, "Failed to post live update");
  }
}
