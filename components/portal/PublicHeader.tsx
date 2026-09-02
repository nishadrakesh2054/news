"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Globe, Search, Calendar, Radio } from "lucide-react";
import { FacebookIcon, TwitterIcon, YoutubeIcon } from "./SocialIcons";
import { getFormattedNepaliDate } from "@/lib/nepaliDate";
import { useRouter, useSearchParams } from "next/navigation";
import { NepaliUtilityBar } from "./NepaliUtilityBar";

interface AdItem {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string | null;
  slot?: string;
  isActive?: boolean;
}

export function PublicHeader() {
  const [nepaliDateStr] = useState(() => getFormattedNepaliDate());
  const [englishDateStr] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [leaderboardAd, setLeaderboardAd] = useState<AdItem | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const langParam = searchParams.get("lang");
  const isEnHost = typeof window !== "undefined" && (window.location.hostname.startsWith("english.") || window.location.hostname.startsWith("en."));
  const isEnglish = langParam === "en" || isEnHost;

  useEffect(() => {
    // Fetch Leaderboard Ad
    fetch("/api/ads")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const ad = json.data.find((a: AdItem) => a.slot === "HEADER_LEADERBOARD" && a.isActive);
          if (ad) setLeaderboardAd(ad);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}${isEnglish ? "&lang=en" : ""}`);
    }
  };

  const toggleLanguage = () => {
    if (isEnglish) {
      router.push("/?lang=ne");
    } else {
      router.push("/?lang=en");
    }
  };

  return (
    <header className="w-full bg-background border-b border-border/40 select-none">
      {/* Topmost Utility Bar */}
      <div className="bg-[#027081] text-white py-1.5 px-4 text-xs font-medium">
        <div className="max-w-[1480px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1.5 font-semibold text-white/95">
              <Calendar className="h-3.5 w-3.5 text-white/80" />
              <span>{isEnglish ? englishDateStr : (nepaliDateStr || "नेपाली मिति...")}</span>
            </span>
            <span className="hidden md:inline text-white/40">•</span>
            <span className="hidden md:inline-flex items-center gap-1 text-emerald-300 font-semibold">
              <Radio className="h-3 w-3 animate-pulse" />
              <span>{isEnglish ? "Live News 24/7" : "अनलाइन लाइभ २५/७"}</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Edition Switcher Button */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center space-x-1.5 bg-amber-400 text-slate-950 px-2.5 py-1 rounded-none text-[11px] font-extrabold hover:bg-amber-300 transition-colors cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>{isEnglish ? "नेपाली संस्करण 🇳🇵" : "English Edition 🌐"}</span>
            </button>

            <div className="flex items-center space-x-2.5">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white/80 hover:text-white transition-colors" title="Facebook">
                <FacebookIcon className="h-3.5 w-3.5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-white/80 hover:text-white transition-colors" title="Twitter">
                <TwitterIcon className="h-3.5 w-3.5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-white/80 hover:text-white transition-colors" title="YouTube">
                <YoutubeIcon className="h-3.5 w-3.5" />
              </a>
            </div>
            <span className="text-white/40">|</span>
            <Link href="/admin" className="text-white/90 hover:underline text-[11px] font-semibold">
              {isEnglish ? "CMS Login" : "एडमिन लगइन"}
            </Link>
          </div>
        </div>
      </div>

      {/* Nepali Utility Bar (Gold/Silver, Forex & Rashifal) */}
      <NepaliUtilityBar />

      {/* Main Brand Logo & Leaderboard Ad Container */}
      <div className="max-w-[1480px] mx-auto px-4 py-4 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Brand Logo Image */}
        <Link href={isEnglish ? "/?lang=en" : "/"} className="flex items-center group shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/newslogo.png"
            alt="नेपाल खबर (Nepal News)"
            className="h-14 sm:h-16 md:h-20 w-auto object-contain rounded-none group-hover:opacity-95 transition-opacity py-1"
          />
        </Link>

        {/* Top Header Leaderboard Ad Banner (728x90 standard) */}
        {leaderboardAd ? (
          <a
            href={leaderboardAd.targetUrl || "#"}
            target="_blank"
            rel="noreferrer"
            className="w-full max-w-182 h-22.5 border border-border overflow-hidden block relative group rounded-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={leaderboardAd.imageUrl}
              alt={leaderboardAd.title}
              className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-200 rounded-none"
            />
            <span className="absolute top-1 right-1 bg-black text-white text-[9px] px-1.5 py-0.5 font-mono uppercase rounded-none">
              विज्ञापन
            </span>
          </a>
        ) : (
          <div className="hidden lg:flex w-182 h-22.5 border border-dashed border-border/80 bg-muted/20 items-center justify-center text-xs text-muted-foreground font-medium rounded-none">
            विज्ञापन स्थान (Header Leaderboard Ad - 728x90)
          </div>
        )}
      </div>

      {/* Search Input Bar for Mobile / Tablet */}
      <div className="max-w-[1480px] mx-auto px-4 pb-3 lg:hidden">
        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="समाचार खोज्नुहोस्..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-none border border-slate-300 dark:border-slate-700 bg-background pl-9 pr-4 py-2 text-xs outline-none focus:border-[#027081] transition-colors"
          />
        </form>
      </div>
    </header>
  );
}
