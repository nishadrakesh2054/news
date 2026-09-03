import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { resolveLanguageEdition } from "@/lib/language";
import { SITE_TITLE_SUFFIX, SITE_TITLE_SUFFIX_NP } from "@/constants/site";
import { PortalContainer } from "@/components/portal/SectionHeader";
import { PORTAL } from "@/constants/portal";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";

type GalleryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: GalleryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, headerList.get("host"));
  const gallery = await prisma.gallery.findFirst({
    where: { slug, isPublished: true },
    select: { title: true, titleNp: true, description: true },
  });
  if (!gallery) return { title: `Gallery ${SITE_TITLE_SUFFIX}` };
  const title = lang === "en" ? gallery.title : gallery.titleNp || gallery.title;
  return {
    title: `${title} ${lang === "en" ? SITE_TITLE_SUFFIX : SITE_TITLE_SUFFIX_NP}`,
    description: gallery.description || undefined,
  };
}

export const revalidate = 60;

export default async function GalleryDetailPage({ params, searchParams }: GalleryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, headerList.get("host"));
  const isEnglish = lang === "en";
  const langQ = isEnglish ? "?lang=en" : "";

  const gallery = await prisma.gallery.findFirst({
    where: { slug, isPublished: true },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: {
          media: {
            select: { id: true, url: true, altText: true, caption: true },
          },
        },
      },
    },
  });

  if (!gallery) notFound();

  const title = isEnglish ? gallery.title : gallery.titleNp || gallery.title;

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

        <div className="mb-6 border-b border-gray-200 pb-4">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: PORTAL.accent }}>
            {isEnglish ? "Photo gallery" : "फोटो ग्यालेरी"}
          </p>
          <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: PORTAL.brand }}>
            {title}
          </h1>
          {gallery.description ? (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">{gallery.description}</p>
          ) : null}
        </div>

        {gallery.items.length === 0 ? (
          <p className="border border-dashed border-gray-300 px-4 py-12 text-center text-sm text-gray-500">
            {isEnglish ? "No photos in this gallery yet." : "यस ग्यालेरीमा अहिले फोटो छैन।"}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.items.map((item) => {
              const src =
                optimizeCloudinaryUrl(item.media.url, "card") || item.media.url;
              return (
                <figure key={item.id} className="overflow-hidden border border-gray-200 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={item.media.altText || item.caption || title}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  {(item.caption || item.media.caption) && (
                    <figcaption className="px-3 py-2 text-xs text-gray-600">
                      {item.caption || item.media.caption}
                    </figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        )}
      </PortalContainer>
    </main>
  );
}
