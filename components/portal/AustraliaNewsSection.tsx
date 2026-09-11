"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import type { LanguageEditionType } from "@/lib/language";
import { resolveArticleTitle, resolveCategoryName } from "@/lib/language";
import { formatTimeAgo } from "@/lib/nepaliDate";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";
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
  const image =
    optimizeCloudinaryUrl(article.coverImage, size === "large" ? "hero" : "thumbnail") ||
    article.coverImage;
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
        className="group relative block min-h-[200px] flex-1 overflow-hidden bg-neutral-800 sm:min-h-[240px]"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            className="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : null}
        <div
          className="absolute inset-x-0 bottom-0 z-10 px-3 pb-3 pt-14 sm:px-4 sm:pb-4 sm:pt-20"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)",
          }}
        >
          <h3
            className="line-clamp-3 text-base font-extrabold leading-snug text-white sm:text-lg"
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.65)" }}
          >
            {title}
          </h3>
          <p
            className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-medium text-white/90"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.55)" }}
          >
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
      className="group flex min-h-0 flex-1 items-center gap-3 border-b border-gray-100 py-2 last:border-0"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-gray-200 sm:h-16 sm:w-16">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title} className="h-full w-full object-cover" />
        ) : null}
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

export function AustraliaNewsSection({
  stateArticles,
  territoryArticles,
  lang,
}: AustraliaNewsSectionProps) {
  const isEnglish = lang === "en";
  const langQ = isEnglish ? "?lang=en" : "";

  const states = AU_REGIONS.filter((r) => r.kind === "state");
  const territories = AU_REGIONS.filter((r) => r.kind === "territory");

  // 2 large + 6 small = equal paired columns
  const stateList = stateArticles.slice(0, 8);
  const territoryList = territoryArticles.slice(0, 2);
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

          {/* Equal-height: 2 bigs left stretch with 6 smalls right */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.45fr_1fr] sm:items-stretch sm:gap-4">
            <div className="flex min-h-[480px] flex-col gap-3 sm:min-h-[520px]">
              {bigs.map((art) => (
                <AuCard key={art.id} article={art} lang={lang} size="large" />
              ))}
            </div>
            <aside className="flex min-h-[480px] flex-col sm:min-h-[520px]">
              {smalls.map((art) => (
                <AuCard key={art.id} article={art} lang={lang} size="small" />
              ))}
            </aside>
          </div>
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

          <div className="flex min-h-[480px] flex-col gap-3 sm:min-h-[520px]">
            {territoryList.map((art) => (
              <AuCard key={art.id} article={art} lang={lang} size="large" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
