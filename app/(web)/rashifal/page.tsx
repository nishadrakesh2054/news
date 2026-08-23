"use client";

import { useEffect, useState } from "react";
import {
  Sparkles,
  Calendar,
  Heart,
  Briefcase,
  Activity,
  Sun,
  Compass,
  Clock,
} from "lucide-react";
import { getFormattedNepaliDate } from "@/lib/nepaliDate";
import { DEFAULT_DETAILED_RASHIFAL, DetailedRashi } from "@/lib/rashifal";

export default function RashifalHubPage() {
  const [nepaliDateStr] = useState(() => getFormattedNepaliDate());
  const [rashifalList, setRashifalList] = useState<DetailedRashi[]>(DEFAULT_DETAILED_RASHIFAL);
  const [activeTimeframe, setActiveTimeframe] = useState<"daily" | "weekly" | "yearly">("daily");
  const [activeAspect, setActiveAspect] = useState<"all" | "overview" | "health" | "business" | "love" | "remedy">("all");
  const [selectedRashi, setSelectedRashi] = useState<string | null>(null);

  useEffect(() => {
    // Fetch dynamic rashifal predictions from API
    fetch("/api/utilities")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.rashifal && Array.isArray(json.data.rashifal)) {
          setRashifalList(json.data.rashifal);
        }
      })
      .catch(() => {});
  }, []);

  const scrollToRashi = (rashiName: string) => {
    setSelectedRashi(rashiName);
    const element = document.getElementById(`rashi-${rashiName}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <main className="w-full bg-background pb-20 select-none">
      {/* 1. HERO ASTROLOGICAL & PANCHANGA HEADER */}
      <section className="bg-linear-to-b from-[#01414c] via-[#027081] to-[#01515e] text-white py-10 sm:py-14 px-4 shadow-lg border-b border-[#027081]/40">
        <div className="max-w-7xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-2xs">
            <Sparkles className="h-4 w-4 animate-pulse text-amber-300" />
            <span>नेपाली वैदिक ज्योतिष तथा राशिफल हब (Vedic Astrology Portal)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif tracking-tight leading-tight">
            आजको दैनिक, साप्ताहिक र वार्षिक राशिफल
          </h1>

          <p className="text-xs sm:text-sm text-white/90 max-w-3xl mx-auto leading-relaxed">
            नेपालका ख्यातिप्राप्त ज्योतिषाचार्यहरूद्वारा नक्षत्र गणना तथा ग्रहगोचर स्थिति विश्लेषण गरी तयार पारिएको आधिकारिक भाग्यफल।
          </p>

          {/* Daily Panchanga Header Strip */}
          <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 p-4 max-w-4xl mx-auto text-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-amber-200 font-medium">
            <div className="flex items-center justify-center space-x-2 border-r border-white/10 pr-2">
              <Calendar className="h-4 w-4 text-amber-300 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] text-white/70 block">आजको मिति</span>
                <span className="font-bold text-white font-mono">{nepaliDateStr || "नेपाली मिति..."}</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 border-r border-white/10 pr-2">
              <Sun className="h-4 w-4 text-amber-300 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] text-white/70 block">पञ्चाङ्ग / तिथि</span>
                <span className="font-bold text-white">शुक्ल पक्ष पञ्चमी</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 border-r border-white/10 pr-2">
              <Compass className="h-4 w-4 text-amber-300 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] text-white/70 block">नक्षत्र</span>
                <span className="font-bold text-white">स्वाती नक्षत्र</span>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-4 w-4 text-amber-300 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] text-white/70 block">सूर्योदय / सूर्यास्त</span>
                <span className="font-bold text-white font-mono">०५:४२ / १८:३४</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pt-8 space-y-8">
        {/* 2. RASHI QUICK JUMPER BAR (12 Zodiac Buttons) */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-2xs space-y-3">
          <span className="text-xs font-bold text-muted-foreground uppercase font-mono block">
            तपाईंको राशि छनौट गर्नुहोस् (Quick Select Rashi):
          </span>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
            {rashifalList.map((r) => {
              const isSelected = selectedRashi === r.name;
              return (
                <button
                  key={r.name}
                  onClick={() => scrollToRashi(r.name)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#027081] text-white border-[#027081] shadow-md scale-105"
                      : "bg-muted/30 border-border hover:bg-[#027081]/10 hover:border-[#027081]/40 text-foreground"
                  }`}
                >
                  <span className="text-xl">{r.symbol}</span>
                  <span className="text-[11px] font-bold font-serif leading-tight">{r.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. TIMEFRAME & ASPECT SELECTORS */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          {/* Timeframe Tabs */}
          <div className="flex items-center space-x-2 bg-muted/60 p-1.5 rounded-xl border border-border">
            <button
              onClick={() => setActiveTimeframe("daily")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTimeframe === "daily"
                  ? "bg-[#027081] text-white shadow-xs"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              आजको दैनिक राशिफल
            </button>
            <button
              onClick={() => setActiveTimeframe("weekly")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTimeframe === "weekly"
                  ? "bg-[#027081] text-white shadow-xs"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              यस हप्ताको राशिफल
            </button>
            <button
              onClick={() => setActiveTimeframe("yearly")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTimeframe === "yearly"
                  ? "bg-[#027081] text-white shadow-xs"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              वर्ष २०८३ को राशिफल
            </button>
          </div>

          {/* Aspect Filter Badges */}
          <div className="flex items-center space-x-1.5 text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveAspect("all")}
              className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                activeAspect === "all"
                  ? "bg-[#027081]/10 text-[#027081] border-[#027081] font-bold"
                  : "bg-card border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              सबै फल
            </button>
            <button
              onClick={() => setActiveAspect("health")}
              className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                activeAspect === "health"
                  ? "bg-rose-500/10 text-rose-600 border-rose-500 font-bold"
                  : "bg-card border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Activity className="h-3 w-3 text-rose-500" />
              <span>स्वास्थ्य</span>
            </button>
            <button
              onClick={() => setActiveAspect("business")}
              className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                activeAspect === "business"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500 font-bold"
                  : "bg-card border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Briefcase className="h-3 w-3 text-emerald-500" />
              <span>व्यापार र अर्थ</span>
            </button>
            <button
              onClick={() => setActiveAspect("love")}
              className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                activeAspect === "love"
                  ? "bg-pink-500/10 text-pink-600 border-pink-500 font-bold"
                  : "bg-card border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Heart className="h-3 w-3 text-pink-500" />
              <span>प्रेम/सम्बन्ध</span>
            </button>
            <button
              onClick={() => setActiveAspect("remedy")}
              className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                activeAspect === "remedy"
                  ? "bg-amber-500/10 text-amber-600 border-amber-500 font-bold"
                  : "bg-card border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>ज्योतिषीय उपाय</span>
            </button>
          </div>
        </div>

        {/* 4. 12 RASHIS DETAILED CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rashifalList.map((rashi) => {
            const isHighlight = selectedRashi === rashi.name;

            return (
              <div
                id={`rashi-${rashi.name}`}
                key={rashi.name}
                className={`bg-card rounded-2xl border transition-all duration-300 p-6 flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-md ${
                  isHighlight
                    ? "border-[#027081] ring-2 ring-[#027081]/30 bg-[#027081]/5 scale-[1.02]"
                    : "border-border hover:border-[#027081]/50"
                }`}
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-4xl bg-amber-400/20 text-amber-600 dark:text-amber-300 h-12 w-12 rounded-2xl flex items-center justify-center font-serif shadow-2xs border border-amber-400/30">
                        {rashi.symbol}
                      </span>
                      <div>
                        <h3 className="text-xl font-extrabold text-foreground font-serif tracking-tight">
                          {rashi.name} ({rashi.enName || ""})
                        </h3>
                        <span className="text-xs text-muted-foreground font-medium block">
                          स्वामी: {rashi.rashiSwami || "मङ्गल"} • {rashi.element || "तत्व"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lucky Badges Grid */}
                  <div className="grid grid-cols-4 gap-1.5 bg-muted/40 p-2.5 rounded-xl border border-border/50 text-[11px]">
                    <div className="text-center">
                      <span className="text-muted-foreground block text-[10px]">शुभ अङ्क</span>
                      <span className="font-bold text-foreground">{rashi.luckyNumber || "९"}</span>
                    </div>
                    <div className="text-center border-l border-border/50">
                      <span className="text-muted-foreground block text-[10px]">शुभ रङ्ग</span>
                      <span className="font-bold text-[#027081] truncate block px-1">
                        {rashi.luckyColor || "रातो"}
                      </span>
                    </div>
                    <div className="text-center border-l border-border/50">
                      <span className="text-muted-foreground block text-[10px]">दिशा</span>
                      <span className="font-bold text-foreground truncate block px-1">
                        {rashi.luckyDirection || "पूर्व"}
                      </span>
                    </div>
                    <div className="text-center border-l border-border/50">
                      <span className="text-muted-foreground block text-[10px]">भाग्य</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {rashi.luckyPercent || 85}%
                      </span>
                    </div>
                  </div>

                  {/* Lucky Percentage Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
                      <span>भाग्य प्रतिशत</span>
                      <span>{rashi.luckyPercent || 85}%</span>
                    </div>
                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-linear-to-r from-amber-400 via-amber-500 to-[#027081] h-full rounded-full transition-all duration-500"
                        style={{ width: `${rashi.luckyPercent || 85}%` }}
                      />
                    </div>
                  </div>

                  {/* Predictions Content */}
                  <div className="space-y-3.5 pt-2 text-xs leading-relaxed">
                    {(activeAspect === "all" || activeAspect === "overview") && (
                      <div className="space-y-1">
                        <span className="font-bold text-foreground block font-serif text-sm">
                          समग्र फल (General Prediction):
                        </span>
                        <p className="text-muted-foreground font-sans">{rashi.overview}</p>
                      </div>
                    )}

                    {(activeAspect === "all" || activeAspect === "health") && rashi.health && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1 text-rose-950 dark:text-rose-200">
                        <span className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-serif">
                          <Activity className="h-3.5 w-3.5 text-rose-500" />
                          <span>स्वास्थ्य तथा निरोगिता (Health):</span>
                        </span>
                        <p className="text-xs leading-relaxed">{rashi.health}</p>
                      </div>
                    )}

                    {(activeAspect === "all" || activeAspect === "business") && rashi.business && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 text-emerald-950 dark:text-emerald-200">
                        <span className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-serif">
                          <Briefcase className="h-3.5 w-3.5 text-emerald-500" />
                          <span>व्यापार र आर्थिक स्थिति (Business):</span>
                        </span>
                        <p className="text-xs leading-relaxed">{rashi.business}</p>
                      </div>
                    )}

                    {(activeAspect === "all" || activeAspect === "love") && rashi.love && (
                      <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 space-y-1 text-pink-950 dark:text-pink-200">
                        <span className="font-bold flex items-center gap-1.5 text-pink-700 dark:text-pink-300 font-serif">
                          <Heart className="h-3.5 w-3.5 text-pink-500" />
                          <span>प्रेम तथा दाम्पत्य सम्बन्ध (Love):</span>
                        </span>
                        <p className="text-xs leading-relaxed">{rashi.love}</p>
                      </div>
                    )}

                    {(activeAspect === "all" || activeAspect === "remedy") && rashi.remedy && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1 text-amber-950 dark:text-amber-200 font-medium">
                        <span className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-serif">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                          <span>ज्योतिषीय उपाय र सुझाव (Remedy):</span>
                        </span>
                        <p className="text-xs leading-relaxed">{rashi.remedy}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
