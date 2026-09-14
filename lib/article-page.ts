import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/public-cache";

const articlePageSelect = {
  id: true,
  slug: true,
  title: true,
  titleNp: true,
  excerpt: true,
  excerptNp: true,
  metaTitle: true,
  metaTitleNp: true,
  metaDescription: true,
  metaDescriptionNp: true,
  keywords: true,
  keywordsNp: true,
  coverImage: true,
  ogImage: true,
  languageEdition: true,
  category: { select: { id: true, name: true, nameNp: true, slug: true } },
  content: true,
  contentNp: true,
  caption: true,
  views: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  status: true,
  categoryId: true,
  author: {
    select: { id: true, name: true, email: true, image: true },
  },
  showAds: true,
} satisfies Prisma.ArticleSelect;

export type ArticlePageData = Prisma.ArticleGetPayload<{
  select: typeof articlePageSelect;
}>;

/** unstable_cache JSON-serializes Dates → revive so .toISOString() works. */
function reviveArticleDates(
  article: ArticlePageData | null
): ArticlePageData | null {
  if (!article) return null;
  return {
    ...article,
    createdAt: new Date(article.createdAt),
    updatedAt: new Date(article.updatedAt),
    publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
  };
}

/**
 * Cross-request cache + per-request React cache.
 * Metadata and page share one DB read for the same slug.
 */
export const getArticleBySlug = cache(async (slug: string) => {
  const row = await unstable_cache(
    () =>
      prisma.article.findUnique({
        where: { slug },
        select: articlePageSelect,
      }),
    [`public-article-v2-${slug}`],
    { revalidate: 60, tags: [CACHE_TAGS.articles] }
  )();
  // Cache may return ISO strings for Date fields — cast then revive.
  return reviveArticleDates(row as ArticlePageData | null);
});

/** Same loader as getArticleBySlug — kept for call-site clarity in generateMetadata. */
export const getArticleMetaBySlug = getArticleBySlug;
