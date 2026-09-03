import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { ArrowLeft, Mail, Newspaper, UserRound } from "lucide-react";
import { absoluteUrl } from "@/lib/site-url";
import { SITE_CONFIG, SITE_TITLE_SUFFIX, SITE_TITLE_SUFFIX_NP } from "@/constants/site";
import {
  languageEditionWhere,
  resolveArticleTitle,
  resolveLanguageEdition,
} from "@/lib/language";

interface AuthorProfilePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}

async function resolvePageLang(searchParamsLang?: string) {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  return resolveLanguageEdition(searchParamsLang, host);
}

export async function generateMetadata({
  params,
  searchParams,
}: AuthorProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const query = await searchParams;
  const lang = await resolvePageLang(query.lang);
  const author = await prisma.user.findUnique({
    where: { id },
    select: { name: true, image: true },
  });

  if (!author) {
    return {
      title:
        lang === "en"
          ? `Author not found ${SITE_TITLE_SUFFIX}`
          : `लेखक भेटिएन ${SITE_TITLE_SUFFIX_NP}`,
    };
  }

  const name = author.name || (lang === "en" ? "Author" : "लेखक");
  return {
    title: lang === "en" ? `${name} | Author` : `${name} | लेखक प्रोफाइल`,
    description:
      lang === "en"
        ? `Articles by ${name} | ${SITE_CONFIG.name}`
        : `${name} द्वारा लेखिएका समाचार, रिपोर्ट, विश्लेषण र विशेष सामग्री | ${SITE_CONFIG.nameNp}`,
    alternates: {
      canonical: `/author/${id}`,
      languages: {
        "ne-NP": absoluteUrl(`/author/${id}`, "ne"),
        en: absoluteUrl(`/author/${id}`, "en"),
      },
    },
    openGraph: {
      title: lang === "en" ? `${name} | Author` : `${name} | लेखक प्रोफाइल`,
      description:
        lang === "en"
          ? `Articles by ${name} | ${SITE_CONFIG.name}`
          : `${name} द्वारा लेखिएका समाचार, रिपोर्ट, विश्लेषण र विशेष सामग्री | ${SITE_CONFIG.nameNp}`,
      url: absoluteUrl(`/author/${id}`, lang),
      type: "profile",
      images: author.image ? [{ url: author.image, width: 640, height: 640, alt: name }] : undefined,
    },
  };
}

export const revalidate = 60;

export default async function AuthorProfilePage({
  params,
  searchParams,
}: AuthorProfilePageProps) {
  const { id } = await params;
  const query = await searchParams;
  const lang = await resolvePageLang(query.lang);
  const isEnglish = lang === "en";
  const langQuery = isEnglish ? "?lang=en" : "";

  const author = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      articles: {
        where: {
          status: ArticleStatus.PUBLISHED,
          ...languageEditionWhere(lang),
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
        take: 8,
      },
    },
  });

  if (!author) {
    notFound();
  }

  const authorJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    image: author.image || undefined,
    sameAs: author.email ? `mailto:${author.email}` : undefined,
    url: absoluteUrl(`/author/${author.id}`, lang),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorJsonLd) }}
      />

      <main className="w-full bg-background pb-16">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          <Link
            href={isEnglish ? "/?lang=en" : "/"}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#027081] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {isEnglish ? "Back to home" : "गृहपृष्ठमा फर्कनुहोस्"}
          </Link>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#027081]/10 text-[#027081] text-2xl font-extrabold ring-4 ring-[#027081]/10">
                {author.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={author.image} alt={author.name} className="h-full w-full object-cover" />
                ) : (
                  author.name.charAt(0).toUpperCase()
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#027081]">
                  <UserRound className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-[0.12em]">
                    {isEnglish ? "Author profile" : "लेखक प्रोफाइल"}
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold text-foreground font-serif">{author.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {author.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Newspaper className="h-3.5 w-3.5" />
                    {author.articles.length}{" "}
                    {isEnglish ? "published articles" : "प्रकाशित लेख"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h2 className="text-xl font-extrabold text-foreground font-serif">
                {isEnglish ? "Articles by this author" : "लेखकका समाचार"}
              </h2>
            </div>

            {author.articles.length > 0 ? (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                {author.articles.map((article) => {
                  const title = resolveArticleTitle(article, lang);
                  return (
                    <Link
                      key={article.id}
                      href={`/article/${article.slug}${langQuery}`}
                      className="group flex gap-3 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors p-3"
                    >
                      {article.coverImage && (
                        <div className="h-20 w-20 overflow-hidden rounded-lg bg-muted shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={article.coverImage}
                            alt={title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="min-w-0 space-y-1">
                        <h3 className="text-sm font-bold text-foreground group-hover:text-[#027081] transition-colors leading-snug font-serif line-clamp-2">
                          {title}
                        </h3>
                        <span className="text-[10px] text-muted-foreground font-mono block">
                          {new Date(article.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                {isEnglish
                  ? "No published articles from this author yet."
                  : "यो लेखकद्वारा हाल प्रकाशित कुनै समाचार छैन।"}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
