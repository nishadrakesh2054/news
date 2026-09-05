"use client";

import Link from "next/link";
import type { LanguageEditionType } from "@/lib/language";
import { formatTimeAgo } from "@/lib/nepaliDate";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";
import { SectionHeader } from "@/components/portal/SectionHeader";

type GalleryCard = {
  id: string;
  title: string;
  titleNp?: string | null;
  slug: string;
  description?: string | null;
  coverUrl?: string | null;
  createdAt: string;
  itemCount?: number;
};

type PhotoFeatureSectionProps = {
  lang?: LanguageEditionType | string;
  galleries?: GalleryCard[];
  /** Hide title + rule (e.g. when the parent page already has a heading). */
  showHeader?: boolean;
};

export function PhotoFeatureSection({
  lang = "ne",
  galleries = [],
  showHeader = true,
}: PhotoFeatureSectionProps) {
  const isEnglish = lang === "en";
  const langQ = isEnglish ? "?lang=en" : "";

  if (galleries.length === 0) return null;

  return (
    <section className={showHeader ? "py-2" : undefined}>
      {showHeader ? (
        <SectionHeader
          title={isEnglish ? "Photo Feature" : "फोटो फिचर"}
          href={`/galleries${langQ}`}
          linkLabel={isEnglish ? "More photos" : "थप फोटो"}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {galleries.map((gallery) => {
          const title =
            isEnglish
              ? gallery.title || gallery.titleNp || ""
              : gallery.titleNp || gallery.title;
          const cover =
            optimizeCloudinaryUrl(gallery.coverUrl, "card") || gallery.coverUrl;
          const when = formatTimeAgo(new Date(gallery.createdAt), isEnglish ? "en" : "ne");

          return (
            <Link
              key={gallery.id}
              href={`/gallery/${gallery.slug}${langQ}`}
              className="group relative block min-h-[220px] overflow-hidden bg-neutral-800 sm:min-h-[260px]"
            >
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              ) : null}

              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.05) 100%)",
                }}
              />

              <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-4">
                {(gallery.itemCount ?? 0) > 0 ? (
                  <p className="mb-1 text-[10px] font-medium text-white/75">
                    {gallery.itemCount} {isEnglish ? "photos" : "तस्बिर"} · {when}
                  </p>
                ) : (
                  <p className="mb-1 text-[10px] font-medium text-white/75">{when}</p>
                )}
                <h3 className="line-clamp-2 text-sm font-extrabold leading-snug text-white sm:text-base">
                  {title}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
