import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
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

  const letters = RASHI_LETTERS[rashi.name] || "";
  const dateLabel = getFormattedNepaliDate();

  const meta = [
    { label: isEnglish ? "Lucky number" : "शुभ अङ्क", value: rashi.luckyNumber },
    { label: isEnglish ? "Lucky color" : "शुभ रङ्ग", value: rashi.luckyColor },
    { label: isEnglish ? "Direction" : "दिशा", value: rashi.luckyDirection },
    { label: isEnglish ? "Fortune" : "भाग्य", value: `${rashi.luckyPercent}%` },
  ];

  return (
    <main className="w-full bg-white pb-16 text-gray-900">
      <PortalContainer className="py-8 sm:py-10">
        <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-[12px] text-gray-400">
          <Link
            href={`/${langQ}`}
            className="transition-colors hover:underline"
            style={{ color: PORTAL.brand }}
          >
            {isEnglish ? "Home" : "गृह"}
          </Link>
          <span aria-hidden className="text-gray-300">
            /
          </span>
          <Link
            href={`/rashifal${langQ}`}
            className="transition-colors hover:underline"
            style={{ color: PORTAL.brand }}
          >
            {isEnglish ? "Horoscope" : "राशिफल"}
          </Link>
          <span aria-hidden className="text-gray-300">
            /
          </span>
          <span className="font-medium" style={{ color: PORTAL.ink }}>
            {isEnglish ? rashi.enName : rashi.name}
          </span>
        </nav>

        <header className="mb-10 max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <p
              className="shrink-0 text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ color: PORTAL.accent }}
            >
              {isEnglish ? "Horoscope" : "राशिफल"}
            </p>
            <div
              className="h-px min-w-4 flex-1 max-w-[4rem]"
              style={{ backgroundColor: PORTAL.accent, opacity: 0.45 }}
            />
            <p className="text-[12px] text-gray-500">{dateLabel}</p>
          </div>

          <div className="flex items-start gap-4 sm:gap-5">
            <span
              className="text-4xl leading-none sm:text-5xl"
              style={{ color: PORTAL.brand }}
              aria-hidden
            >
              {rashi.symbol}
            </span>
            <div className="min-w-0 pt-0.5">
              <h1
                className="text-3xl font-extrabold tracking-tight sm:text-4xl"
                style={{ color: PORTAL.brand }}
              >
                {isEnglish ? rashi.enName : `${rashi.name} राशि`}
              </h1>
              <p className="mt-1.5 text-sm text-gray-500">
                {isEnglish ? rashi.name : rashi.enName}
                <span className="mx-2 text-gray-300">·</span>
                {rashi.rashiSwami}
                <span className="mx-2 text-gray-300">·</span>
                {rashi.element}
              </p>
              {letters ? (
                <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-gray-400">
                  {letters}
                </p>
              ) : null}
            </div>
          </div>
        </header>

        <dl className="mb-12 grid max-w-3xl grid-cols-2 gap-y-5 sm:grid-cols-4 sm:gap-x-8">
          {meta.map((item, i) => (
            <div
              key={item.label}
              className={i > 0 ? "sm:border-l sm:border-gray-100 sm:pl-6" : undefined}
            >
              <dt
                className="text-[11px] font-bold uppercase tracking-[0.12em]"
                style={{ color: PORTAL.accent }}
              >
                {item.label}
              </dt>
              <dd className="mt-1.5 text-sm font-semibold" style={{ color: PORTAL.brand }}>
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="max-w-3xl">
          <RashiPeriodTabs rashi={rashi} isEnglish={isEnglish} />
        </div>

        <section className="mt-14 max-w-4xl pt-8" style={{ borderTop: `1px solid ${PORTAL.rule}` }}>
          <div className="mb-4 flex items-center gap-3">
            <h2
              className="shrink-0 text-sm font-extrabold"
              style={{ color: PORTAL.brand }}
            >
              {isEnglish ? "All rashis" : "सबै राशि"}
            </h2>
            <div
              className="h-px min-w-4 flex-1"
              style={{ backgroundColor: PORTAL.accent, opacity: 0.35 }}
            />
          </div>
          <div className="flex flex-wrap gap-x-0.5 gap-y-1">
            {list.map((r) => {
              const active = r.slug === rashi.slug;
              return (
                <Link
                  key={r.slug}
                  href={`/rashifal/${r.slug}${langQ}`}
                  className="px-2.5 py-1.5 text-sm transition-colors hover:underline"
                  style={{
                    color: active ? PORTAL.brand : PORTAL.muted,
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  <span className="mr-1" aria-hidden>
                    {r.symbol}
                  </span>
                  {isEnglish ? r.enName : r.name}
                  {active ? (
                    <span
                      className="ml-1 inline-block h-1 w-1 rounded-full align-middle"
                      style={{ backgroundColor: PORTAL.accent }}
                      aria-hidden
                    />
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>
      </PortalContainer>
    </main>
  );
}
