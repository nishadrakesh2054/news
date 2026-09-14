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

function parseAdMarkup(html: string): {
  scriptSrcs: { src: string; async?: boolean; defer?: boolean }[];
  hasAdsbygoogle: boolean;
  insHtml: string;
} {
  const scriptSrcs: { src: string; async?: boolean; defer?: boolean }[] = [];
  const scriptRe = /<script\b([^>]*)><\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRe.exec(html)) !== null) {
    const attrs = match[1] || "";
    const srcMatch = /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
    const src = srcMatch?.[1] ?? srcMatch?.[2] ?? srcMatch?.[3] ?? "";
    if (!src) continue;
    scriptSrcs.push({
      src,
      async: /\basync\b/i.test(attrs),
      defer: /\bdefer\b/i.test(attrs),
    });
  }

  const insParts: string[] = [];
  const insRe = /<ins\b[^>]*>/gi;
  while ((match = insRe.exec(html)) !== null) {
    insParts.push(`${match[0]}</ins>`);
  }

  return {
    scriptSrcs,
    hasAdsbygoogle: /adsbygoogle/i.test(html),
    insHtml: insParts.join(""),
  };
}

function loadExternalScript(src: string, async = true): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.async = async;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(el);
  });
}

export function AdUnit({
  ad,
  className = "",
  imageClassName = "w-full h-auto object-contain",
  path,
}: AdUnitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const impressionSent = useRef(false);
  const scriptsLoaded = useRef(false);

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
        const visible = entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5
        );
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

  const safeScript = useMemo(
    () => (ad.scriptCode?.trim() ? sanitizeAdScriptCode(ad.scriptCode) : ""),
    [ad.scriptCode]
  );

  const parsed = useMemo(
    () => (safeScript ? parseAdMarkup(safeScript) : null),
    [safeScript]
  );

  useEffect(() => {
    if (!parsed || !slotRef.current || scriptsLoaded.current) return;
    let cancelled = false;

    async function mount() {
      if (!parsed || !slotRef.current) return;
      scriptsLoaded.current = true;

      if (parsed.insHtml) {
        slotRef.current.innerHTML = parsed.insHtml;
      }

      for (const s of parsed.scriptSrcs) {
        try {
          await loadExternalScript(s.src, s.async !== false);
        } catch {
          // continue — impression still tracked
        }
      }

      if (cancelled) return;

      if (parsed.hasAdsbygoogle) {
        try {
          const w = window as unknown as {
            adsbygoogle?: Record<string, unknown>[];
          };
          w.adsbygoogle = w.adsbygoogle || [];
          w.adsbygoogle.push({});
        } catch {
          // Ad blocker / network
        }
      }
    }

    void mount();
    return () => {
      cancelled = true;
    };
  }, [parsed]);

  const clickHref = `/api/ads/${ad.id}/click${path ? `?path=${encodeURIComponent(path)}` : ""}`;

  if (safeScript && parsed) {
    return (
      <div ref={containerRef} className={`relative min-h-[90px] ${className}`}>
        <div ref={slotRef} className="w-full" />
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
        <img src={ad.imageUrl} alt={ad.title} className={imageClassName} loading="lazy" />
      </a>
    </div>
  );
}
