"use client";

import { useEffect, useRef } from "react";

type ArticleViewTrackerProps = {
  articleId: string;
  path: string;
};

export function ArticleViewTracker({ articleId, path }: ArticleViewTrackerProps) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) return;

    const storageKey = `pv:${articleId}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(storageKey)) {
      return;
    }

    sentRef.current = true;

    fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        articleId,
        path,
        referrer: document.referrer || undefined,
      }),
      keepalive: true,
    })
      .then(() => {
        try {
          sessionStorage.setItem(storageKey, "1");
        } catch {
          // ignore storage errors
        }
      })
      .catch(() => {
        sentRef.current = false;
      });
  }, [articleId, path]);

  return null;
}
