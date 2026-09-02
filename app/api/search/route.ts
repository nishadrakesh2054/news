import { NextRequest } from "next/server";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { articleListSelect, mapArticleListItem } from "@/lib/article-selects";
import { parseSearchPagination } from "@/lib/search";
import { searchPublishedArticles } from "@/lib/article-search";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
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
    });

    const response = apiSuccess({
      articles: articles.map((a) => mapArticleListItem(a)),
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
    return response;
  } catch (error) {
    return handleServerError(error, "खोज नतिजा प्राप्त गर्न सकिएन (Search failed)");
  }
}
