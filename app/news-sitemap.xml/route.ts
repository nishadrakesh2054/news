import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { getSiteUrl } from "@/lib/site-url";

export async function GET() {
  try {
    const siteUrl = getSiteUrl();

    // Google News sitemaps should contain articles published in the last 48 hours
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const articles = await prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        createdAt: { gte: twoDaysAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
      include: {
        category: true,
      },
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articles
  .map((art) => {
    const pubDate = (art.publishedAt || art.createdAt).toISOString();
    const title = (art.titleNp || art.title).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `  <url>
    <loc>${siteUrl}/article/${art.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>नेपाल न्युज पोर्टल्स</news:name>
        <news:language>ne</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
  })
  .join("\n")}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=600, s-maxage=1200",
      },
    });
  } catch {
    return new NextResponse("Error generating news sitemap", { status: 500 });
  }
}
