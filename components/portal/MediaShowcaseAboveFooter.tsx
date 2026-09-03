"use client";

import { useSearchParams } from "next/navigation";
import { isEnglishHostname } from "@/lib/language";
import { PhotoFeatureSection } from "@/components/portal/PhotoFeatureSection";
import { ReelsSection } from "@/components/portal/ReelsSection";
import { PortalContainer } from "@/components/portal/SectionHeader";

/** Photo feature + Reels stacked above राशिफल in the site chrome. */
export function MediaShowcaseAboveFooter() {
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const isEnglish =
    langParam === "en" ||
    (typeof window !== "undefined" && isEnglishHostname(window.location.hostname));
  const lang = isEnglish ? "en" : "ne";

  return (
    <div className="w-full bg-white">
      <PortalContainer className="py-6">
        <PhotoFeatureSection lang={lang} />
      </PortalContainer>
      <PortalContainer className="py-6">
        <ReelsSection lang={lang} />
      </PortalContainer>
    </div>
  );
}
