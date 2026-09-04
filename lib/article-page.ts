import { cache } from "react";
import { prisma } from "@/lib/prisma";

const articleMetaSelect = {
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
} as const;

const articlePageSelect = {
  ...articleMetaSelect,
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
} as const;

/** Dedupes metadata + page queries within a single request. */
export const getArticleBySlug = cache(async (slug: string) => {
  return prisma.article.findUnique({
    where: { slug },
    select: articlePageSelect,
  });
});

export const getArticleMetaBySlug = cache(async (slug: string) => {
  return prisma.article.findUnique({
    where: { slug },
    select: articleMetaSelect,
  });
});
