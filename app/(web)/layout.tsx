import { Suspense } from "react";
import { PublicHeader } from "@/components/portal/PublicHeader";
import { BreakingTicker } from "@/components/portal/BreakingTicker";
import { CategoryNavbar } from "@/components/portal/CategoryNavbar";
import { PublicFooter } from "@/components/portal/PublicFooter";
import { StickyFooterAd } from "@/components/portal/StickyFooterAd";
import { TrackingScripts } from "@/components/portal/TrackingScripts";
import { SkipToContent } from "@/components/a11y/SkipToContent";

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <SkipToContent />
      <TrackingScripts />
      <Suspense fallback={<div className="h-16 bg-[#027081]" />}>
        <PublicHeader />
      </Suspense>
      <Suspense fallback={<div className="h-11 bg-rose-600" />}>
        <BreakingTicker />
      </Suspense>
      <Suspense fallback={<div className="h-10 bg-background border-b-2 border-[#027081]" />}>
        <CategoryNavbar />
      </Suspense>
      <div id="main-content" className="flex-1">
        {children}
      </div>
      <PublicFooter />
      <StickyFooterAd />
    </div>
  );
}
