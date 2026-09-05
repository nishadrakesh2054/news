import { SidebarAdRotator, type RotatingAd } from "@/components/portal/SidebarAdRotator";
import type { AdUnitData } from "@/components/portal/AdUnit";

type ArticleAdSlotProps = {
  ads?: RotatingAd[];
  /** @deprecated prefer ads */
  ad?: AdUnitData | null | undefined;
  path: string;
  isEnglish: boolean;
  variant?: "inline" | "sidebar";
  className?: string;
};

/** Quiet ad block for article/category pages — rotates multiple ordered ads. */
export function ArticleAdSlot({
  ads,
  ad,
  path,
  isEnglish,
  variant = "inline",
  className = "",
}: ArticleAdSlotProps) {
  const list = ads && ads.length > 0 ? ads : ad ? [ad] : [];
  if (list.length === 0) return null;

  return (
    <div className={className}>
      <SidebarAdRotator
        ads={list}
        isEnglish={isEnglish}
        path={path}
        showPlaceholder={false}
        className={
          variant === "sidebar"
            ? "overflow-hidden bg-gray-50"
            : "overflow-hidden bg-gray-50"
        }
        imageClassName={
          variant === "sidebar"
            ? "h-auto w-full object-cover"
            : "max-h-40 w-full object-cover sm:max-h-48"
        }
      />
    </div>
  );
}
