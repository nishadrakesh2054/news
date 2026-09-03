import { Suspense } from "react";
import { PublicHeader } from "@/components/portal/PublicHeader";
import { RatesBreakingBar } from "@/components/portal/RatesBreakingBar";
import { CategoryNavbar } from "@/components/portal/CategoryNavbar";
import { PublicFooter } from "@/components/portal/PublicFooter";
import { TrackingScripts } from "@/components/portal/TrackingScripts";
import { SkipToContent } from "@/components/a11y/SkipToContent";
import { PORTAL } from "@/constants/portal";

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-gray-900">
      <SkipToContent />
      <TrackingScripts />
      <Suspense fallback={<div className="h-28" style={{ backgroundColor: PORTAL.brand }} />}>
        <PublicHeader />
      </Suspense>
      <Suspense fallback={null}>
        <RatesBreakingBar />
      </Suspense>
      <Suspense fallback={<div className="h-10" style={{ backgroundColor: PORTAL.brand }} />}>
        <CategoryNavbar />
      </Suspense>
      <div id="main-content" className="flex-1">
        {children}
      </div>
      <Suspense fallback={<div className="h-40 bg-slate-950" />}>
        <PublicFooter />
      </Suspense>
    </div>
  );
}
