import type { MetadataRoute } from "next";
import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sitemapEditionUrls } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    { path: "/", changeFrequency: "hourly" as const, priority: 1 },
    { path: "/epaper", changeFrequency: "daily" as const, priority: 0.6 },
    { path: "/media", changeFrequency: "daily" as const, priority: 0.6 },
    { path: "/galleries", changeFrequency: "daily" as const, priority: 0.6 },
    { path: "/rashifal", changeFrequency: "daily" as const, priority: 0.5 },
    { path: "/forex", changeFrequency: "daily" as const, priority: 0.5 },
    { path: "/gold-rate", changeFrequency: "daily" as const, priority: 0.5 },
    { path: "/unicode", changeFrequency: "monthly" as const, priority: 0.4 },
    { path: "/bs-date-converter", changeFrequency: "monthly" as const, priority: 0.4 },
    { path: "/about", changeFrequency: "monthly" as const, priority: 0.5 },
    { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  const staticPages: MetadataRoute.Sitemap = staticPaths.flatMap((item) =>
    sitemapEditionUrls(item.path, {
      lastModified: new Date(),
      changeFrequency: item.changeFrequency,
      priority: item.priority,
    })
  );

  if (process.env.NEXT_PHASE === "phase-production-build") {
    return staticPages;
  }

  try {
    const [articles, categories, tags, galleries, authors] = await Promise.all([
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        select: {
          slug: true,
          updatedAt: true,
          publishedAt: true,
          languageEdition: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 5000,
      }),
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
      }),
      prisma.tag.findMany({
        select: { slug: true },
        take: 500,
        orderBy: { name: "asc" },
      }),
      prisma.gallery.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
        take: 500,
      }),
      prisma.user.findMany({
        where: {
          articles: { some: { status: ArticleStatus.PUBLISHED } },
        },
        select: { id: true, updatedAt: true },
        take: 200,
      }),
    ]);

    const categoryPages = categories.flatMap((cat) =>
      sitemapEditionUrls(`/category/${cat.slug}`, {
        lastModified: cat.updatedAt,
        changeFrequency: "daily",
        priority: 0.8,
      })
    );

    const tagPages = tags.flatMap((tag) =>
      sitemapEditionUrls(`/tag/${tag.slug}`, {
        changeFrequency: "weekly",
        priority: 0.5,
      })
    );

    const galleryPages = galleries.flatMap((g) =>
      sitemapEditionUrls(`/gallery/${g.slug}`, {
        lastModified: g.updatedAt,
        changeFrequency: "weekly",
        priority: 0.55,
      })
    );

    const authorPages = authors.flatMap((a) =>
      sitemapEditionUrls(`/author/${a.id}`, {
        lastModified: a.updatedAt,
        changeFrequency: "weekly",
        priority: 0.45,
      })
    );

    const articlePages: MetadataRoute.Sitemap = [];
    for (const art of articles) {
      const meta = {
        lastModified: art.updatedAt ?? art.publishedAt ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
      const edition = art.languageEdition;
      const includeNe = !edition || edition === "BOTH" || edition === "NEPALI_ONLY";
      const includeEn = !edition || edition === "BOTH" || edition === "ENGLISH_ONLY";
      const urls = sitemapEditionUrls(`/article/${art.slug}`, meta);
      if (includeNe) articlePages.push(urls[0]);
      if (includeEn) articlePages.push(urls[1]);
    }

    return [
      ...staticPages,
      ...categoryPages,
      ...tagPages,
      ...galleryPages,
      ...authorPages,
      ...articlePages,
    ];
  } catch {
    return staticPages;
  }
}
