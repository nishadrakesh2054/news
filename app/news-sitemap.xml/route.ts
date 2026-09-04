import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, LanguageEdition } from "@prisma/client";
import { absoluteUrl } from "@/lib/site-url";
import { SITE_CONFIG } from "@/constants/site";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  try {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const articles = await prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        OR: [
          { publishedAt: { gte: twoDaysAgo } },
          { publishedAt: null, createdAt: { gte: twoDaysAgo } },
        ],
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 1000,
      select: {
        slug: true,
        title: true,
        titleNp: true,
        publishedAt: true,
        createdAt: true,
        languageEdition: true,
      },
    });

    const entries: string[] = [];

    for (const art of articles) {
      const pubDate = (art.publishedAt || art.createdAt).toISOString();
      const edition = art.languageEdition;
      const variants: Array<{ lang: "ne" | "en"; name: string; title: string }> = [];

      if (!edition || edition === LanguageEdition.BOTH || edition === LanguageEdition.NEPALI_ONLY) {
        variants.push({
          lang: "ne",
          name: SITE_CONFIG.nameNp,
          title: art.titleNp || art.title,
        });
      }
      if (!edition || edition === LanguageEdition.BOTH || edition === LanguageEdition.ENGLISH_ONLY) {
        variants.push({
          lang: "en",
          name: SITE_CONFIG.name,
          title: art.title || art.titleNp || "",
        });
      }

      for (const v of variants) {
        entries.push(`  <url>
    <loc>${escapeXml(absoluteUrl(`/article/${art.slug}`, v.lang))}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(v.name)}</news:name>
        <news:language>${v.lang}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(v.title)}</news:title>
    </news:news>
  </url>`);
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries.join("\n")}
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
