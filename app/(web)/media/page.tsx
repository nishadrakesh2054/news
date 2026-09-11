import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { ChevronRight } from "lucide-react";
import { resolveLanguageEdition } from "@/lib/language";
import { editionAlternates, pageTitle, requestHost } from "@/lib/seo";
import { PortalContainer } from "@/components/portal/SectionHeader";
import { ReelsSection } from "@/components/portal/ReelsSection";
import { PORTAL } from "@/constants/portal";
import { getCachedReels } from "@/lib/public-cache";

export const revalidate = 60;

type MediaPageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({ searchParams }: MediaPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, requestHost(headerList));
  const title = lang === "en" ? "Reels" : "रिल्स";
  return {
    title: pageTitle(title, lang),
    description:
      lang === "en"
        ? "Video reels from Echo Manch."
        : "इको माञ्चका भिडियो रिल्स।",
    alternates: editionAlternates("/media", lang),
  };
}

export default async function MediaGalleryPage({ searchParams }: MediaPageProps) {
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, requestHost(headerList));
  const isEnglish = lang === "en";
  const reels = await getCachedReels();

  return (
    <main className="w-full bg-white pb-16 text-gray-900">
      <PortalContainer className="py-6 sm:py-8">
        <h1 className="sr-only">{isEnglish ? "Reels" : "रिल्स"}</h1>

        <nav className="mb-6 text-[12px] text-gray-400">
          <Link href={isEnglish ? "/?lang=en" : "/"} className="hover:underline" style={{ color: PORTAL.brand }}>
            {isEnglish ? "Home" : "गृह"}
          </Link>
          <span className="mx-1.5">/</span>
          <span style={{ color: PORTAL.ink }}>{isEnglish ? "Reels" : "रिल्स"}</span>
        </nav>

        {reels.length === 0 ? (
          <p className="border border-dashed border-gray-300 px-4 py-12 text-center text-sm text-gray-500">
            {isEnglish ? "No reels published yet." : "अहिले कुनै रिल्स प्रकाशित छैन।"}
          </p>
        ) : (
          <ReelsSection lang={lang} videos={reels} showHeader />
        )}

        <div className="mt-12">
          <Link
            href={isEnglish ? "/?lang=en" : "/"}
            className="inline-flex items-center gap-1 text-sm font-bold hover:underline"
            style={{ color: PORTAL.brand }}
          >
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {isEnglish ? "Back to home" : "गृहपृष्ठ"}
          </Link>
        </div>
      </PortalContainer>
    </main>
  );
}
