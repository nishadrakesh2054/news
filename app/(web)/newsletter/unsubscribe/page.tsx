"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) return;

    fetch(`/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((json) => {
        setMessage(json.message || (json.success ? "सदस्यता रद्द भयो।" : "Failed"));
        setDone(true);
      })
      .catch(() => {
        setMessage("अनसब्सक्राइब गर्दा समस्या आयो।");
        setDone(true);
      });
  }, [token]);

  if (!token) {
    return (
      <>
        <p className="mt-4 text-muted-foreground">अमान्य अनसब्सक्राइब लिङ्क।</p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-[#027081] hover:underline">
          गृहपृष्ठमा फर्कनुहोस्
        </Link>
      </>
    );
  }

  return (
    <>
      <p className="mt-4 text-muted-foreground">{message ?? "Processing…"}</p>
      {done ? (
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-[#027081] hover:underline">
          गृहपृष्ठमा फर्कनुहोस्
        </Link>
      ) : null}
    </>
  );
}

export default function NewsletterUnsubscribePage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-foreground">न्यूजलेटर सदस्यता</h1>
      <Suspense fallback={<p className="mt-4 text-muted-foreground">Loading…</p>}>
        <UnsubscribeContent />
      </Suspense>
    </main>
  );
}
