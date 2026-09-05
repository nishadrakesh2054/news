import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { resolveLanguageEdition } from "@/lib/language";
import { editionAlternates, pageTitle, requestHost } from "@/lib/seo";
import { PortalContainer } from "@/components/portal/SectionHeader";
import { PhotoFeatureSection } from "@/components/portal/PhotoFeatureSection";
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
  const title = lang === "en" ? "Media" : "मिडिया";
  return {
    title: pageTitle(title, lang),
    description:
      lang === "en"
        ? "Photo galleries and video reels from Echo Manch."
        : "इको माञ्चका फोटो ग्यालेरी र भिडियो रिल्स।",
    alternates: editionAlternates("/media", lang),
  };
}

export default async function MediaGalleryPage({ searchParams }: MediaPageProps) {
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, requestHost(headerList));
  const isEnglish = lang === "en";
  const langQ = isEnglish ? "?lang=en" : "";

  const [galleries, reels] = await Promise.all([
    prisma.gallery.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        description: true,
        coverUrl: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    }),
    getCachedReels(),
  ]);

  const hasContent = galleries.length > 0 || reels.length > 0;

  return (
    <main className="w-full bg-white pb-16 text-gray-900">
      <PortalContainer className="py-6 sm:py-8">
        <h1 className="sr-only">{isEnglish ? "Media" : "मिडिया"}</h1>

        <nav className="mb-6 text-[12px] text-gray-400">
          <Link href={isEnglish ? "/?lang=en" : "/"} className="hover:underline" style={{ color: PORTAL.brand }}>
            {isEnglish ? "Home" : "गृह"}
          </Link>
          <span className="mx-1.5">/</span>
          <span style={{ color: PORTAL.ink }}>{isEnglish ? "Media" : "मिडिया"}</span>
        </nav>

        {!hasContent ? (
          <p className="border border-dashed border-gray-300 px-4 py-12 text-center text-sm text-gray-500">
            {isEnglish ? "No media published yet." : "अहिले कुनै मिडिया प्रकाशित छैन।"}
          </p>
        ) : (
          <div className="space-y-10">
            {galleries.length > 0 ? (
              <section className="space-y-4">
                <h2 className="text-lg font-extrabold sm:text-xl" style={{ color: PORTAL.brand }}>
                  {isEnglish ? "Photo galleries" : "फोटो ग्यालेरी"}
                </h2>
                <PhotoFeatureSection
                  lang={lang}
                  showHeader={false}
                  galleries={galleries.map((g) => ({
                    id: g.id,
                    title: g.title,
                    titleNp: g.titleNp,
                    slug: g.slug,
                    description: g.description,
                    coverUrl: g.coverUrl,
                    createdAt: g.createdAt.toISOString(),
                    itemCount: g._count.items,
                  }))}
                />
              </section>
            ) : null}

            {reels.length > 0 ? (
              <section className="space-y-4">
                <h2 className="text-lg font-extrabold sm:text-xl" style={{ color: PORTAL.brand }}>
                  {isEnglish ? "Reels" : "रिल्स"}
                </h2>
                <ReelsSection lang={lang} videos={reels} showHeader={false} />
              </section>
            ) : null}
          </div>
        )}

        <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <Link
            href={`/galleries${langQ}`}
            className="inline-flex items-center gap-1 font-bold hover:underline"
            style={{ color: PORTAL.brand }}
          >
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {isEnglish ? "All photo galleries" : "सबै फोटो ग्यालेरी"}
          </Link>
          <Link
            href={isEnglish ? "/?lang=en" : "/"}
            className="inline-flex items-center gap-1 font-bold hover:underline"
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
