"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { isEnglishHostname } from "@/lib/language";

function SkipToContentInner() {
  const searchParams = useSearchParams();
  const isEnglish =
    searchParams.get("lang") === "en" ||
    (typeof window !== "undefined" && isEnglishHostname(window.location.hostname));

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-md focus:outline-none focus:ring-2 focus:ring-[#0C4EA0]"
    >
      {isEnglish ? "Skip to main content" : "मुख्य सामग्रीमा जानुहोस्"}
    </a>
  );
}

export function SkipToContent() {
  return (
    <Suspense fallback={null}>
      <SkipToContentInner />
    </Suspense>
  );
}
