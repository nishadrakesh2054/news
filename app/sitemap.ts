import type { MetadataRoute } from "next";
import { ArticleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SITE_CONFIG } from "@/constants/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_CONFIG.url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${base}/search`, changeFrequency: "daily", priority: 0.5 },
    { url: `${base}/epaper`, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/media`, changeFrequency: "daily", priority: 0.6 },
  ];

  if (process.env.NEXT_PHASE === "phase-production-build") {
    return staticPages;
  }

  try {
    const [articles, categories] = await Promise.all([
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        select: { slug: true, updatedAt: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: 5000,
      }),
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${base}/category/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    const articlePages: MetadataRoute.Sitemap = articles.map((art) => ({
      url: `${base}/article/${art.slug}`,
      lastModified: art.updatedAt ?? art.publishedAt ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...categoryPages, ...articlePages];
  } catch {
    return staticPages;
  }
}
