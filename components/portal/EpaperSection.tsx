"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { isEnglishHostname } from "@/lib/language";
import { SITE_CONFIG } from "@/constants/site";
import { SectionHeader, PortalContainer } from "@/components/portal/SectionHeader";
import { EpaperPdfCard, type EpaperCardItem } from "@/components/portal/EpaperPdfCard";

/** Homepage PDF / E-paper grid — cover cards; click opens PDF. */
export function EpaperSection() {
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const isEnglish =
    langParam === "en" ||
    (typeof window !== "undefined" && isEnglishHostname(window.location.hostname));
  const langQ = isEnglish ? "?lang=en" : "";

  const [editions, setEditions] = useState<EpaperCardItem[]>([]);

  useEffect(() => {
    fetch("/api/epaper")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setEditions(
            json.data.slice(0, 5).map(
              (ep: {
                id: string;
                title: string;
                pdfUrl: string;
                coverImage?: string | null;
              }) => ({
                id: ep.id,
                title: ep.title,
                pdfUrl: ep.pdfUrl,
                coverImage: ep.coverImage,
              })
            )
          );
        }
      })
      .catch(() => {});
  }, []);

  if (editions.length === 0) return null;

  return (
    <section
      className="w-full border-y border-gray-200"
      style={{ backgroundColor: "#f3f4f6" }}
    >
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
