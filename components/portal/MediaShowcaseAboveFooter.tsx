"use client";

import { PhotoFeatureSection } from "@/components/portal/PhotoFeatureSection";
import { ReelsSection } from "@/components/portal/ReelsSection";
import { PortalContainer } from "@/components/portal/SectionHeader";
import type { LanguageEditionType } from "@/lib/language";

type GalleryCard = {
  id: string;
  title: string;
  titleNp?: string | null;
  slug: string;
  description?: string | null;
  coverUrl?: string | null;
  createdAt: string | Date;
  itemCount?: number;
};

type VideoItem = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  altText?: string | null;
  caption?: string | null;
  folder?: string | null;
};

type MediaShowcaseAboveFooterProps = {
  lang?: LanguageEditionType;
  galleries?: GalleryCard[];
  videos?: VideoItem[];
};

/** Photo feature + Reels stacked above राशिफल in the site chrome. */
export function MediaShowcaseAboveFooter({
  lang = "ne",
  galleries = [],
  videos = [],
}: MediaShowcaseAboveFooterProps) {
  return (
    <div className="w-full bg-white">
      <PortalContainer className="py-6">
        <PhotoFeatureSection
          lang={lang}
          galleries={galleries.map((g) => ({
            ...g,
            createdAt: typeof g.createdAt === "string" ? g.createdAt : g.createdAt.toISOString(),
            itemCount: g.itemCount,
          }))}
        />
      </PortalContainer>
      <PortalContainer className="py-6">
        <ReelsSection lang={lang} videos={videos} />
      </PortalContainer>
    </div>
  );
}
