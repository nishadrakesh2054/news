import { Suspense } from "react";
import { PublicHeader } from "@/components/portal/PublicHeader";
import { BreakingTicker } from "@/components/portal/BreakingTicker";
import { CategoryNavbar } from "@/components/portal/CategoryNavbar";
import { PublicFooter } from "@/components/portal/PublicFooter";

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Suspense fallback={<div className="h-16 bg-[#027081]" />}>
        <PublicHeader />
      </Suspense>
      <BreakingTicker />
      <Suspense fallback={<div className="h-10 bg-background border-b-2 border-[#027081]" />}>
        <CategoryNavbar />
      </Suspense>
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  );
}
