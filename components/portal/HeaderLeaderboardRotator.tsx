"use client";

import { useEffect, useState } from "react";
import { AdUnit, type AdUnitData } from "@/components/portal/AdUnit";
import { PORTAL } from "@/constants/portal";
import { SITE_CONFIG } from "@/constants/site";
import { optimizeAdImageUrl } from "@/lib/cloudinary-url";

export type LeaderboardAd = AdUnitData & {
  slot?: string;
  isActive?: boolean;
  sortOrder?: number;
};

type HeaderLeaderboardRotatorProps = {
  ads: LeaderboardAd[];
  isEnglish?: boolean;
  /** How long each ad stays fully visible */
  intervalMs?: number;
  /** Crossfade duration */
  fadeMs?: number;
};

/** Soft crossfade rotator for HEADER_LEADERBOARD ads (728×90). */
export function HeaderLeaderboardRotator({
  ads,
  isEnglish = false,
  intervalMs = 3500,
  fadeMs = 700,
}: HeaderLeaderboardRotatorProps) {
  const items = ads
    .filter((a) => a.isActive !== false && (a.imageUrl || a.scriptCode))
    .map((a) => ({
      ...a,
      imageUrl: a.imageUrl ? optimizeAdImageUrl(a.imageUrl, "leaderboard") : a.imageUrl,
    }));

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length <= 1 || paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [items.length, paused, intervalMs]);

  if (items.length === 0) {
    return (
      <div
        className="hidden h-[90px] w-full max-w-[728px] items-center justify-center text-xs font-medium text-gray-500 lg:flex"
        style={{ backgroundColor: PORTAL.surface }}
      >
        {isEnglish ? `${SITE_CONFIG.name} Ad · 728×90` : `विज्ञापन · ७२८×९०`}
      </div>
    );
  }

  // Single ad — no crossfade / slide wrapper.
  if (items.length === 1) {
    return (
      <div className="relative hidden h-[90px] w-full max-w-[728px] shrink overflow-hidden lg:block">
        <AdUnit
          ad={items[0]}
          path="/"
          className="h-full w-full"
          imageClassName="h-full w-full object-contain object-center"
        />
      </div>
    );
  }

  return (
    <div
      className="relative hidden h-[90px] w-full max-w-[728px] shrink overflow-hidden lg:block"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {items.map((ad, i) => {
        const isOn = i === active;
        return (
          <div
            key={ad.id}
            className="absolute inset-0"
            style={{
              opacity: isOn ? 1 : 0,
              transform: isOn ? "translate3d(0,0,0)" : "translate3d(10px,0,0)",
              transition: `opacity ${fadeMs}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${fadeMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
              pointerEvents: isOn ? "auto" : "none",
              zIndex: isOn ? 2 : 1,
            }}
            aria-hidden={!isOn}
          >
            <AdUnit
              ad={ad}
              path="/"
              className="h-full w-full"
              imageClassName="h-full w-full object-contain object-center"
            />
          </div>
        );
      })}
    </div>
  );
}
