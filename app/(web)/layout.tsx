import { Suspense } from "react";
import { headers } from "next/headers";
import { PublicHeader } from "@/components/portal/PublicHeader";
import { RatesBreakingBar } from "@/components/portal/RatesBreakingBar";
import { CategoryNavbar } from "@/components/portal/CategoryNavbar";
import { PublicFooter } from "@/components/portal/PublicFooter";
import { StickyFooterAd } from "@/components/portal/StickyFooterAd";
import { TrackingScripts } from "@/components/portal/TrackingScripts";
import { SkipToContent } from "@/components/a11y/SkipToContent";
import { PORTAL } from "@/constants/portal";
import {
  getCachedActiveAds,
  getCachedBreaking,
  getCachedCategories,
} from "@/lib/public-cache";
import { resolveCategoryName, resolveLanguageEdition } from "@/lib/language";
import { requestHost, SITE_LANG_HEADER } from "@/lib/seo";

export default async function WebLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const lang = resolveLanguageEdition(
    headerList.get(SITE_LANG_HEADER),
    requestHost(headerList)
  );

  const [categoriesRaw, ads, breaking] = await Promise.all([
    getCachedCategories(),
    getCachedActiveAds(),
    getCachedBreaking(lang),
  ]);

  const categories = categoriesRaw.map((category) => ({
    ...category,
    displayName: resolveCategoryName(category, lang),
  }));

  const leaderboardAds = ads
    .filter((a) => a.slot === "HEADER_LEADERBOARD" && a.isActive !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const stickyFooterAds = ads
    .filter((a) => a.slot === "STICKY_FOOTER" && a.isActive !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-gray-900">
      <SkipToContent />
      <Suspense fallback={null}>
        <TrackingScripts />
      </Suspense>
      <Suspense fallback={<div className="h-28" style={{ backgroundColor: PORTAL.brand }} />}>
        <PublicHeader leaderboardAds={leaderboardAds} categories={categories} />
      </Suspense>
      <Suspense fallback={null}>
        <RatesBreakingBar items={breaking} lang={lang} />
      </Suspense>
      <Suspense fallback={<div className="h-10" style={{ backgroundColor: PORTAL.brand }} />}>
        <CategoryNavbar categories={categories} />
      </Suspense>
      <div id="main-content" className="flex-1">
        {children}
      </div>
      <Suspense fallback={<div className="h-48" style={{ backgroundColor: PORTAL.brand }} />}>
        <PublicFooter categories={categories} />
      </Suspense>
      <StickyFooterAd ads={stickyFooterAds} />
    </div>
  );
}
