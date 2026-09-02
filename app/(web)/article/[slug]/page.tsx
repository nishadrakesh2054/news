import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, AdSlot } from "@prisma/client";
import { formatTimeAgoNp, getFormattedNepaliDate } from "@/lib/nepaliDate";
import { Calendar, Eye, User, ChevronRight } from "lucide-react";
import { FacebookIcon, TwitterIcon } from "@/components/portal/SocialIcons";
import { ArticleBodyClient } from "@/components/web/ArticleBodyClient";
import { CommentsSection } from "@/components/web/CommentsSection";
import { AudioNewsPlayer } from "@/components/portal/AudioNewsPlayer";
import { ArticleViewTracker } from "@/components/portal/ArticleViewTracker";
import { AdUnit } from "@/components/portal/AdUnit";
import { SITE_CONFIG, SITE_TITLE_SUFFIX_NP } from "@/constants/site";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

// 1. Dynamic SEO Metadata Generator for Social Previews (Facebook/Viber/Twitter)
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!article) {
    return {
      title: `समाचार भेटिएन ${SITE_TITLE_SUFFIX_NP}`,
    };
  }

  const title = article.metaTitle || article.titleNp || article.title;
  const description = article.metaDescription || article.excerpt || SITE_CONFIG.domain;
  const image = article.ogImage || article.coverImage || "/favicon.ico";

  return {
    title: `${title} ${SITE_TITLE_SUFFIX_NP}`,
    description,
    keywords: article.keywords ? article.keywords.split(",") : undefined,
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/article/${article.slug}`),
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export const revalidate = 60; // ISR cache revalidation every 60s

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;

  // Increment view counter & fetch article
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      author: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  if (!article || article.status !== ArticleStatus.PUBLISHED) {
    return notFound();
  }

  const [inArticleAd, relatedArticles] = await Promise.all([
    prisma.ad.findFirst({
      where: { slot: AdSlot.IN_ARTICLE, isActive: true },
      select: { id: true, title: true, imageUrl: true, targetUrl: true, scriptCode: true },
    }),
    prisma.article.findMany({
      where: {
        categoryId: article.categoryId,
        id: { not: article.id },
        status: ArticleStatus.PUBLISHED,
      },
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        coverImage: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  // Google NewsArticle JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.titleNp || article.title,
    image: article.coverImage ? [article.coverImage] : [],
    datePublished: article.createdAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: article.author.name || "सम्पादकीय प्रतिनिधि",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo.png"),
      },
    },
    description: article.excerpt || article.metaDescription || "",
  };

  const articleTitle = article.titleNp || article.title;
  const shareUrl = absoluteUrl(`/article/${article.slug}`);

  return (
    <>
      <ArticleViewTracker articleId={article.id} path={`/article/${article.slug}`} />
      {/* 2. Injected Google NewsArticle JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="w-full bg-background pb-16">
        <div className="max-w-[1480px] mx-auto px-4 py-8 space-y-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground border-b border-border/40 pb-3">
            <Link href="/" className="hover:text-[#027081]">गृह</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/category/${article.category.slug}`} className="text-[#027081] hover:underline">
              {article.category.nameNp || article.category.name}
            </Link>
          </nav>

          {/* Article Header & Headline */}
          <header className="space-y-4">
            <span className="inline-block bg-[#027081] text-white text-xs font-bold px-3 py-1 uppercase rounded-none">
              {article.category.nameNp || article.category.name}
            </span>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground leading-tight tracking-tight font-serif">
              {articleTitle}
            </h1>

            {article.excerpt && (
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-serif">
                {article.excerpt}
              </p>
            )}

            {/* Author, Date & View Count Meta */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-y border-border/40 py-3 text-xs text-muted-foreground font-mono">
              <div className="flex items-center space-x-4">
                <span className="flex items-center gap-1.5 font-bold text-foreground">
                  <User className="h-3.5 w-3.5 text-[#027081]" />
                  <span>{article.author.name || "सम्पादकीय टोली"}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#027081]" />
                  <span>{getFormattedNepaliDate(article.createdAt)}</span>
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-[#027081]" />
                  <span>{article.views.toLocaleString()} पढिएको</span>
                </span>
              </div>
            </div>

            {/* Social Share Bar */}
            <div className="flex items-center space-x-2 pt-1">
              <span className="text-xs font-bold text-muted-foreground mr-2">सेयर गर्नुहोस्:</span>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 bg-[#1877F2] text-white px-3 py-1.5 text-xs font-bold hover:opacity-90 transition-opacity rounded-none"
              >
                <FacebookIcon className="h-3.5 w-3.5" />
                <span>फेसबुक</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 bg-sky-500 text-white px-3 py-1.5 text-xs font-bold hover:opacity-90 transition-opacity rounded-none"
              >
                <TwitterIcon className="h-3.5 w-3.5" />
                <span>ट्विटर</span>
              </a>
              <a
                href={`viber://forward?text=${encodeURIComponent(articleTitle + " " + shareUrl)}`}
                className="flex items-center space-x-1.5 bg-purple-600 text-white px-3 py-1.5 text-xs font-bold hover:opacity-90 transition-opacity rounded-none"
              >
                <span>भाइबर</span>
              </a>
            </div>

          </header>

          {/* Author profile card */}
          {article.author && (
            <section className="border-l-4 border-[#027081] bg-card p-5 border-y border-r border-border rounded-none">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center bg-[#027081]/10 text-[#027081] text-lg font-extrabold rounded-none">
                    {article.author.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={article.author.image}
                        alt={article.author.name || "Author"}
                        className="h-full w-full object-cover rounded-none"
                      />
                    ) : (
                      (article.author.name || "ए").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">लेखक</p>
                    <h2 className="text-lg font-extrabold text-foreground font-serif">
                      {article.author.name || "सम्पादकीय टोली"}
                    </h2>
                    <p className="text-xs text-muted-foreground">{SITE_CONFIG.nameNp} समाचार टोली</p>
                  </div>
                </div>

                <Link
                  href={`/author/${article.author.id}`}
                  className="inline-flex items-center gap-2 border border-[#027081]/30 bg-[#027081]/5 px-3 py-2 text-xs font-bold text-[#027081] hover:bg-[#027081]/10 transition-colors rounded-none"
                >
                  प्रोफाइल हेर्नुहोस्
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </section>
          )}

          {/* AI Audio News Reader Player (समाचार सुन्नुहोस्) */}
          <AudioNewsPlayer
            textToRead={article.contentNp || article.content}
            title={articleTitle}
          />

          {/* Featured Cover Image */}
          {article.coverImage && (
            <figure className="space-y-2">
              <div className="overflow-hidden border border-border rounded-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.coverImage}
                  alt={articleTitle}
                  className="w-full h-auto max-h-125 object-cover rounded-none"
                />
              </div>
              {article.caption && (
                <figcaption className="text-xs text-muted-foreground text-center font-serif italic">
                  तस्बिर: {article.caption}
                </figcaption>
              )}
            </figure>
          )}

          {/* In-Article Monetization Banner */}
          {inArticleAd ? (
            <AdUnit
              ad={inArticleAd}
              path={`/article/${article.slug}`}
              className="w-full h-30 border border-border rounded-none"
            />
          ) : null}

          {/* Interactive Article Content with Font Resizer & Audio Reader */}
          <ArticleBodyClient
            title={articleTitle}
            content={article.content}
            shareUrl={shareUrl}
          />

          {/* Related Articles Recommendation Grid */}
          {relatedArticles.length > 0 && (
            <section className="pt-10 border-t-2 border-[#027081] space-y-6">
              <h3 className="text-xl font-extrabold text-[#027081] font-serif uppercase tracking-wider">
                यस श्रेणीका थप समाचार
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/article/${rel.slug}`}
                    className="group flex space-x-3.5 p-3 border-b border-border/50 hover:bg-muted/40 transition-colors rounded-none"
                  >
                    {rel.coverImage && (
                      <div className="h-20 w-24 overflow-hidden shrink-0 bg-muted rounded-none">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={rel.coverImage}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-none"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 group-hover:text-[#027081] transition-colors leading-snug font-serif">
                        {rel.titleNp || rel.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground font-mono block">
                        {formatTimeAgoNp(rel.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Interactive Comments & Reader Discussion */}
          <CommentsSection articleId={article.id} />
        </div>
      </main>
    </>
  );
}
