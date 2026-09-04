"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SITE_CONFIG } from "@/constants/site";
import { isEnglishHostname } from "@/lib/language";

function WebErrorInner({ reset }: { reset: () => void }) {
  const searchParams = useSearchParams();
  const isEnglish =
    searchParams.get("lang") === "en" ||
    (typeof window !== "undefined" && isEnglishHostname(window.location.hostname));

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-foreground">
        {isEnglish ? "Something went wrong" : "केही गलत भयो"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isEnglish
          ? `${SITE_CONFIG.name} hit an unexpected error. Please try again.`
          : `${SITE_CONFIG.nameNp} मा अप्रत्याशित त्रुटि आयो। कृपया पुनः प्रयास गर्नुहोस्।`}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-[#0C4EA0] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {isEnglish ? "Try again" : "पुनः प्रयास"}
        </button>
        <Link
          href={isEnglish ? "/?lang=en" : "/"}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          {isEnglish ? "Home" : "गृह"}
        </Link>
      </div>
    </main>
  );
}

export default function WebError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-bold text-foreground">केही गलत भयो</h1>
        </main>
      }
    >
      <WebErrorInner reset={reset} />
    </Suspense>
  );
}
