"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdUnit, type AdUnitData } from "@/components/portal/AdUnit";

type FooterAd = AdUnitData & { slot?: string; isActive?: boolean };

export function StickyFooterAd() {
  const pathname = usePathname();
  const [ad, setAd] = useState<FooterAd | null>(null);

  useEffect(() => {
    fetch("/api/ads")
      .then((res) => res.json())
      .then((json) => {
        if (!json.success || !Array.isArray(json.data)) return;
        const footerAd = json.data.find(
          (item: FooterAd) => item.slot === "STICKY_FOOTER" && item.isActive !== false
        );
        if (footerAd) setAd(footerAd);
      })
      .catch(() => {});
  }, []);

  if (!ad) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm shadow-lg">
      <div className="max-w-[1480px] mx-auto px-4 py-2">
        <AdUnit
          ad={ad}
          path={pathname}
          className="w-full max-h-20 border border-border rounded-none"
          imageClassName="w-full h-20 object-cover rounded-none"
        />
      </div>
    </div>
  );
}
