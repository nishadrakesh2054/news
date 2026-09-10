import { SidebarAdRotator, type RotatingAd } from "@/components/portal/SidebarAdRotator";
import { AdUnit, type AdUnitData } from "@/components/portal/AdUnit";
import { AdImpressionBeacon } from "@/components/portal/AdImpressionBeacon";
import { optimizeAdImageUrl } from "@/lib/cloudinary-url";

type ArticleAdSlotProps = {
  ads?: RotatingAd[];
  /** @deprecated prefer ads */
  ad?: AdUnitData | null | undefined;
  path: string;
  isEnglish: boolean;
  variant?: "inline" | "sidebar";
  className?: string;
};

/** Quiet ad block — 1 image ad is static SSR (no rotator / fade). */
export function ArticleAdSlot({
  ads,
  ad,
  path,
  isEnglish,
  variant = "inline",
  className = "",
}: ArticleAdSlotProps) {
  const raw: RotatingAd[] =
    ads && ads.length > 0 ? ads : ad ? [{ ...ad, isActive: true }] : [];
  const list = raw
    .filter((a) => a.isActive !== false && (a.imageUrl || a.scriptCode))
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  if (list.length === 0) return null;

  const imageSlot = variant === "sidebar" ? "sidebar" : "inline";
  const shellClass = "overflow-hidden bg-gray-50";
  const imageClassName =
    variant === "sidebar"
      ? "h-auto w-full object-contain"
      : "h-auto max-h-48 w-full object-contain sm:max-h-56";

  // One image ad — server HTML immediately, no client rotator / animation.
  if (list.length === 1 && list[0].imageUrl && !list[0].scriptCode?.trim()) {
    const only = list[0];
    const src = optimizeAdImageUrl(only.imageUrl, imageSlot) || only.imageUrl;
    const clickHref = `/api/ads/${only.id}/click${path ? `?path=${encodeURIComponent(path)}` : ""}`;

    return (
      <div className={className}>
        <div className={`relative ${shellClass}`}>
          <AdImpressionBeacon adId={only.id} path={path} />
          <a href={clickHref} target="_blank" rel="noreferrer" className="block h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src!}
              alt={only.title}
              className={imageClassName}
              loading="eager"
              decoding="async"
              fetchPriority="low"
            />
          </a>
        </div>
      </div>
    );
  }

  if (list.length === 1) {
    const only = list[0];
    return (
      <div className={className}>
        <AdUnit
          ad={{
            ...only,
            imageUrl: only.imageUrl
              ? optimizeAdImageUrl(only.imageUrl, imageSlot)
              : only.imageUrl,
          }}
          path={path}
          className={shellClass}
          imageClassName={imageClassName}
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <SidebarAdRotator
        ads={list}
        isEnglish={isEnglish}
        path={path}
        showPlaceholder={false}
        imageSlot={imageSlot}
        className={shellClass}
        imageClassName={imageClassName}
        intervalMs={5000}
        fadeMs={280}
      />
    </div>
  );
}
