"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Coins, ChevronRight, Award, ShieldCheck } from "lucide-react";
import { getFormattedNepaliDate } from "@/lib/nepaliDate";

export default function GoldRatePage() {
  const [goldFine, setGoldFine] = useState("१,६०,५००");
  const [goldTejabi, setGoldTejabi] = useState("१,५९,८००");
  const [silver, setSilver] = useState("१,९५०");
  const [nepaliDateStr] = useState(() => getFormattedNepaliDate());

  useEffect(() => {
    fetch("/api/utilities")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.gold) {
          if (json.data.gold.fine) setGoldFine(json.data.gold.fine);
          if (json.data.gold.tejabi) setGoldTejabi(json.data.gold.tejabi);
          if (json.data.gold.silver) setSilver(json.data.gold.silver);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main className="w-full bg-background pb-16 select-none">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <nav className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground border-b border-border/40 pb-3">
          <Link href="/" className="hover:text-[#027081]">गृह</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#027081] font-bold">सुन चाँदीको बजार भाउ (Gold & Silver Rates)</span>
        </nav>

        <header className="space-y-2 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
              <Coins className="h-6 w-6" />
              <h1 className="text-2xl sm:text-4xl font-extrabold font-serif">
                नेपाल सुनचाँदी व्यवसायी महासङ्घ - आजको दररेट
              </h1>
            </div>
            <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
              <span>महासङ्घ दररेट</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            आज मिति {nepaliDateStr} का लागि निर्धारित छापावाल सुन (२४ क्यारेट), तेजाबी सुन (२२ क्यारेट) र चाँदीको प्रति तोलाविनि दररेट।
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Fine Gold 24K */}
          <div className="bg-card rounded-2xl border border-amber-500/40 p-6 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
              <Award className="h-5 w-5" />
              <h3 className="text-base font-extrabold font-serif">छापावाल सुन (24K Fine Gold)</h3>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-serif">
              रु. {goldFine} <span className="text-xs text-muted-foreground font-normal font-sans">/ प्रति तोला</span>
            </p>
            <div className="text-[11px] text-muted-foreground font-mono space-y-1 border-t border-border/40 pt-2">
              <span className="block">प्रति १० ग्राम: रु. १,३७,६००</span>
              <span className="block text-emerald-600 dark:text-emerald-400 font-bold">२४ क्यारेट शुद्धता</span>
            </div>
          </div>

          {/* Tejabi Gold 22K */}
          <div className="bg-card rounded-2xl border border-amber-500/20 p-6 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
              <Award className="h-5 w-5" />
              <h3 className="text-base font-extrabold font-serif">तेजाबी सुन (22K Tejabi Gold)</h3>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-serif">
              रु. {goldTejabi} <span className="text-xs text-muted-foreground font-normal font-sans">/ प्रति तोला</span>
            </p>
            <div className="text-[11px] text-muted-foreground font-mono space-y-1 border-t border-border/40 pt-2">
              <span className="block">प्रति १० ग्राम: रु. १,३७,०००</span>
              <span className="block text-amber-600 font-bold">२२ क्यारेट गुणस्तर</span>
            </div>
          </div>

          {/* Silver */}
          <div className="bg-card rounded-2xl border border-slate-400/30 p-6 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 text-slate-500">
              <Coins className="h-5 w-5" />
              <h3 className="text-base font-extrabold font-serif">चाँदी (Pure Silver)</h3>
            </div>
            <p className="text-3xl font-extrabold text-foreground font-serif">
              रु. {silver} <span className="text-xs text-muted-foreground font-normal font-sans">/ प्रति तोला</span>
            </p>
            <div className="text-[11px] text-muted-foreground font-mono space-y-1 border-t border-border/40 pt-2">
              <span className="block">प्रति १० ग्राम: रु. १,६७०</span>
              <span className="block text-slate-400 font-bold">चाँदी (Silver)</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
