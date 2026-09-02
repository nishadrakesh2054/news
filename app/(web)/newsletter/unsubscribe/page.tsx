"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SITE_CONFIG } from "@/constants/site";

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
        setMessage(json.message || (json.success ? "Subscription cancelled." : "Request failed."));
        setDone(true);
      })
      .catch(() => {
        setMessage("Could not unsubscribe. Please try again.");
        setDone(true);
      });
  }, [token]);

  if (!token) {
    return (
      <>
        <p className="mt-4 text-muted-foreground">Invalid unsubscribe link.</p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-[#0C4EA0] hover:underline">
          Back to {SITE_CONFIG.name}
        </Link>
      </>
    );
  }

  return (
    <>
      <p className="mt-4 text-muted-foreground" role="status">
        {message ?? "Processing…"}
      </p>
      {done ? (
        <Link href="/" className="mt-6 inline-block text-sm font-medium text-[#0C4EA0] hover:underline">
          Back to {SITE_CONFIG.name}
        </Link>
      ) : null}
    </>
  );
}

export default function NewsletterUnsubscribePage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-foreground">Newsletter</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage your {SITE_CONFIG.name} subscription</p>
      <Suspense fallback={<p className="mt-4 text-muted-foreground">Loading…</p>}>
        <UnsubscribeContent />
      </Suspense>
    </main>
  );
}
