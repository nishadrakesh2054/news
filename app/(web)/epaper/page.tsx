import Link from "next/link";
import { headers } from "next/headers";
import { Newspaper } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { resolveLanguageEdition } from "@/lib/language";
import { getFormattedNepaliDate } from "@/lib/nepaliDate";
import { SITE_CONFIG } from "@/constants/site";
import { PORTAL } from "@/constants/portal";
import { EpaperPdfCard } from "@/components/portal/EpaperPdfCard";
import { PortalContainer, SectionHeader } from "@/components/portal/SectionHeader";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default async function PublicEPaperPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(params.lang, headerList.get("host"));
  const isEnglish = lang === "en";
  const langQ = isEnglish ? "?lang=en" : "";
  const homeHref = isEnglish ? "/?lang=en" : "/";
  const pageTitle = isEnglish ? "E-Paper" : "इ-पत्रिका";
  const sectionTitle = isEnglish
    ? `${SITE_CONFIG.name} special materials`
    : `${SITE_CONFIG.nameNp} विशेष सामग्रीहरू`;

  let epapers: Awaited<ReturnType<typeof prisma.ePaper.findMany>> = [];
  try {
    epapers = await prisma.ePaper.findMany({
      orderBy: { publishDate: "desc" },
      take: 40,
    });
  } catch {
    // Empty when DB unavailable
  }

  return (
    <main className="w-full bg-white pb-16 text-gray-900">
      <PortalContainer className="py-8 sm:py-10">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-[12px] text-gray-400">
          <Link href={homeHref} className="hover:underline" style={{ color: PORTAL.brand }}>
            {isEnglish ? "Home" : "गृह"}
          </Link>
          <span aria-hidden className="text-gray-300">
            /
          </span>
          <span className="font-medium" style={{ color: PORTAL.ink }}>
            {pageTitle}
          </span>
        </nav>

        <SectionHeader title={sectionTitle} className="mb-6" />

        {epapers.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
            {epapers.map((ep) => (
              <EpaperPdfCard
                key={ep.id}
                item={{
                  id: ep.id,
                  title: ep.title,
                  pdfUrl: ep.pdfUrl,
                  coverImage: ep.coverImage,
                }}
                caption={getFormattedNepaliDate(ep.publishDate)}
              />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <Newspaper className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <h2 className="text-base font-bold text-gray-900">
              {isEnglish ? "No PDFs yet" : "कुनै सामग्री उपलब्ध छैन"}
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {isEnglish
                ? "Upload a PDF and cover from Admin → E-Paper."
                : "एडमिन → इ-पत्रिकाबाट PDF र कभर अपलोड गर्नुहोस्।"}
            </p>
          </div>
        )}
      </PortalContainer>
    </main>
  );
}
