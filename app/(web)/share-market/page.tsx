"use client";

import Link from "next/link";
import { TrendingUp, ChevronRight, ArrowUpRight } from "lucide-react";
import { getFormattedNepaliDate } from "@/lib/nepaliDate";

export default function ShareMarketPage() {
  const nepaliDateStr = getFormattedNepaliDate();

  return (
    <main className="w-full bg-background pb-16 select-none">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <nav className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground border-b border-border/40 pb-3">
          <Link href="/" className="hover:text-[#027081]">गृह</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#027081] font-bold">नेप्से सेयर बजार (NEPSE Share Market)</span>
        </nav>

        <header className="space-y-2 border-b border-border pb-4">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-6 w-6" />
            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif">
              नेपाल स्टक एक्सचेन्ज (NEPSE Index)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            आज मिति {nepaliDateStr} को नेपाल सेयर बजार परिसूचक, कुल कारोबार रकम तथा टप गेनर्स / लूजर्स विवरण।
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono">
              नेप्से परिसूचक (NEPSE Index)
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold font-serif text-foreground">
                २,७४५.८५
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight className="h-4 w-4" />
                <span>+१४.२५ (०.५२%)</span>
              </span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase font-mono">
              कुल कारोबार रकम (Turnover)
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold font-serif text-foreground">
              रु. ७.४५ अर्ब
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase font-mono">
              कुल कारोबार कित्ता (Volume)
            </span>
            <p className="text-2xl sm:text-3xl font-extrabold font-serif text-foreground">
              १,८४,५०,२००
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
