"use client";

import { useEffect, useMemo, useRef } from "react";
import { sanitizeAdScriptCode } from "@/lib/sanitize-html";

export type AdUnitData = {
  id: string;
  title: string;
  imageUrl?: string | null;
  targetUrl?: string | null;
  scriptCode?: string | null;
};

type AdUnitProps = {
  ad: AdUnitData;
  className?: string;
  imageClassName?: string;
  /** @deprecated badge overlay removed */
  label?: string;
  path?: string;
};

export function AdUnit({
  ad,
  className = "",
  imageClassName = "w-full h-full object-cover rounded-none",
  path,
}: AdUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const impressionSent = useRef(false);

  useEffect(() => {
    if (!ad.id || impressionSent.current) return;

    const storageKey = `ad-imp:${ad.id}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(storageKey)) {
      impressionSent.current = true;
      return;
    }

    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5);
        if (!visible || impressionSent.current) return;

        impressionSent.current = true;
        fetch(`/api/ads/${ad.id}/impression`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: path ?? window.location.pathname }),
          keepalive: true,
        })
          .then(() => {
            try {
              sessionStorage.setItem(storageKey, "1");
            } catch {
              // ignore
            }
          })
          .catch(() => {
            impressionSent.current = false;
          });
      },
      { threshold: 0.5 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ad.id, path]);

  const clickHref = `/api/ads/${ad.id}/click${path ? `?path=${encodeURIComponent(path)}` : ""}`;
  const safeScript = useMemo(
    () => (ad.scriptCode?.trim() ? sanitizeAdScriptCode(ad.scriptCode) : ""),
    [ad.scriptCode]
  );

  if (safeScript) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <div
          className="w-full"
          dangerouslySetInnerHTML={{ __html: safeScript }}
        />
      </div>
    );
  }

  if (!ad.imageUrl) {
    return null;
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <a href={clickHref} target="_blank" rel="noreferrer" className="block h-full w-full group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ad.imageUrl} alt={ad.title} className={imageClassName} />
      </a>
    </div>
  );
}
