import { NextRequest } from "next/server";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { mapArticleListItem } from "@/lib/article-selects";
import { parseSearchPagination } from "@/lib/search";
import { searchPublishedArticles } from "@/lib/article-search";
import { resolveLanguageFromRequest } from "@/lib/language";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`search:${ip}`, 60, 60 * 1000);
    if (!rate.allowed) {
      return apiError("Too many search requests. Please try again later.", 429);
    }

    const { searchParams } = new URL(request.url);
    const lang = resolveLanguageFromRequest(request);
    const query = searchParams.get("q") || "";
    const categorySlug = searchParams.get("category") || "";
    const tagSlug = searchParams.get("tag") || "";
    const province = searchParams.get("province") || "";
    const district = searchParams.get("district") || "";
    const { page, limit, deep, sort } = parseSearchPagination(searchParams);

    const { articles, total, engine } = await searchPublishedArticles({
      query,
      categorySlug,
      tagSlug,
      province,
      district,
      deep,
      sort,
      page,
      limit,
      lang,
    });

    const response = apiSuccess({
      lang,
      articles: articles.map((a) => mapArticleListItem(a, "card", lang)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      query,
      engine,
    });

    response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=300");
    response.headers.set("Content-Language", lang === "en" ? "en" : "ne");
    return response;
  } catch (error) {
    return handleServerError(error, "खोज नतिजा प्राप्त गर्न सकिएन (Search failed)");
  }
}
