"use client";

import { useEffect, useRef } from "react";

/** Tiny client beacon — does not delay ad image paint. */
export function AdImpressionBeacon({ adId, path }: { adId: string; path?: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (!adId || sent.current) return;

    const storageKey = `ad-imp:${adId}`;
    try {
      if (sessionStorage.getItem(storageKey)) {
        sent.current = true;
        return;
      }
    } catch {
      // ignore
    }

    sent.current = true;
    fetch(`/api/ads/${adId}/impression`, {
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
        sent.current = false;
      });
  }, [adId, path]);

  return null;
}
