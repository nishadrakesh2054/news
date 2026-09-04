import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { SITE_CONFIG } from "@/constants/site";
import { resolveLanguageEdition } from "@/lib/language";
import { requestHost, SITE_LANG_HEADER } from "@/lib/seo";
import { PORTAL } from "@/constants/portal";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default async function GlobalNotFound() {
  const headerList = await headers();
  const lang = resolveLanguageEdition(
    headerList.get(SITE_LANG_HEADER),
    requestHost(headerList)
  );
  const isEnglish = lang === "en";
  const homeHref = isEnglish ? "/?lang=en" : "/";

  return (
    <html lang={isEnglish ? "en" : "ne"}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <main className="mx-auto max-w-lg px-4 py-24 text-center">
          <p className="text-sm font-bold uppercase tracking-wide" style={{ color: PORTAL.accent }}>
            404
          </p>
          <h1 className="mt-3 text-2xl font-extrabold" style={{ color: PORTAL.brand }}>
            {isEnglish ? "Page not found" : "पृष्ठ भेटिएन"}
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            {isEnglish
              ? `The page you requested is unavailable on ${SITE_CONFIG.name}.`
              : `तपाईंले खोज्नुभएको पृष्ठ ${SITE_CONFIG.nameNp} मा उपलब्ध छैन।`}
          </p>
          <Link
            href={homeHref}
            className="mt-8 inline-block text-sm font-bold hover:underline"
            style={{ color: PORTAL.brand }}
          >
            {isEnglish ? "Back to home" : "गृहपृष्ठमा फर्कनुहोस्"}
          </Link>
        </main>
      </body>
    </html>
  );
}
