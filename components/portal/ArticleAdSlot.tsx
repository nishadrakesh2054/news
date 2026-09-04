import { AdUnit, type AdUnitData } from "@/components/portal/AdUnit";

type ArticleAdSlotProps = {
  ad: AdUnitData | null | undefined;
  path: string;
  isEnglish: boolean;
  /** Compact for sidebar vs wider for article column */
  variant?: "inline" | "sidebar";
  className?: string;
};

/** Quiet labeled ad block for article detail (CMS-backed). */
export function ArticleAdSlot({
  ad,
  path,
  isEnglish,
  variant = "inline",
  className = "",
}: ArticleAdSlotProps) {
  if (!ad) return null;

  return (
    <div className={className}>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-gray-400">
        {isEnglish ? "Advertisement" : "विज्ञापन"}
      </p>
      <AdUnit
        ad={ad}
        path={path}
        label={isEnglish ? "Ad" : "विज्ञापन"}
        className={
          variant === "sidebar"
            ? "overflow-hidden border border-gray-200 bg-gray-50"
            : "overflow-hidden border border-gray-100 bg-gray-50"
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
