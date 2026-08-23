import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, ArticleType } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";

export async function GET() {
  try {
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
          take: 5,
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
    const session = await getServerSession(authOptions);

    if (!session || !([Role.ADMIN, Role.EDITOR, Role.AUTHOR] as Role[]).includes(session.user.role)) {
      return apiError("Unauthorized: Staff permissions required", 403);
    }

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

    // Touch article updatedAt timestamp so live readers get instant cache invalidation
    await prisma.article.update({
      where: { id: articleId },
      data: { updatedAt: new Date() },
    });

    return apiSuccess(liveUpdate, "Live update posted successfully", 201);
  } catch (error) {
    return handleServerError(error, "Failed to post live update");
  }
}
