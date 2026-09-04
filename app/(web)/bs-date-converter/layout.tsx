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
  const title = lang === "en" ? "BS date converter" : "मिति रूपान्तरण";
  return {
    title: pageTitle(title, lang),
    description:
      lang === "en"
        ? "Convert between English (A.D.) and Bikram Sambat dates."
        : "अंग्रेजी मिति (ई.सं.) र नेपाली बि.सं. बीच रूपान्तरण।",
    alternates: editionAlternates("/bs-date-converter", lang),
  };
}

export default function BsDateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
