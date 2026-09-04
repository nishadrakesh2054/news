import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { resolveLanguageEdition } from "@/lib/language";
import { editionAlternates, pageTitle, requestHost } from "@/lib/seo";
import { PortalContainer } from "@/components/portal/SectionHeader";
import { PORTAL } from "@/constants/portal";
import { getFormattedNepaliDate } from "@/lib/nepaliDate";
import { RASHI_LETTERS } from "@/lib/rashifal";
import { loadRashifalList } from "@/lib/rashifal-server";

type PageProps = {
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, requestHost(headerList));
  const title = lang === "en" ? "Horoscope" : "राशिफल";
  return {
    title: pageTitle(title, lang),
    description:
      lang === "en"
        ? "Daily horoscope for all 12 rashis."
        : "१२ राशिको दैनिक राशिफल।",
    alternates: editionAlternates("/rashifal", lang),
  };
}

export const dynamic = "force-dynamic";

export default async function RashifalHubPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, requestHost(headerList));
  const isEnglish = lang === "en";
  const langQ = isEnglish ? "?lang=en" : "";
  const list = await loadRashifalList();
  const dateLabel = getFormattedNepaliDate();

  return (
    <main className="w-full bg-white pb-14 text-gray-900">
      <PortalContainer className="py-6 sm:py-8">
        <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-[12px] text-gray-400">
          <Link href={`/${langQ}`} className="hover:underline" style={{ color: PORTAL.brand }}>
            {isEnglish ? "Home" : "गृह"}
          </Link>
          <span aria-hidden className="text-gray-300">
            /
          </span>
          <span className="font-medium text-gray-700">
            {isEnglish ? "Horoscope" : "राशिफल"}
          </span>
        </nav>

        <div className="mb-2 flex items-center gap-3">
          <h1
            className="shrink-0 text-xl font-extrabold tracking-tight sm:text-2xl"
            style={{ color: PORTAL.brand }}
          >
            {isEnglish ? "Horoscope" : "राशिफल"}
          </h1>
          <div
            className="h-px min-w-4 flex-1"
            style={{ backgroundColor: PORTAL.accent, opacity: 0.35 }}
          />
        </div>
        <p className="mb-5 text-sm leading-snug text-gray-600">
          {dateLabel} ·{" "}
          {isEnglish
            ? "Choose your rashi for today, weekly, monthly and yearly forecasts."
            : "आजको, साप्ताहिक, मासिक र वार्षिक राशिफल हेर्न आफ्नो राशि छान्नुहोस्।"}
        </p>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-6">
          {list.map((rashi) => (
            <Link
              key={rashi.slug}
              href={`/rashifal/${rashi.slug}${langQ}`}
              className="flex flex-col items-center px-2 py-4 text-center transition-colors hover:bg-gray-50 sm:px-3 sm:py-5"
            >
              <span
                className="mb-1.5 text-3xl leading-none sm:text-4xl"
                style={{ color: PORTAL.brand }}
                aria-hidden
              >
                {rashi.symbol}
              </span>
              <span className="text-sm font-bold" style={{ color: PORTAL.brand }}>
                {isEnglish ? rashi.enName : `${rashi.name} राशि`}
              </span>
              {RASHI_LETTERS[rashi.name] ? (
                <span className="mt-1.5 line-clamp-2 text-[10px] leading-snug text-gray-500">
                  {RASHI_LETTERS[rashi.name]}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </PortalContainer>
    </main>
  );
}
