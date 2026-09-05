"use client";

import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import type { LanguageEditionType } from "@/lib/language";
import { parseYoutubeVideoId } from "@/lib/youtube";
import { SectionHeader } from "@/components/portal/SectionHeader";

type VideoItem = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  altText?: string | null;
  caption?: string | null;
  folder?: string | null;
};

type ReelsSectionProps = {
  lang?: LanguageEditionType | string;
  videos?: VideoItem[];
  /** Hide title + rule (e.g. when the parent page already has a heading). */
  showHeader?: boolean;
};

function thumbFor(video: VideoItem): string | null {
  if (video.altText?.includes("img.youtube.com")) return video.altText;
  const fromCaption = video.caption ? parseYoutubeVideoId(video.caption) : null;
  if (fromCaption) return `https://img.youtube.com/vi/${fromCaption}/hqdefault.jpg`;
  const fromUrl = parseYoutubeVideoId(video.url);
  if (fromUrl) return `https://img.youtube.com/vi/${fromUrl}/hqdefault.jpg`;
  if (video.mimeType !== "video/youtube") return video.url;
  return null;
}

function watchHref(video: VideoItem): string {
  if (video.caption?.includes("youtube") || video.caption?.includes("youtu.be")) {
    return video.caption;
  }
  const id = parseYoutubeVideoId(video.url);
  if (id) return `https://www.youtube.com/watch?v=${id}`;
  return video.url;
}

function embedIdFor(video: VideoItem): string | null {
  return (
    parseYoutubeVideoId(video.url) ||
    (video.caption ? parseYoutubeVideoId(video.caption) : null)
  );
}

export function ReelsSection({ lang = "ne", videos = [], showHeader = true }: ReelsSectionProps) {
  const isEnglish = lang === "en";
  const langQ = isEnglish ? "?lang=en" : "";
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = videos.find((v) => v.id === activeId) || null;
  const activeEmbedId = active ? embedIdFor(active) : null;

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [activeId]);

  if (videos.length === 0) return null;

  return (
    <section className={showHeader ? "py-2" : undefined}>
      {showHeader ? (
        <SectionHeader
          title={isEnglish ? "Reels" : "रिल्स"}
          href={`/media${langQ}`}
          linkLabel={isEnglish ? "More videos" : "थप भिडियो"}
        />
      ) : null}

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {videos.map((video) => {
          const thumb = thumbFor(video);
          return (
            <button
              key={video.id}
              type="button"
              onClick={() => setActiveId(video.id)}
              className="group relative w-[140px] shrink-0 overflow-hidden bg-neutral-800 text-left sm:w-[160px]"
              style={{ aspectRatio: "9 / 16" }}
            >
              {thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumb}
                  alt={video.filename}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: "rgba(25, 87, 166, 0.85)" }}
                >
                  <Play className="h-3 w-3 fill-white" />
                </span>
              </span>
              <span className="absolute inset-x-0 bottom-0 z-10 p-2.5">
                <span className="line-clamp-2 text-[11px] font-bold leading-snug text-white">
                  {video.filename}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {active && activeEmbedId ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={active.filename}
          onClick={() => setActiveId(null)}
        >
          <div
            className="relative w-full max-w-3xl overflow-hidden border border-white/10 bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#0B1F3A] px-3 py-2.5">
              <p className="min-w-0 truncate text-sm font-bold text-white">{active.filename}</p>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={watchHref(active)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-white/80 hover:text-white hover:underline"
                >
                  {isEnglish ? "YouTube" : "युट्युब"} ↗
                </a>
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  className="inline-flex h-8 w-8 items-center justify-center text-white/80 hover:bg-white/10 hover:text-white"
                  aria-label={isEnglish ? "Close" : "बन्द गर्नुहोस्"}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                title={active.filename}
                src={`https://www.youtube.com/embed/${activeEmbedId}?autoplay=1`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
