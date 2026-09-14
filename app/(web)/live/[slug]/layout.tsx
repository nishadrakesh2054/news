import type { Metadata } from "next";
import { headers } from "next/headers";
import { ArticleStatus } from "@prisma/client";
import { SITE_CONFIG } from "@/constants/site";
import {
  resolveArticleExcerpt,
  resolveArticleTitle,
  resolveLanguageEdition,
  resolveMetaDescription,
} from "@/lib/language";
import { prisma } from "@/lib/prisma";
import {
  SITE_LANG_HEADER,
  defaultDescription,
  editionAlternates,
  pageTitle,
  requestHost,
} from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-url";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const headerList = await headers();
  const lang = resolveLanguageEdition(
    headerList.get(SITE_LANG_HEADER),
    requestHost(headerList)
  );

  const article = await prisma.article.findFirst({
    where: { slug, status: ArticleStatus.PUBLISHED },
    select: {
      title: true,
      titleNp: true,
      excerpt: true,
      excerptNp: true,
      metaDescription: true,
      metaDescriptionNp: true,
      coverImage: true,
      ogImage: true,
      slug: true,
    },
  });

  if (!article) {
    const title = lang === "en" ? "Live coverage" : "प्रत्यक्ष कभरेज";
    return {
      title: pageTitle(title, lang),
      description:
        lang === "en"
          ? "Live news updates and coverage."
          : "प्रत्यक्ष समाचार अपडेट र कभरेज।",
      alternates: editionAlternates(`/live/${slug}`, lang),
      robots: { index: false, follow: true },
    };
  }

  const headline = resolveArticleTitle(article, lang);
  const liveLabel = lang === "en" ? "Live" : "प्रत्यक्ष";
  const title = pageTitle(`${liveLabel}: ${headline}`, lang);
  const description =
    resolveMetaDescription(article, lang) ||
    resolveArticleExcerpt(article, lang) ||
    defaultDescription(lang);
  const image = article.ogImage || article.coverImage || SITE_CONFIG.ogImagePath;
  // Prefer the article URL as canonical to avoid duplicate indexing with /live/.
  const canonicalPath = `/article/${article.slug}`;

  return {
    title,
    description,
    alternates: {
      ...editionAlternates(canonicalPath, lang),
      canonical: absoluteUrl(canonicalPath, lang),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/live/${article.slug}`, lang),
      type: "article",
      images: [{ url: image, width: 1200, height: 630, alt: headline }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: { index: false, follow: true },
  };
}

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
