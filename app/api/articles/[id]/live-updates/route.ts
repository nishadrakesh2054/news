import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, ArticleType } from "@prisma/client";
import { apiSuccess, apiError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/** Light poll endpoint for live blogs — updates only, no full article body. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`live-updates:${ip}`, 60, 60 * 1000);
    if (!rate.allowed) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    const { id: identifier } = await params;
    if (!identifier) {
      return apiError("Article identifier is required", 400);
    }

    const article = await prisma.article.findFirst({
      where: {
        status: ArticleStatus.PUBLISHED,
        type: ArticleType.LIVE,
        OR: [{ id: identifier }, { slug: identifier }],
      },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
        liveUpdates: {
          orderBy: { createdAt: "desc" },
          take: 40,
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });

    if (!article) {
      return apiError("Live article not found", 404);
    }

    const response = apiSuccess({
      id: article.id,
      slug: article.slug,
      updatedAt: article.updatedAt,
      liveUpdates: article.liveUpdates,
    });
    response.headers.set("Cache-Control", "public, s-maxage=15, stale-while-revalidate=60");
    return response;
  } catch (error) {
    console.error("GET live updates error:", error);
    return apiError("Failed to fetch live updates", 500);
  }
}
