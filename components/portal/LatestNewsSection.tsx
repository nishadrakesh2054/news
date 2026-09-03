"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LanguageEditionType } from "@/lib/language";
import { AdUnit, type AdUnitData } from "@/components/portal/AdUnit";
import { NewsCard, type PortalArticleCard } from "@/components/portal/NewsCard";
import { SectionHeader } from "@/components/portal/SectionHeader";
import { PORTAL } from "@/constants/portal";

type SidebarAd = AdUnitData & {
  slot?: string;
  isActive?: boolean;
};

type LatestNewsSectionProps = {
  articles: PortalArticleCard[];
  lang: LanguageEditionType;
};

function AdSlotBox({
  ad,
  isEnglish,
  label,
}: {
  ad: SidebarAd | null;
  isEnglish: boolean;
  label: string;
}) {
  if (ad) {
    return (
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
          {isEnglish ? "Advertisement" : "विज्ञापन"} · {label}
        </p>
        <AdUnit
          ad={ad}
          path="/"
          label={isEnglish ? "Ad" : "विज्ञापन"}
          className="overflow-hidden border border-gray-200 bg-gray-50"
          imageClassName="h-auto w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
        {isEnglish ? "Advertisement" : "विज्ञापन"} · {label}
      </span>
      <p className="mt-2 text-xs text-gray-400">
        {isEnglish ? "Sidebar ad slot" : "साइडबार विज्ञापन स्लट"}
      </p>
    </div>
  );
}

export function LatestNewsSection({ articles, lang }: LatestNewsSectionProps) {
  const isEnglish = lang === "en";
  const langQ = isEnglish ? "?lang=en" : "";
  const [adTop, setAdTop] = useState<SidebarAd | null>(null);
  const [adBottom, setAdBottom] = useState<SidebarAd | null>(null);

  useEffect(() => {
    fetch("/api/ads")
      .then((res) => res.json())
      .then((json) => {
        if (!json.success || !Array.isArray(json.data)) return;
        const active = (json.data as SidebarAd[]).filter((a) => a.isActive !== false);
        const top = active.find((a) => a.slot === "SIDEBAR_TOP") || null;
        const bottom = active.find((a) => a.slot === "SIDEBAR_BOTTOM") || null;
        setAdTop(top);
        setAdBottom(bottom);
      })
      .catch(() => {});
  }, []);

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
            <AdSlotBox ad={adTop} isEnglish={isEnglish} label="1" />
            <AdSlotBox ad={adBottom} isEnglish={isEnglish} label="2" />
          </div>
        </aside>
      </div>
    </section>
  );
}
