"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import type { LanguageEditionType } from "@/lib/language";
import { resolveArticleTitle, resolveCategoryName } from "@/lib/language";
import { formatTimeAgo } from "@/lib/nepaliDate";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";
import { PortalImage } from "@/components/portal/PortalImage";
import { PORTAL } from "@/constants/portal";
import { SectionHeader } from "@/components/portal/SectionHeader";
import {
  AU_REGIONS,
  resolveAuRegionName,
} from "@/constants/australia-regions";
import type { PortalArticleCard } from "@/components/portal/NewsCard";

export type AuNewsArticle = PortalArticleCard & {
  auRegion?: string | null;
};

type AustraliaNewsSectionProps = {
  stateArticles: AuNewsArticle[];
  territoryArticles: AuNewsArticle[];
  lang: LanguageEditionType;
};

/** Site logo / empty covers are not real story photos — treat as missing. */
function realCoverUrl(coverImage?: string | null): string | null {
  if (!coverImage?.trim()) return null;
  const src = coverImage.trim();
  if (src === "/logo/logo.png" || src.endsWith("/logo/logo.png")) return null;
  if (src.includes("picsum.photos")) return null;
  return optimizeCloudinaryUrl(src, "card") || src;
}

function AuCard({
  article,
  lang,
  size,
}: {
  article: AuNewsArticle;
  lang: LanguageEditionType;
  size: "large" | "small";
}) {
  const title = resolveArticleTitle(article, lang);
  const href = lang === "en" ? `/article/${article.slug}?lang=en` : `/article/${article.slug}`;
  const image = realCoverUrl(article.coverImage);
  const region = AU_REGIONS.find((r) => r.code === article.auRegion);
  const category = article.category ? resolveCategoryName(article.category, lang) : null;
  const label = region?.short || category;
  const when = formatTimeAgo(
    typeof article.createdAt === "string" ? new Date(article.createdAt) : article.createdAt,
    lang
  );

  if (size === "large") {
    return (
      <Link
        href={href}
        className="group relative block min-h-[180px] flex-1 overflow-hidden bg-gray-100 sm:min-h-[200px]"
      >
        {image ? (
          <PortalImage
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 40vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div
            className="absolute inset-0 opacity-90"
            style={{
              background: `linear-gradient(135deg, ${PORTAL.brand} 0%, #0d3a73 55%, ${PORTAL.accent} 100%)`,
            }}
            aria-hidden
          />
        )}
        <div
          className="absolute inset-x-0 bottom-0 z-10 px-3 pb-3 pt-12 sm:px-4 sm:pb-4 sm:pt-16"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0) 100%)",
          }}
        >
          <h3 className="line-clamp-3 text-base font-extrabold leading-snug text-white sm:text-lg">
            {title}
          </h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-medium text-white/90">
            {label ? <span>{label}</span> : null}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 opacity-80" aria-hidden />
              {when}
            </span>
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex min-h-0 items-center gap-3 border-b border-gray-100 py-2.5 last:border-0"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-gray-100 sm:h-16 sm:w-16">
        {image ? (
          <PortalImage
            src={image}
            alt={title}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white"
            style={{ backgroundColor: PORTAL.brand }}
            aria-hidden
          >
            {region?.short || "AU"}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        {label ? (
          <span className="text-[10px] font-bold uppercase" style={{ color: PORTAL.accent }}>
            {label}
          </span>
        ) : null}
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 group-hover:underline">
          {title}
        </h3>
        <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
          <Clock className="h-3 w-3" aria-hidden />
          {when}
        </span>
      </div>
    </Link>
  );
}

function sortPreferCover(articles: AuNewsArticle[]) {
  return [...articles].sort((a, b) => {
    const aOk = realCoverUrl(a.coverImage) ? 1 : 0;
    const bOk = realCoverUrl(b.coverImage) ? 1 : 0;
    return bOk - aOk;
  });
}

export function AustraliaNewsSection({
  stateArticles,
  territoryArticles,
  lang,
}: AustraliaNewsSectionProps) {
  const isEnglish = lang === "en";
  const langQ = isEnglish ? "?lang=en" : "";

  const states = AU_REGIONS.filter((r) => r.kind === "state");
  const territories = AU_REGIONS.filter((r) => r.kind === "territory");

  const stateList = sortPreferCover(stateArticles).slice(0, 8);
  const territoryList = sortPreferCover(territoryArticles).slice(0, 2);
  const bigs = stateList.slice(0, 2);
  const smalls = stateList.slice(2, 8);

  if (stateArticles.length === 0 && territoryArticles.length === 0) return null;

  return (
    <section className="space-y-4">
      <SectionHeader
        title={isEnglish ? "Australia News" : "अष्ट्रेलिया समाचार"}
        href={`/australia${langQ}`}
        linkLabel={isEnglish ? "More news" : "थप समाचार"}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-0">
        <div className="lg:col-span-8 lg:pr-5">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {states.map((region) => (
              <Link
                key={region.code}
                href={`/australia/${region.slug}${langQ}`}
                className="shrink-0 bg-gray-100 px-2.5 py-1.5 text-[11px] font-bold text-gray-700 whitespace-nowrap transition-colors hover:bg-gray-200 sm:text-xs"
              >
                {isEnglish ? region.short : resolveAuRegionName(region, "ne")}
              </Link>
            ))}
          </div>

          {stateList.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.45fr_1fr] sm:items-start sm:gap-4">
              <div className="flex flex-col gap-3">
                {bigs.map((art) => (
                  <AuCard key={art.id} article={art} lang={lang} size="large" />
                ))}
              </div>
              {smalls.length > 0 ? (
                <aside className="flex flex-col">
                  {smalls.map((art) => (
                    <AuCard key={art.id} article={art} lang={lang} size="small" />
                  ))}
                </aside>
              ) : null}
            </div>
          ) : (
            <p className="py-4 text-sm text-gray-500">
              {isEnglish ? "No state stories yet." : "राज्य समाचार उपलब्ध छैन।"}
            </p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-5 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {territories.map((region) => (
              <Link
                key={region.code}
                href={`/australia/${region.slug}${langQ}`}
                className="shrink-0 bg-gray-100 px-2.5 py-1.5 text-[11px] font-bold text-gray-700 whitespace-nowrap transition-colors hover:bg-gray-200 sm:text-xs"
              >
                {isEnglish ? region.short : resolveAuRegionName(region, "ne")}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {territoryList.length > 0 ? (
              territoryList.map((art) => (
                <AuCard key={art.id} article={art} lang={lang} size="large" />
              ))
            ) : (
              <p className="py-4 text-sm text-gray-500">
                {isEnglish ? "No territory stories yet." : "टेरिटोरी समाचार उपलब्ध छैन।"}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
