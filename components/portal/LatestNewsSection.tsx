"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LanguageEditionType } from "@/lib/language";
import type { AdUnitData } from "@/components/portal/AdUnit";
import { NewsCard, type PortalArticleCard } from "@/components/portal/NewsCard";
import { SectionHeader } from "@/components/portal/SectionHeader";
import { SidebarAdRotator, type RotatingAd } from "@/components/portal/SidebarAdRotator";
import { PORTAL } from "@/constants/portal";

type SidebarAd = AdUnitData & {
  slot?: string;
  isActive?: boolean;
  sortOrder?: number;
};

type LatestNewsSectionProps = {
  articles: PortalArticleCard[];
  lang: LanguageEditionType;
  /** @deprecated prefer adsTop */
  adTop?: SidebarAd | null;
  /** @deprecated prefer adsBottom */
  adBottom?: SidebarAd | null;
  adsTop?: RotatingAd[];
  adsBottom?: RotatingAd[];
};

export function LatestNewsSection({
  articles,
  lang,
  adTop = null,
  adBottom = null,
  adsTop,
  adsBottom,
}: LatestNewsSectionProps) {
  const isEnglish = lang === "en";
  const langQ = isEnglish ? "?lang=en" : "";

  const topAds =
    adsTop && adsTop.length > 0 ? adsTop : adTop ? [adTop] : [];
  const bottomAds =
    adsBottom && adsBottom.length > 0 ? adsBottom : adBottom ? [adBottom] : [];

  if (articles.length === 0) return null;

  return (
    <section>
      <SectionHeader
        title={isEnglish ? "Latest News" : "ताजा समाचार"}
        href={`/search${langQ}`}
        linkLabel={isEnglish ? "More news" : "थप समाचार"}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
        <div className="min-w-0 lg:col-span-9">
          <div>
            {articles.map((art) => (
              <NewsCard key={art.id} article={art} lang={lang} variant="list" showAuthor />
            ))}
          </div>
          <div className="mt-4 border-t border-gray-100 pt-4 lg:hidden">
            <Link
              href={`/search${langQ}`}
              className="inline-flex items-center gap-0.5 text-xs font-bold hover:underline"
              style={{ color: PORTAL.brand }}
            >
              {isEnglish ? "More news" : "थप समाचार"}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <aside className="lg:col-span-3">
          <div className="flex flex-col gap-4 lg:sticky lg:top-20">
            <SidebarAdRotator
              ads={topAds}
              isEnglish={isEnglish}
              label="1"
              path="/"
              showPlaceholder={false}
            />
            <SidebarAdRotator
              ads={bottomAds}
              isEnglish={isEnglish}
              label="2"
              path="/"
              showPlaceholder={false}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}
