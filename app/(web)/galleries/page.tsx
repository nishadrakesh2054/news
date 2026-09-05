import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { resolveLanguageEdition } from "@/lib/language";
import { editionAlternates, pageTitle, requestHost } from "@/lib/seo";
import { PortalContainer } from "@/components/portal/SectionHeader";
import { PORTAL } from "@/constants/portal";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";
import { formatTimeAgo } from "@/lib/nepaliDate";

type GalleriesIndexProps = {
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({
  searchParams,
}: GalleriesIndexProps): Promise<Metadata> {
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, requestHost(headerList));
  const title = lang === "en" ? "Photo galleries" : "फोटो ग्यालेरी";
  return {
    title: pageTitle(title, lang),
    description:
      lang === "en"
        ? "Photo galleries and visual stories from Echo Manch."
        : "इको माञ्चका फोटो ग्यालेरी र दृश्य कथाहरू।",
    alternates: editionAlternates("/galleries", lang),
  };
}

export const revalidate = 60;

export default async function GalleriesIndexPage({ searchParams }: GalleriesIndexProps) {
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, requestHost(headerList));
  const isEnglish = lang === "en";
  const langQ = isEnglish ? "?lang=en" : "";

  const galleries = await prisma.gallery.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      titleNp: true,
      slug: true,
      description: true,
      coverUrl: true,
      createdAt: true,
      _count: { select: { items: true } },
      items: {
        orderBy: { order: "asc" },
        take: 1,
        select: { media: { select: { url: true } } },
      },
    },
  });

  return (
    <main className="w-full bg-white pb-12 text-gray-900">
      <PortalContainer className="py-6 sm:py-8">
        <Link
          href={`/${langQ}`}
          className="mb-4 inline-block text-xs font-bold hover:underline"
          style={{ color: PORTAL.brand }}
        >
          ← {isEnglish ? "Home" : "गृह"}
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <h1
            className="shrink-0 text-xl font-extrabold tracking-tight sm:text-2xl"
            style={{ color: PORTAL.brand }}
          >
            {isEnglish ? "Photo galleries" : "फोटो ग्यालेरी"}
          </h1>
          <div
            className="h-px min-w-4 flex-1"
            style={{ backgroundColor: PORTAL.accent, opacity: 0.35 }}
          />
        </div>

        {galleries.length === 0 ? (
          <p className="border border-dashed border-gray-300 px-4 py-12 text-center text-sm text-gray-500">
            {isEnglish ? "No galleries published yet." : "अहिले कुनै ग्यालेरी प्रकाशित छैन।"}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleries.map((gallery) => {
              const title = isEnglish
                ? gallery.title || gallery.titleNp || ""
                : gallery.titleNp || gallery.title;
              const cover =
                optimizeCloudinaryUrl(
                  gallery.coverUrl || gallery.items[0]?.media?.url,
                  "card"
                ) ||
                gallery.coverUrl ||
                gallery.items[0]?.media?.url;
              const when = formatTimeAgo(gallery.createdAt, lang);

              return (
                <Link
                  key={gallery.id}
                  href={`/gallery/${gallery.slug}${langQ}`}
                  className="group block overflow-hidden border border-gray-200 bg-white transition-colors hover:border-gray-300"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-gray-200">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cover}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="text-[10px] font-medium text-gray-500">
                      {gallery._count.items} {isEnglish ? "photos" : "तस्बिर"} · {when}
                    </p>
                    <h2 className="line-clamp-2 text-sm font-extrabold text-gray-900 group-hover:underline sm:text-base">
                      {title}
                    </h2>
                    {gallery.description ? (
                      <p className="line-clamp-2 text-xs text-gray-600">{gallery.description}</p>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </PortalContainer>
    </main>
  );
}
