import { cache } from "react";
import { unstable_cache } from "next/cache";
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
} as const;

/**
 * Cross-request cache + per-request React cache.
 * Metadata and page share one DB read for the same slug.
 */
export const getArticleBySlug = cache(async (slug: string) => {
  return unstable_cache(
    () =>
      prisma.article.findUnique({
        where: { slug },
        select: articlePageSelect,
      }),
    [`public-article-v1-${slug}`],
    { revalidate: 60, tags: [CACHE_TAGS.articles] }
  )();
});

/** Same loader as getArticleBySlug — kept for call-site clarity in generateMetadata. */
export const getArticleMetaBySlug = getArticleBySlug;
