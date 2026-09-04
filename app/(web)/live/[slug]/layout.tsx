import type { Metadata } from "next";
import { headers } from "next/headers";
import { resolveLanguageEdition } from "@/lib/language";
import { SITE_LANG_HEADER, editionAlternates, pageTitle, requestHost } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const headerList = await headers();
  const lang = resolveLanguageEdition(
    headerList.get(SITE_LANG_HEADER),
    requestHost(headerList)
  );
  const title = lang === "en" ? "Live coverage" : "प्रत्यक्ष कभरेज";
  return {
    title: pageTitle(title, lang),
    description:
      lang === "en"
        ? "Live news updates and coverage."
        : "प्रत्यक्ष समाचार अपडेट र कभरेज।",
    alternates: editionAlternates(`/live/${slug}`, lang),
  };
}

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
