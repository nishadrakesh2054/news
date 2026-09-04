import type { Metadata } from "next";
import { headers } from "next/headers";
import { resolveLanguageEdition } from "@/lib/language";
import { SITE_LANG_HEADER, editionAlternates, pageTitle, requestHost } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const lang = resolveLanguageEdition(
    headerList.get(SITE_LANG_HEADER),
    requestHost(headerList)
  );
  return {
    title: pageTitle(lang === "en" ? "Unsubscribe" : "सदस्यता रद्द", lang),
    robots: { index: false, follow: false },
    alternates: editionAlternates("/newsletter/unsubscribe", lang),
  };
}

export default function UnsubscribeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
