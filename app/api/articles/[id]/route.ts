import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { apiSuccess, apiError } from "@/lib/api-response";
import { articleDetailSelect } from "@/lib/article-selects";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";

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
      select: articleDetailSelect,
    });

    if (!article) {
      return apiError("Article not found", 404);
    }

    const response = apiSuccess({
      ...article,
      coverImage: optimizeCloudinaryUrl(article.coverImage, "hero"),
      ogImage: optimizeCloudinaryUrl(article.ogImage, "og"),
      author: article.author
        ? {
            ...article.author,
            image: optimizeCloudinaryUrl(article.author.image, "avatar"),
          }
        : null,
    });

    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response;
  } catch (error) {
    console.error("GET Article Error:", error);
    return apiError("Failed to fetch article", 500);
  }
}
