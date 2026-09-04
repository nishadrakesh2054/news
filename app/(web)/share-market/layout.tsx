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
  const title = lang === "en" ? "Share market" : "सेयर बजार";
  return {
    title: pageTitle(title, lang),
    description:
      lang === "en"
        ? "NEPSE index and Nepal share market overview."
        : "नेप्से परिसूचक तथा नेपाल सेयर बजार विवरण।",
    alternates: editionAlternates("/share-market", lang),
  };
}

export default function ShareMarketLayout({ children }: { children: React.ReactNode }) {
  return children;
}
