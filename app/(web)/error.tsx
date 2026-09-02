"use client";

import Link from "next/link";
import { SITE_CONFIG } from "@/constants/site";

export default function WebError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {SITE_CONFIG.name} hit an unexpected error. Please try again.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-[#0C4EA0] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Try again
        </button>
        <Link href="/" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
          Home
        </Link>
      </div>
    </main>
  );
}
