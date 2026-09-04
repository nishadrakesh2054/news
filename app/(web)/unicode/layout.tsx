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
  const title = lang === "en" ? "Nepali Unicode converter" : "नेपाली युनिकोड रूपान्तरक";
  return {
    title: pageTitle(title, lang),
    description:
      lang === "en"
        ? "Type in Roman and convert to Nepali Unicode."
        : "रोमन अक्षरबाट नेपाली युनिकोडमा रूपान्तरण गर्नुहोस्।",
    alternates: editionAlternates("/unicode", lang),
  };
}

export default function UnicodeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
