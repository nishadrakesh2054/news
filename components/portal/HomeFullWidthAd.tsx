"use client";

import { useEffect, useState } from "react";
import { AdUnit, type AdUnitData } from "@/components/portal/AdUnit";
import { optimizeAdImageUrl } from "@/lib/cloudinary-url";

export type HomeSpotlightAd = AdUnitData & {
  slot?: string;
  isActive?: boolean;
  sortOrder?: number;
};

type HomeFullWidthAdProps = {
  lang?: string;
  ads?: HomeSpotlightAd[];
  intervalMs?: number;
};

/**
 * Full-width banner under homepage spotlight heading (~970×90).
 * Controlled from dashboard via AdSlot.HOME_SPOTLIGHT.
 */
export function HomeFullWidthAd({
  lang = "ne",
  ads = [],
  intervalMs = 4000,
}: HomeFullWidthAdProps) {
  const isEnglish = lang === "en";
  const items = ads
    .filter((a) => a.isActive !== false && (a.imageUrl || a.scriptCode))
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((a) => ({
      ...a,
      imageUrl: a.imageUrl ? optimizeAdImageUrl(a.imageUrl, "leaderboard") : a.imageUrl,
    }));

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [items.length, intervalMs]);

  if (items.length === 0) return null;

  const current = items[Math.min(active, items.length - 1)];

  return (
    <aside className="mt-6 w-full sm:mt-8" aria-label={isEnglish ? "Advertisement" : "विज्ञापन"}>
      {items.length === 1 ? (
        <div className="w-full overflow-hidden" style={{ aspectRatio: "970 / 90" }}>
          <AdUnit
            ad={current}
            path="/"
            className="h-full w-full"
            imageClassName="h-full w-full object-contain object-center"
          />
        </div>
      ) : (
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: "970 / 90" }}>
          {items.map((ad, i) => {
            const isOn = i === active;
            return (
              <div
                key={ad.id}
                className={isOn ? "relative h-full w-full" : "pointer-events-none absolute inset-0"}
                style={{
                  opacity: isOn ? 1 : 0,
                  transition: "opacity 0.45s ease",
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
      )}
    </aside>
  );
}
