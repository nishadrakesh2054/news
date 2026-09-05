"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { AdUnit, type AdUnitData } from "@/components/portal/AdUnit";

export type StickyFooterAdItem = AdUnitData & {
  slot?: string;
  isActive?: boolean;
  sortOrder?: number;
};

type StickyFooterAdProps = {
  ads?: StickyFooterAdItem[];
  intervalMs?: number;
  fadeMs?: number;
};

/** Prefer crisp full-size Cloudinary delivery for 728×90 banners. */
function leaderboardImageUrl(url: string | null | undefined): string | null | undefined {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  return url.replace(
    /\/upload\/(?:[^/]+\/)?/,
    "/upload/c_fit,w_728,h_90,q_auto:good,f_auto,dpr_2.0/"
  );
}

/** Fixed bottom banner — full 728×90; rotates STICKY_FOOTER ads; hidden when none active. */
export function StickyFooterAd({
  ads = [],
  intervalMs = 3500,
  fadeMs = 700,
}: StickyFooterAdProps) {
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const items = ads
    .filter((a) => a.isActive !== false && (a.imageUrl || a.scriptCode))
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((a) => ({
      ...a,
      imageUrl: a.imageUrl ? leaderboardImageUrl(a.imageUrl) : a.imageUrl,
    }));

  useEffect(() => {
    setDismissed(false);
    setActive(0);
  }, [pathname, items.map((a) => a.id).join(",")]);

  useEffect(() => {
    if (items.length <= 1 || paused || dismissed) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [items.length, paused, dismissed, intervalMs]);

  if (dismissed || items.length === 0) return null;

  return (
    <>
      {/* Spacer matches full 728×90 banner + thin bar padding */}
      <div className="h-[98px]" aria-hidden />
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative mx-auto h-[90px] w-full max-w-[728px]">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="absolute right-1 top-1 z-10 inline-flex h-6 w-6 items-center justify-center bg-black/50 text-white hover:bg-black/70"
            aria-label="Close ad"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {items.length === 1 ? (
            <AdUnit
              ad={items[0]}
              path={pathname}
              className="h-full w-full overflow-hidden"
              imageClassName="h-full w-full object-contain object-center"
            />
          ) : (
            <div className="relative h-full w-full overflow-hidden">
              {items.map((ad, i) => {
                const isOn = i === active;
                return (
                  <div
                    key={ad.id}
                    className="absolute inset-0 will-change-[opacity,transform]"
                    style={{
                      opacity: isOn ? 1 : 0,
                      transform: isOn
                        ? "translate3d(0,0,0) scale(1)"
                        : "translate3d(8px,0,0) scale(0.985)",
                      transition: `opacity ${fadeMs}ms cubic-bezier(0.22, 1, 0.36, 1), transform ${fadeMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                      pointerEvents: isOn ? "auto" : "none",
                      zIndex: isOn ? 2 : 1,
                    }}
                    aria-hidden={!isOn}
                  >
                    <AdUnit
                      ad={ad}
                      path={pathname}
                      className="h-full w-full overflow-hidden"
                      imageClassName="h-full w-full object-contain object-center"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
