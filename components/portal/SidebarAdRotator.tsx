"use client";

import { useEffect, useMemo, useState } from "react";
import { AdUnit, type AdUnitData } from "@/components/portal/AdUnit";
import { optimizeAdImageUrl, type AdImageSlot } from "@/lib/cloudinary-url";

export type RotatingAd = AdUnitData & {
  slot?: string;
  isActive?: boolean;
  sortOrder?: number;
};

type SidebarAdRotatorProps = {
  ads: RotatingAd[];
  isEnglish?: boolean;
  label?: string;
  path?: string;
  intervalMs?: number;
  fadeMs?: number;
  /** When false, render nothing if there are no ads (no empty placeholder). */
  showPlaceholder?: boolean;
  className?: string;
  imageClassName?: string;
  /** Cloudinary quality preset for image ads */
  imageSlot?: AdImageSlot;
};

function uniqueAds(ads: RotatingAd[], imageSlot: AdImageSlot): RotatingAd[] {
  const seen = new Set<string>();
  return ads
    .filter((a) => a.isActive !== false && (a.imageUrl || a.scriptCode))
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .filter((a) => {
      if (seen.has(a.id)) return false;
      seen.add(a.id);
      return true;
    })
    .map((a) => ({
      ...a,
      imageUrl: a.imageUrl ? optimizeAdImageUrl(a.imageUrl, imageSlot) : a.imageUrl,
    }));
}

/** Soft crossfade rotator — animation only when 2+ ads; single ad is static. */
export function SidebarAdRotator({
  ads,
  isEnglish = false,
  label = "1",
  path = "/",
  intervalMs = 3500,
  fadeMs = 700,
  showPlaceholder = true,
  className = "overflow-hidden bg-gray-50",
  imageClassName = "h-auto w-full object-contain",
  imageSlot = "sidebar",
}: SidebarAdRotatorProps) {
  const items = useMemo(() => uniqueAds(ads, imageSlot), [ads, imageSlot]);
  const canRotate = items.length > 1;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const itemKey = items.map((a) => a.id).join(",");

  useEffect(() => {
    setActive(0);
  }, [itemKey]);

  useEffect(() => {
    if (!canRotate || paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [canRotate, items.length, paused, intervalMs]);

  if (items.length === 0) {
    if (!showPlaceholder) return null;
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center bg-gray-50 px-4 py-8 text-center">
        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
          {isEnglish ? "Advertisement" : "विज्ञापन"} · {label}
        </span>
        <p className="mt-2 text-xs text-gray-400">
          {isEnglish ? "Sidebar ad slot" : "साइडबार विज्ञापन स्लट"}
        </p>
      </div>
    );
  }

  // One ad — static banner, no fade / slide / interval.
  if (!canRotate) {
    return (
      <AdUnit
        ad={items[0]}
        path={path}
        className={className}
        imageClassName={imageClassName}
      />
    );
  }

  return (
    <div
      className="grid w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {items.map((ad, i) => {
        const isOn = i === active;
        return (
          <div
            key={ad.id}
            className="col-start-1 row-start-1"
            style={{
              opacity: isOn ? 1 : 0,
              // Slide only when rotating between 2+ ads
              transform: isOn ? "translate3d(0,0,0)" : "translate3d(8px,0,0)",
              transition: canRotate
                ? `opacity ${fadeMs}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${fadeMs}ms cubic-bezier(0.22, 1, 0.36, 1)`
                : undefined,
              pointerEvents: isOn ? "auto" : "none",
              zIndex: isOn ? 2 : 1,
            }}
            aria-hidden={!isOn}
          >
            <AdUnit
              ad={ad}
              path={path}
              className={className}
              imageClassName={imageClassName}
            />
          </div>
        );
      })}
    </div>
  );
}
