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
  const title = lang === "en" ? "Gold & silver rates" : "सुन चाँदी दर";
  return {
    title: pageTitle(title, lang),
    description:
      lang === "en"
        ? "Today's gold and silver rates in Nepal."
        : "आजको सुन तथा चाँदीको बजार भाउ।",
    alternates: editionAlternates("/gold-rate", lang),
  };
}

export default function GoldRateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
