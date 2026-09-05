import { SidebarAdRotator, type RotatingAd } from "@/components/portal/SidebarAdRotator";
import { AdUnit, type AdUnitData } from "@/components/portal/AdUnit";
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

/** Quiet ad block for article/category pages — rotates only when 2+ ads. */
export function ArticleAdSlot({
  ads,
  ad,
  path,
  isEnglish,
  variant = "inline",
  className = "",
}: ArticleAdSlotProps) {
  const list = (ads && ads.length > 0 ? ads : ad ? [ad] : []).filter(
    (a) => a.isActive !== false && (a.imageUrl || a.scriptCode)
  );
  if (list.length === 0) return null;

  const imageSlot = variant === "sidebar" ? "sidebar" : "inline";
  const shellClass = "overflow-hidden bg-gray-50";
  const imageClassName =
    variant === "sidebar"
      ? "h-auto w-full object-contain"
      : "h-auto max-h-48 w-full object-contain sm:max-h-56";

  // One ad — static, no rotator / fade / slide.
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
      />
    </div>
  );
}
