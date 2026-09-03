import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { clearExpiredBreakingArticlesIfDue } from "@/lib/breaking-expiry";
import {
  languageEditionWhere,
  resolveArticleTitle,
  resolveCategoryName,
  resolveLanguageFromRequest,
} from "@/lib/language";

export async function GET(request: NextRequest) {
  try {
    await clearExpiredBreakingArticlesIfDue();
    const lang = resolveLanguageFromRequest(request);

    const breakingArticles = await prisma.article.findMany({
      where: {
        isBreaking: true,
        status: ArticleStatus.PUBLISHED,
        ...languageEditionWhere(lang),
      },
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        languageEdition: true,
        updatedAt: true,
        category: {
          select: { name: true, nameNp: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

    const res = apiSuccess(
      breakingArticles.map((item) => ({
        ...item,
        lang,
        displayTitle: resolveArticleTitle(item, lang),
        displayCategory: resolveCategoryName(item.category, lang),
      })),
      "Breaking news items retrieved successfully"
    );
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
    res.headers.set("Content-Language", lang === "en" ? "en" : "ne");
    return res;
  } catch (error) {
    return handleServerError(error, "Failed to retrieve breaking news items");
  }
}
