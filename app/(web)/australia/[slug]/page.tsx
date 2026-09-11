import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Clock } from "lucide-react";
import { ArticleStatus, AuRegion } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  resolveLanguageEdition,
  resolveArticleTitle,
  languageEditionWhere,
} from "@/lib/language";
import { formatTimeAgo } from "@/lib/nepaliDate";
import { editionAlternates, pageTitle, requestHost } from "@/lib/seo";
import { PortalContainer, SectionHeader } from "@/components/portal/SectionHeader";
import { PORTAL } from "@/constants/portal";
import {
  AU_REGIONS,
  getAuRegionBySlug,
  resolveAuRegionName,
} from "@/constants/australia-regions";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";

interface AustraliaRegionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: AustraliaRegionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, requestHost(headerList));
  const region = getAuRegionBySlug(slug);
  const name = region ? resolveAuRegionName(region, lang === "en" ? "en" : "ne") : slug;
  const title = lang === "en" ? `${name} news` : `${name} समाचार`;
  return {
    title: pageTitle(title, lang),
    description:
      lang === "en" ? `Latest news from ${name}.` : `${name} बाट ताजा समाचार।`,
    alternates: editionAlternates(`/australia/${slug}`, lang),
  };
}

export const revalidate = 60;

export default async function AustraliaRegionPage({
  params,
  searchParams,
}: AustraliaRegionPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, requestHost(headerList));
  const isEnglish = lang === "en";
  const langQ = isEnglish ? "?lang=en" : "";

  const region = getAuRegionBySlug(slug);
  if (!region) return notFound();

  const articles = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      auRegion: region.code as AuRegion,
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
    orderBy: { publishedAt: "desc" },
    take: 30,
  });

  const regionName = resolveAuRegionName(region, isEnglish ? "en" : "ne");
  const lead = articles[0] ?? null;
  const secondary = articles.slice(1, 3);
  const rest = articles.slice(3);

  return (
    <main className="w-full bg-white pb-16 pt-6 text-gray-900">
      <PortalContainer className="space-y-6">
        <SectionHeader
          title={regionName}
          href={`/australia${langQ}`}
          linkLabel={isEnglish ? "All Australia" : "सबै अष्ट्रेलिया"}
        />

        <div className="flex flex-wrap gap-1.5">
          {AU_REGIONS.map((r) => {
            const active = r.code === region.code;
            return (
              <Link
                key={r.code}
                href={`/australia/${r.slug}${langQ}`}
                className={`px-2.5 py-1.5 text-xs font-bold ${
                  active ? "text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                style={active ? { backgroundColor: PORTAL.brand } : undefined}
              >
                {isEnglish ? r.short : resolveAuRegionName(r, "ne")}
              </Link>
            );
          })}
        </div>

        {articles.length === 0 ? (
          <p className="border border-dashed border-gray-300 px-4 py-12 text-center text-sm text-gray-500">
            {isEnglish
              ? `No news for ${region.name} yet.`
              : `${regionName}मा हाल कुनै समाचार छैन।`}
          </p>
        ) : (
          <div className="space-y-8">
            {/* Latest: large overlay + 2 secondary */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
              {lead ? (
                <Link
                  href={`/article/${lead.slug}${langQ}`}
                  className="group relative block min-h-[280px] overflow-hidden bg-neutral-800 sm:min-h-[360px] lg:col-span-8"
                >
                  {lead.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        optimizeCloudinaryUrl(lead.coverImage, "hero") || lead.coverImage
                      }
                      alt={resolveArticleTitle(lead, lang)}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : null}
                  <div
                    className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-24 sm:px-5 sm:pb-5 sm:pt-28"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0) 100%)",
                    }}
                  >
                    <span className="mb-2 inline-block text-[11px] font-bold uppercase text-white/90">
                      {region.short} · {isEnglish ? "Latest" : "ताजा"}
                    </span>
                    <h1
                      className="line-clamp-3 text-xl font-extrabold leading-snug text-white sm:text-3xl"
                      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.65)" }}
                    >
                      {resolveArticleTitle(lead, lang)}
                    </h1>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/90">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {formatTimeAgo(lead.createdAt, lang)}
                    </p>
                  </div>
                </Link>
              ) : null}

              <div className="flex flex-col gap-4 lg:col-span-4">
                {secondary.map((art) => {
                  const title = resolveArticleTitle(art, lang);
                  const image =
                    optimizeCloudinaryUrl(art.coverImage || undefined, "card") || art.coverImage;
                  return (
                    <Link
                      key={art.id}
                      href={`/article/${art.slug}${langQ}`}
                      className="group relative block min-h-[170px] flex-1 overflow-hidden bg-neutral-800"
                    >
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt={title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      ) : null}
                      <div
                        className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-14"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0) 100%)",
                        }}
                      >
                        <h2 className="line-clamp-3 text-sm font-bold leading-snug text-white sm:text-base">
                          {title}
                        </h2>
                        <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-white/85">
                          <Clock className="h-3 w-3" aria-hidden />
                          {formatTimeAgo(art.createdAt, lang)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* More stories grid */}
            {rest.length > 0 ? (
              <section className="space-y-4">
                <h2 className="text-sm font-extrabold sm:text-base" style={{ color: PORTAL.brand }}>
                  {isEnglish ? "More from this region" : "यस क्षेत्रका थप समाचार"}
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((art) => {
                    const title = resolveArticleTitle(art, lang);
                    const image =
                      optimizeCloudinaryUrl(art.coverImage || undefined, "card") ||
                      art.coverImage;
                    return (
                      <Link
                        key={art.id}
                        href={`/article/${art.slug}${langQ}`}
                        className="group block space-y-2"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-gray-200">
                          {image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={image}
                              alt={title}
                              className="h-full w-full object-cover transition-opacity group-hover:opacity-95"
                            />
                          ) : null}
                        </div>
                        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 group-hover:underline sm:text-[15px]">
                          {title}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                          <Clock className="h-3 w-3" aria-hidden />
                          {formatTimeAgo(art.createdAt, lang)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </PortalContainer>
    </main>
  );
}
