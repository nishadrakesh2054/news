import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { recordPageView } from "@/lib/analytics-events";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const articleId = typeof body.articleId === "string" ? body.articleId : "";
    const path = typeof body.path === "string" ? body.path : "";

    if (!articleId) {
      return apiError("articleId is required", 400);
    }

    const ip = getClientIp(request);
    const rate = checkRateLimit(`pageview:${ip}:${articleId}`, 1, 30 * 60 * 1000);
    if (!rate.allowed) {
      return apiSuccess({ tracked: false }, "View already counted recently");
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { id: true, status: true },
    });

    if (!article || article.status !== ArticleStatus.PUBLISHED) {
      return apiError("Article not found", 404);
    }

    const userAgent = request.headers.get("user-agent") ?? undefined;
    const referrer = request.headers.get("referer") ?? body.referrer;

    await recordPageView({
      articleId,
      path: path || `/article/${articleId}`,
      referrer: typeof referrer === "string" ? referrer : undefined,
      userAgent,
    });

    return apiSuccess({ tracked: true }, "View recorded");
  } catch (error) {
    return handleServerError(error, "Failed to record page view");
  }
}
