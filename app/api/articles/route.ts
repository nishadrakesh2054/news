import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, ArticleType, Prisma } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { MESSAGES } from "@/constants/messages";
import { articleListSelect, mapArticleListItem } from "@/lib/article-selects";
import { languageEditionWhere, resolveLanguageFromRequest } from "@/lib/language";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`articles:${ip}`, 120, 60 * 1000);
    if (!rate.allowed) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    const { searchParams } = new URL(request.url);
    const lang = resolveLanguageFromRequest(request);
    const categorySlug = searchParams.get("category") || "";
    const tagSlug = searchParams.get("tag") || "";
    const province = searchParams.get("province") || "";
    const district = searchParams.get("district") || "";
    const type = searchParams.get("type") || "";
    const cursor = searchParams.get("cursor") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10), 50);

    const where: Prisma.ArticleWhereInput = {
      status: ArticleStatus.PUBLISHED,
      ...languageEditionWhere(lang),
    };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (tagSlug) {
      where.tags = { some: { slug: tagSlug } };
    }

    if (province) {
      const provinceNum = Number(province);
      if (!Number.isNaN(provinceNum)) {
        where.province = provinceNum;
      }
    }

    if (district.trim()) {
      where.district = { contains: district.trim(), mode: "insensitive" };
    }

    if (type && Object.values(ArticleType).includes(type as ArticleType)) {
      where.type = type as ArticleType;
    }

    const useCursor = Boolean(cursor);
    const skip = useCursor ? undefined : (page - 1) * limit;

    const [total, articles] = await Promise.all([
      useCursor ? Promise.resolve(null) : prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        take: limit + (useCursor ? 1 : 0),
        ...(useCursor
          ? { cursor: { id: cursor }, skip: 1 }
          : { skip }),
        orderBy: { publishedAt: "desc" },
        select: articleListSelect,
      }),
    ]);

    const hasMore = useCursor && articles.length > limit;
    const pageArticles = hasMore ? articles.slice(0, limit) : articles;
    const nextCursor = hasMore ? pageArticles[pageArticles.length - 1]?.id ?? null : null;

    const res = apiSuccess({
      lang,
      articles: pageArticles.map((a) => mapArticleListItem(a, "card", lang)),
      pagination: useCursor
        ? { limit, nextCursor, hasMore }
        : {
            total,
            page,
            limit,
            totalPages: total !== null ? Math.ceil(total / limit) : 0,
          },
    });
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    res.headers.set("Content-Language", lang === "en" ? "en" : "ne");
    return res;
  } catch (error) {
    return handleServerError(error, MESSAGES.ARTICLES.FETCH_ERROR);
  }
}
