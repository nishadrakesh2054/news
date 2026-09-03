import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { apiSuccess, apiError } from "@/lib/api-response";
import { articleDetailSelect, mapArticleDetail } from "@/lib/article-selects";
import { articleMatchesLang, resolveLanguageFromRequest } from "@/lib/language";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: identifier } = await params;
    const lang = resolveLanguageFromRequest(req);

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

    if (!article || !articleMatchesLang(article.languageEdition, lang)) {
      return apiError("Article not found", 404);
    }

    const response = apiSuccess(mapArticleDetail(article, lang));
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    response.headers.set("Content-Language", lang === "en" ? "en" : "ne");
    return response;
  } catch (error) {
    console.error("GET Article Error:", error);
    return apiError("Failed to fetch article", 500);
  }
}
