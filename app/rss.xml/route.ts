import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { getEnglishSiteUrl, getSiteUrl } from "@/lib/site-url";
import { SITE_CONFIG } from "@/constants/site";
import { languageEditionWhere } from "@/lib/language";

export const revalidate = 300;

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(request: NextRequest) {
  try {
    const langParam = request.nextUrl.searchParams.get("lang");
    const isEnglish = langParam === "en";
    const siteUrl = isEnglish ? getEnglishSiteUrl() : getSiteUrl();
    const selfHref = isEnglish ? `${siteUrl}/rss.xml?lang=en` : `${siteUrl}/rss.xml`;

    const articles = await prisma.article.findMany({
      where: {
        status: ArticleStatus.PUBLISHED,
        ...languageEditionWhere(isEnglish ? "en" : "ne"),
      },
      orderBy: { publishedAt: "desc" },
      take: 30,
      include: {
        category: true,
        author: { select: { name: true } },
      },
    });

    const channelTitle = isEnglish
      ? `${SITE_CONFIG.name} — News RSS`
      : `${SITE_CONFIG.nameNp} — समाचार RSS`;
    const channelDesc = isEnglish
      ? SITE_CONFIG.description
      : "इको माञ्च — नेपालका ताजा समाचार।";

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(channelTitle)}</title>
  <link>${escapeXml(siteUrl)}</link>
  <description>${escapeXml(channelDesc)}</description>
  <language>${isEnglish ? "en" : "ne-NP"}</language>
  <atom:link href="${escapeXml(selfHref)}" rel="self" type="application/rss+xml" />
  <atom:link href="${escapeXml(getSiteUrl() + "/rss.xml")}" rel="alternate" hreflang="ne-NP" type="application/rss+xml" />
  <atom:link href="${escapeXml(getEnglishSiteUrl() + "/rss.xml?lang=en")}" rel="alternate" hreflang="en" type="application/rss+xml" />
${articles
  .map((art) => {
    const title = escapeXml(
      isEnglish
        ? art.title || art.titleNp || ""
        : art.titleNp || art.title || ""
    );
    const excerpt = escapeXml(
      isEnglish
        ? art.excerpt || art.excerptNp || ""
        : art.excerptNp || art.excerpt || ""
    );
    const pubDate = new Date(art.publishedAt || art.createdAt).toUTCString();
    const cat = escapeXml(
      isEnglish
        ? art.category?.name || art.category?.nameNp || "News"
        : art.category?.nameNp || art.category?.name || "समाचार"
    );
    const author = escapeXml(art.author?.name || (isEnglish ? "Editorial" : "सम्पादकीय टोली"));
    const link = `${siteUrl}/article/${art.slug}${isEnglish ? "?lang=en" : ""}`;
    return `  <item>
    <title>${title}</title>
    <link>${escapeXml(link)}</link>
    <guid isPermaLink="true">${escapeXml(link)}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${excerpt}</description>
    <category>${cat}</category>
    <author>${author}</author>
  </item>`;
  })
  .join("\n")}
</channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return new NextResponse("RSS unavailable", { status: 503 });
  }
}
