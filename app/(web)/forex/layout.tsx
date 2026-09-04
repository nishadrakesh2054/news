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
  const title = lang === "en" ? "Foreign exchange rates" : "विदेशी विनिमय दर";
  return {
    title: pageTitle(title, lang),
    description:
      lang === "en"
        ? "Nepal Rastra Bank forex buying and selling rates."
        : "नेपाल राष्ट्र बैंकको खरिद तथा बिक्री विनिमय दर।",
    alternates: editionAlternates("/forex", lang),
  };
}

export default function ForexLayout({ children }: { children: React.ReactNode }) {
  return children;
}
