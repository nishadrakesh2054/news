import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: identifier } = await params;

    if (!identifier) {
      return apiError("Article identifier is required", 400);
    }

    const article = await prisma.article.findFirst({
      where: {
        status: ArticleStatus.PUBLISHED,
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        category: true,
        author: {
          select: { name: true, image: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
        liveUpdates: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!article) {
      return apiError("Article not found", 404);
    }

    return apiSuccess(article);
  } catch (error) {
    console.error("GET Article Error:", error);
    return apiError("Failed to fetch article", 500);
  }
}
