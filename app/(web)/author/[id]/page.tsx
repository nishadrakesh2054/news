import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { ChevronRight } from "lucide-react";
import { absoluteUrl } from "@/lib/site-url";
import { SITE_CONFIG } from "@/constants/site";
import {
  languageEditionWhere,
  resolveAuthorName,
  resolveLanguageEdition,
} from "@/lib/language";
import { editionAlternates, pageTitle, requestHost } from "@/lib/seo";
import { NewsCard } from "@/components/portal/NewsCard";
import { PortalContainer } from "@/components/portal/SectionHeader";
import { PORTAL } from "@/constants/portal";

interface AuthorProfilePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}

async function resolvePageLang(searchParamsLang?: string) {
  const headerList = await headers();
  return resolveLanguageEdition(searchParamsLang, requestHost(headerList));
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
      title: pageTitle(lang === "en" ? "Author not found" : "लेखक भेटिएन", lang),
    };
  }

  const name = resolveAuthorName(author.name, lang);
  const headline = lang === "en" ? `${name} | Author` : `${name} | लेखक`;
  const description =
    lang === "en"
      ? `Articles by ${name} | ${SITE_CONFIG.name}`
      : `${name} द्वारा लेखिएका समाचार | ${SITE_CONFIG.nameNp}`;

  return {
    title: pageTitle(headline, lang),
    description,
    alternates: editionAlternates(`/author/${id}`, lang),
    openGraph: {
      title: pageTitle(headline, lang),
      description,
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
  const homeHref = isEnglish ? "/?lang=en" : "/";

  const author = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
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
          excerpt: true,
          excerptNp: true,
          coverImage: true,
          createdAt: true,
          views: true,
          category: {
            select: { name: true, nameNp: true, slug: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 24,
      },
    },
  });

  if (!author) {
    notFound();
  }

  const displayName = resolveAuthorName(author.name, lang);
  const initial = displayName.charAt(0).toUpperCase();

  const authorJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: displayName,
    image: author.image || undefined,
    url: absoluteUrl(`/author/${author.id}`, lang),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorJsonLd) }}
      />

      <main className="w-full bg-white pb-16 text-gray-900">
        <PortalContainer className="py-8 sm:py-10">
          <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-[12px] text-gray-400">
            <Link
              href={homeHref}
              className="transition-colors hover:underline"
              style={{ color: PORTAL.brand }}
            >
              {isEnglish ? "Home" : "गृह"}
            </Link>
            <span aria-hidden className="text-gray-300">
              /
            </span>
            <span className="font-medium" style={{ color: PORTAL.ink }}>
              {displayName}
            </span>
          </nav>

          <header className="mb-10 flex flex-col gap-5 border-b border-gray-200 pb-8 sm:flex-row sm:items-center">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden text-2xl font-extrabold text-white sm:h-24 sm:w-24"
              style={{ backgroundColor: PORTAL.brand }}
            >
              {author.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={author.image}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
            </div>

            <div className="min-w-0 space-y-2">
              <p
                className="text-[11px] font-bold uppercase tracking-wide"
                style={{ color: PORTAL.accent }}
              >
                {isEnglish ? "Author" : "लेखक"}
              </p>
              <h1
                className="text-3xl font-extrabold tracking-tight sm:text-4xl"
                style={{ color: PORTAL.brand }}
              >
                {displayName}
              </h1>
              <p className="text-sm text-gray-500">
                {author.articles.length}{" "}
                {isEnglish
                  ? author.articles.length === 1
                    ? "published article"
                    : "published articles"
                  : "प्रकाशित समाचार"}
              </p>
            </div>
          </header>

          <section>
            <div className="mb-4 flex items-center gap-3">
              <h2
                className="shrink-0 text-sm font-extrabold sm:text-base"
                style={{ color: PORTAL.brand }}
              >
                {isEnglish ? "Articles by this author" : "यस लेखकका समाचार"}
              </h2>
              <div
                className="h-px min-w-4 flex-1"
                style={{ backgroundColor: PORTAL.accent, opacity: 0.35 }}
              />
            </div>

            {author.articles.length > 0 ? (
              <div>
                {author.articles.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={{
                      ...article,
                      author: { name: displayName },
                    }}
                    lang={lang}
                    variant="list"
                    showExcerpt
                  />
                ))}
              </div>
            ) : (
              <p className="border border-dashed border-gray-200 px-4 py-12 text-center text-sm text-gray-500">
                {isEnglish
                  ? "No published articles from this author yet."
                  : "यो लेखकद्वारा हाल प्रकाशित कुनै समाचार छैन।"}
              </p>
            )}
          </section>

          <div className="mt-10">
            <Link
              href={homeHref}
              className="inline-flex items-center gap-1 text-sm font-bold hover:underline"
              style={{ color: PORTAL.brand }}
            >
              <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {isEnglish ? "Back to home" : "गृहपृष्ठमा फर्कनुहोस्"}
            </Link>
          </div>
        </PortalContainer>
      </main>
    </>
  );
}
