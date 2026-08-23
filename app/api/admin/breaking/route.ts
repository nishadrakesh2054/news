import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";

export async function GET() {
  try {
    const breakingArticles = await prisma.article.findMany({
      where: { isBreaking: true },
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
      },
      orderBy: { updatedAt: "desc" },
    });

    return apiSuccess(breakingArticles, "Breaking news items retrieved successfully");
  } catch (error) {
    return handleServerError(error, "Failed to retrieve breaking news items");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !([Role.ADMIN, Role.EDITOR] as Role[]).includes(session.user.role)) {
      return apiError("Unauthorized: Staff permissions required", 403);
    }

    const { articleId, isBreaking } = await request.json();

    if (!articleId) {
      return apiError("Article ID is required", 400);
    }

    const article = await prisma.article.update({
      where: { id: articleId },
      data: { isBreaking: Boolean(isBreaking) },
    });

    return apiSuccess(
      article,
      isBreaking ? "Added to Breaking News ticker" : "Removed from Breaking News ticker"
    );
  } catch (error) {
    return handleServerError(error, "Failed to update breaking news status");
  }
}
