"use client";

import { useMemo, useState } from "react";
import { Video } from "lucide-react";
import { parseYoutubeVideoId, youtubeThumbnailUrl } from "@/lib/youtube";

type MediaThumbProps = {
  url: string;
  mimeType: string;
  filename: string;
  altText?: string | null;
  caption?: string | null;
  /** Applied to the image/video element */
  className?: string;
  /** Wrapper class for the fallback icon state */
  fallbackClassName?: string;
  iconSize?: "sm" | "md" | "lg";
};

function isVideoMime(mimeType: string) {
  return mimeType.startsWith("video/");
}

function cloudinaryVideoFrame(url: string): string | null {
  if (!url.includes("res.cloudinary.com") || !url.includes("/video/upload/")) return null;
  return url
    .replace("/video/upload/", "/video/upload/so_0,w_480,c_fill,f_jpg,q_auto/")
    .replace(/\.(mp4|webm|mov|mkv)(\?.*)?$/i, ".jpg$2");
}

function resolveVideoPoster(opts: {
  url: string;
  altText?: string | null;
  caption?: string | null;
}): string | null {
  const { url, altText, caption } = opts;

  if (altText?.includes("img.youtube.com")) return altText;

  const ytId =
    parseYoutubeVideoId(url) ||
    (caption ? parseYoutubeVideoId(caption) : null) ||
    (altText ? parseYoutubeVideoId(altText) : null);
  if (ytId) return youtubeThumbnailUrl(ytId);

  return cloudinaryVideoFrame(url);
}

const ICON_CLASS = {
  sm: "h-3.5 w-3.5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
} as const;

function VideoFallback({
  filename,
  className,
  iconSize,
}: {
  filename: string;
  className: string;
  iconSize: "sm" | "md" | "lg";
}) {
  return (
    <div className={className} title={filename}>
      <Video className={ICON_CLASS[iconSize]} aria-hidden />
      <span className="sr-only">Video</span>
    </div>
  );
}

export function MediaThumb({
  url,
  mimeType,
  filename,
  altText,
  caption,
  className = "h-full w-full object-cover",
  fallbackClassName,
  iconSize = "md",
}: MediaThumbProps) {
  const isVideo = isVideoMime(mimeType);
  const poster = useMemo(
    () => (isVideo ? resolveVideoPoster({ url, altText, caption }) : null),
    [isVideo, url, altText, caption]
  );

  const canTryNativeVideo =
    isVideo && mimeType !== "video/youtube" && !url.includes("youtube.com/embed");

  const [phase, setPhase] = useState<"image" | "native" | "icon">(() => {
    if (!isVideo) return "image";
    if (poster) return "image";
    if (canTryNativeVideo) return "native";
    return "icon";
  });

  const iconWrap =
    fallbackClassName ??
    "flex h-full w-full items-center justify-center bg-muted/35 text-muted-foreground";

  if (phase === "icon" && isVideo) {
    return <VideoFallback filename={filename} className={iconWrap} iconSize={iconSize} />;
  }

  if (isVideo && phase === "image" && poster) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={poster}
        alt={altText || filename}
        className={className}
        onError={() => setPhase(canTryNativeVideo ? "native" : "icon")}
      />
    );
  }

  if (isVideo && phase === "native" && canTryNativeVideo) {
    return (
      <video
        src={`${url}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        className={className}
        onError={() => setPhase("icon")}
      />
    );
  }

  if (isVideo) {
    return <VideoFallback filename={filename} className={iconWrap} iconSize={iconSize} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={altText || filename} className={className} />
  );
}
