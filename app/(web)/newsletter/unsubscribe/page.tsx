"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SITE_CONFIG } from "@/constants/site";
import { isEnglishHostname } from "@/lib/language";

function useEdition() {
  const searchParams = useSearchParams();
  return (
    searchParams.get("lang") === "en" ||
    (typeof window !== "undefined" && isEnglishHostname(window.location.hostname))
  );
}

function UnsubscribeInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const isEnglish = useEdition();
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const homeHref = isEnglish ? "/?lang=en" : "/";
  const backLabel = isEnglish
    ? `Back to ${SITE_CONFIG.name}`
    : `${SITE_CONFIG.nameNp} मा फर्कनुहोस्`;

  useEffect(() => {
    if (!token) return;

    fetch(`/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((json) => {
        setMessage(
          json.message ||
            (json.success
              ? isEnglish
                ? "Subscription cancelled."
                : "सदस्यता रद्द भयो।"
              : isEnglish
                ? "Request failed."
                : "अनुरोध असफल।")
        );
        setDone(true);
      })
      .catch(() => {
        setMessage(
          isEnglish
            ? "Could not unsubscribe. Please try again."
            : "सदस्यता रद्द गर्न सकिएन। कृपया पुनः प्रयास गर्नुहोस्।"
        );
        setDone(true);
      });
  }, [token, isEnglish]);

  return (
    <main className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-foreground">
        {isEnglish ? "Newsletter" : "न्यूजलेटर"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isEnglish
          ? `Manage your ${SITE_CONFIG.name} subscription`
          : `${SITE_CONFIG.nameNp} सदस्यता व्यवस्थापन`}
      </p>

      {!token ? (
        <>
          <p className="mt-4 text-muted-foreground">
            {isEnglish ? "Invalid unsubscribe link." : "अमान्य सदस्यता रद्द लिङ्क।"}
          </p>
          <Link href={homeHref} className="mt-6 inline-block text-sm font-medium text-[#0C4EA0] hover:underline">
            {backLabel}
          </Link>
        </>
      ) : (
        <>
          <p className="mt-4 text-muted-foreground" role="status">
            {message ?? (isEnglish ? "Processing…" : "प्रक्रिया हुँदैछ…")}
          </p>
          {done ? (
            <Link href={homeHref} className="mt-6 inline-block text-sm font-medium text-[#0C4EA0] hover:underline">
              {backLabel}
            </Link>
          ) : null}
        </>
      )}
    </main>
  );
}

export default function NewsletterUnsubscribePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-lg px-4 py-20 text-center">
          <p className="text-muted-foreground">लोड हुँदैछ…</p>
        </main>
      }
    >
      <UnsubscribeInner />
    </Suspense>
  );
}
