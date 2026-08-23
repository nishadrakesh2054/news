import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";

export async function GET() {
  try {
    const siteUrl = process.env.NEXTAUTH_URL || "https://nepalnews.com";

    const articles = await prisma.article.findMany({
      where: { status: ArticleStatus.PUBLISHED },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        category: true,
        author: { select: { name: true } },
      },
    });

    const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>नेपाल न्युज पोर्टल्स (Nepal News Portal)</title>
  <link>${siteUrl}</link>
  <description>नेपाल र विश्वभरका मुख्य ताजा तथा निष्पक्ष समाचारहरू</description>
  <language>ne-NP</language>
  <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${articles
  .map((art) => {
    const title = (art.titleNp || art.title).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const excerpt = (art.excerpt || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const pubDate = new Date(art.publishedAt || art.createdAt).toUTCString();
    return `  <item>
    <title>${title}</title>
    <link>${siteUrl}/article/${art.slug}</link>
    <guid isPermaLink="true">${siteUrl}/article/${art.slug}</guid>
    <pubDate>${pubDate}</pubDate>
    <description>${excerpt}</description>
    <category>${art.category?.nameNp || art.category?.name || "समाचार"}</category>
    <author>${art.author?.name || "सम्पादकीय टोली"}</author>
  </item>`;
  })
  .join("\n")}
</channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=600, s-maxage=1200",
      },
    });
  } catch {
    return new NextResponse("Error generating RSS feed", { status: 500 });
  }
}
