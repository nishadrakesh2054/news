import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { resolveLanguageEdition } from "@/lib/language";
import { SITE_TITLE_SUFFIX, SITE_TITLE_SUFFIX_NP } from "@/constants/site";
import { PortalContainer } from "@/components/portal/SectionHeader";
import { PORTAL } from "@/constants/portal";
import { getFormattedNepaliDate } from "@/lib/nepaliDate";
import { getRashiBySlug, RASHI_LETTERS } from "@/lib/rashifal";
import { loadRashifalList } from "@/lib/rashifal-server";
import { RashiPeriodTabs } from "@/components/portal/RashiPeriodTabs";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, headerList.get("host"));
  const list = await loadRashifalList();
  const rashi = getRashiBySlug(list, slug);
  if (!rashi) {
    return { title: lang === "en" ? `Horoscope ${SITE_TITLE_SUFFIX}` : `राशिफल ${SITE_TITLE_SUFFIX_NP}` };
  }
  return {
    title:
      lang === "en"
        ? `${rashi.enName} horoscope ${SITE_TITLE_SUFFIX}`
        : `${rashi.name} राशिफल ${SITE_TITLE_SUFFIX_NP}`,
  };
}

export const dynamic = "force-dynamic";

export default async function RashiDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, headerList.get("host"));
  const isEnglish = lang === "en";
  const langQ = isEnglish ? "?lang=en" : "";

  const list = await loadRashifalList();
  const rashi = getRashiBySlug(list, slug);
  if (!rashi) notFound();

  const index = list.findIndex((r) => r.slug === rashi.slug);
  const prev = index > 0 ? list[index - 1] : list[list.length - 1];
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : list[0];

  const letters = RASHI_LETTERS[rashi.name] || "";
  const dateLabel = getFormattedNepaliDate();

  const meta = [
    { label: isEnglish ? "Lucky number" : "शुभ अङ्क", value: rashi.luckyNumber },
    { label: isEnglish ? "Lucky color" : "शुभ रङ्ग", value: rashi.luckyColor },
    { label: isEnglish ? "Direction" : "दिशा", value: rashi.luckyDirection },
    { label: isEnglish ? "Fortune" : "भाग्य", value: `${rashi.luckyPercent}%` },
  ];

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
          <Link href={`/rashifal${langQ}`} className="hover:underline" style={{ color: PORTAL.brand }}>
            {isEnglish ? "Horoscope" : "राशिफल"}
          </Link>
          <span aria-hidden className="text-gray-300">
            /
          </span>
          <span className="font-medium text-gray-700">
            {isEnglish ? rashi.enName : rashi.name}
          </span>
        </nav>

        <header className="mb-6 max-w-3xl">
          <div className="mb-3 flex items-center gap-2.5">
            <p
              className="shrink-0 text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: PORTAL.accent }}
            >
              {isEnglish ? "Horoscope" : "राशिफल"}
            </p>
            <div
              className="h-px min-w-4 flex-1 max-w-[3.5rem]"
              style={{ backgroundColor: PORTAL.accent, opacity: 0.4 }}
            />
            <p className="text-[12px] text-gray-500">{dateLabel}</p>
          </div>

          <div className="flex items-start gap-4 sm:gap-5">
            <span
              className="text-5xl leading-none sm:text-6xl"
              style={{ color: PORTAL.brand }}
              aria-hidden
            >
              {rashi.symbol}
            </span>
            <div className="min-w-0 pt-1">
              <h1
                className="text-3xl font-extrabold tracking-tight sm:text-4xl"
                style={{ color: PORTAL.brand }}
              >
                {isEnglish ? rashi.enName : `${rashi.name} राशि`}
              </h1>
              <p className="mt-1 text-[13px] leading-snug text-gray-500 sm:text-sm">
                {isEnglish ? rashi.name : rashi.enName}
                <span className="mx-1.5 text-gray-300">·</span>
                {rashi.rashiSwami}
                <span className="mx-1.5 text-gray-300">·</span>
                {rashi.element}
              </p>
              {letters ? (
                <p className="mt-2 max-w-xl text-[12px] leading-snug text-gray-400 sm:text-[13px]">
                  {letters}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 text-xs font-bold">
            <Link
              href={`/rashifal/${prev.slug}${langQ}`}
              className="inline-flex items-center gap-0.5 hover:underline"
              style={{ color: PORTAL.brand }}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {isEnglish ? prev.enName : prev.name}
            </Link>
            <Link
              href={`/rashifal/${next.slug}${langQ}`}
              className="inline-flex items-center gap-0.5 hover:underline"
              style={{ color: PORTAL.brand }}
            >
              {isEnglish ? next.enName : next.name}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        <dl className="mb-8 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-4 border-y border-gray-100 py-4 sm:grid-cols-4 sm:gap-y-0">
          {meta.map((item, i) => (
            <div
              key={item.label}
              className={
                i > 0 ? "sm:border-l sm:border-[rgba(196,30,58,0.55)] sm:pl-5" : undefined
              }
            >
              <dt
                className="text-[10px] font-bold uppercase tracking-[0.12em]"
                style={{ color: PORTAL.accent }}
              >
                {item.label}
              </dt>
              <dd className="mt-1 text-sm font-semibold leading-snug" style={{ color: PORTAL.brand }}>
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="max-w-3xl">
          <RashiPeriodTabs rashi={rashi} isEnglish={isEnglish} />
        </div>

        <section className="mt-12 max-w-4xl pt-8" style={{ borderTop: `1px solid ${PORTAL.rule}` }}>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="shrink-0 text-sm font-extrabold" style={{ color: PORTAL.brand }}>
              {isEnglish ? "All rashis" : "सबै राशि"}
            </h2>
            <div
              className="h-px min-w-4 flex-1"
              style={{ backgroundColor: PORTAL.accent, opacity: 0.35 }}
            />
            <Link
              href={`/rashifal${langQ}`}
              className="shrink-0 text-xs font-bold hover:underline"
              style={{ color: PORTAL.brand }}
            >
              {isEnglish ? "Hub" : "सूची"}
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 sm:gap-3">
            {list.map((r) => {
              const active = r.slug === rashi.slug;
              return (
                <Link
                  key={r.slug}
                  href={`/rashifal/${r.slug}${langQ}`}
                  className="flex flex-col items-center px-1.5 py-3 text-center transition-colors hover:bg-gray-50"
                  style={{
                    backgroundColor: active ? "rgba(25, 87, 166, 0.06)" : undefined,
                  }}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className="mb-1 text-2xl leading-none sm:text-[1.75rem]"
                    style={{ color: PORTAL.brand }}
                    aria-hidden
                  >
                    {r.symbol}
                  </span>
                  <span
                    className="text-[11px] leading-tight sm:text-xs"
                    style={{
                      color: active ? PORTAL.brand : PORTAL.muted,
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {isEnglish ? r.enName : r.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </PortalContainer>
    </main>
  );
}
