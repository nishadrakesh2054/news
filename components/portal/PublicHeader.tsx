"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Globe, Calendar } from "lucide-react";
import { FacebookIcon, TwitterIcon, YoutubeIcon } from "./SocialIcons";
import { getFormattedNepaliDate } from "@/lib/nepaliDate";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AdUnit, type AdUnitData } from "@/components/portal/AdUnit";
import { TopbarUtilitiesMenu } from "@/components/portal/TopbarUtilitiesMenu";
import { SITE_CONFIG } from "@/constants/site";
import { editionPathHref } from "@/lib/site-url";
import { isEnglishHostname } from "@/lib/language";
import { PORTAL } from "@/constants/portal";

interface AdItem extends AdUnitData {
  slot?: string;
  isActive?: boolean;
}

export function PublicHeader() {
  const [nepaliDateStr] = useState(() => getFormattedNepaliDate());
  const [englishDateStr] = useState(() =>
    new Date().toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  );
  const [leaderboardAd, setLeaderboardAd] = useState<AdItem | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const langParam = searchParams.get("lang");
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isEnglish = langParam === "en" || isEnglishHostname(hostname);

  useEffect(() => {
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

  const toggleLanguage = () => {
    const target = isEnglish ? "ne" : "en";
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lang");
    const qs = params.toString();
    const path = qs ? `${pathname}?${qs}` : pathname;
    const href = editionPathHref(path, target, hostname);
    if (href.startsWith("http")) {
      window.location.href = href;
      return;
    }
    router.push(href);
  };

  const homeHref = isEnglish ? "/?lang=en" : "/";

  return (
    <header className="w-full select-none bg-white">
      <div className="py-1.5 text-xs font-medium text-white" style={{ backgroundColor: PORTAL.brand }}>
        <div className={`${PORTAL.container} flex flex-col items-center justify-between gap-1.5 sm:flex-row`}>
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <Calendar className="h-3.5 w-3.5" />
            {isEnglish ? englishDateStr : nepaliDateStr || "नेपाली मिति"}
          </span>

          <div className="flex items-center gap-2 sm:gap-3">
            <TopbarUtilitiesMenu isEnglish={isEnglish} />
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 bg-white px-2 py-0.5 text-[11px] font-bold"
              style={{ color: PORTAL.brand }}
            >
              <Globe className="h-3 w-3" />
              {isEnglish ? "नेपाली" : "English"}
            </button>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-white hover:opacity-80" title="Facebook">
              <FacebookIcon className="h-3.5 w-3.5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-white hover:opacity-80" title="X">
              <TwitterIcon className="h-3.5 w-3.5" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-white hover:opacity-80" title="YouTube">
              <YoutubeIcon className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className={`${PORTAL.container} flex items-center justify-between gap-3 py-2.5 sm:gap-4 sm:py-3`}>
        <Link href={homeHref} className="shrink-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/newslogo.png"
            alt={`${SITE_CONFIG.nameNp} (${SITE_CONFIG.name})`}
            className="h-14 w-auto object-contain object-left sm:h-16 md:h-[4.75rem]"
          />
        </Link>

        {leaderboardAd ? (
          <AdUnit
            ad={leaderboardAd}
            path="/"
            className="hidden h-[72px] w-full max-w-[728px] border border-gray-200 lg:block xl:h-[90px]"
          />
        ) : (
          <div
            className="hidden h-[72px] w-full max-w-[728px] items-center justify-center border border-gray-200 text-xs font-medium text-gray-500 xl:h-[90px] lg:flex"
            style={{ backgroundColor: PORTAL.surface }}
          >
            {SITE_CONFIG.name} Ad · 728×90
          </div>
        )}
      </div>
    </header>
  );
}
