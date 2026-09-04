"use client";

import { useSearchParams } from "next/navigation";
import { isEnglishHostname } from "@/lib/language";
import { SITE_CONFIG } from "@/constants/site";
import { SectionHeader, PortalContainer } from "@/components/portal/SectionHeader";
import { EpaperPdfCard, type EpaperCardItem } from "@/components/portal/EpaperPdfCard";

type EpaperSectionProps = {
  editions?: EpaperCardItem[];
};

/** Homepage PDF / E-paper grid — cover cards; click opens PDF. */
export function EpaperSection({ editions = [] }: EpaperSectionProps) {
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const isEnglish =
    langParam === "en" ||
    (typeof window !== "undefined" && isEnglishHostname(window.location.hostname));
  const langQ = isEnglish ? "?lang=en" : "";

  if (editions.length === 0) return null;

  return (
    <section className="w-full">
      <PortalContainer className="py-6 sm:py-8">
        <SectionHeader
          title={
            isEnglish
              ? `${SITE_CONFIG.name} special materials`
              : `${SITE_CONFIG.nameNp} विशेष सामग्रीहरू`
          }
          href={`/epaper${langQ}`}
          linkLabel={isEnglish ? "More" : "थप"}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {editions.map((item) => (
            <EpaperPdfCard key={item.id} item={item} />
          ))}
        </div>
      </PortalContainer>
    </section>
  );
}
