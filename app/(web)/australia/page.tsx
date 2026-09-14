import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import {
  resolveLanguageEdition,
  resolveArticleTitle,
} from "@/lib/language";
import { formatTimeAgo } from "@/lib/nepaliDate";
import { editionAlternates, pageTitle, requestHost } from "@/lib/seo";
import { PortalContainer, SectionHeader } from "@/components/portal/SectionHeader";
import { PORTAL } from "@/constants/portal";
import {
  AU_REGIONS,
  resolveAuRegionName,
} from "@/constants/australia-regions";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";
import { PortalImage } from "@/components/portal/PortalImage";
import { getCachedAustraliaIndex } from "@/lib/public-cache";

interface AustraliaIndexProps {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({
  searchParams,
}: AustraliaIndexProps): Promise<Metadata> {
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, requestHost(headerList));
  const title = lang === "en" ? "Australia News" : "अष्ट्रेलिया समाचार";
  return {
    title: pageTitle(title, lang),
    description:
      lang === "en"
        ? "Latest news from Australian states and territories."
        : "अष्ट्रेलियाका राज्य र टेरिटोरीबाट ताजा समाचार।",
    alternates: editionAlternates("/australia", lang),
    openGraph: {
      title: pageTitle(title, lang),
      description:
        lang === "en"
          ? "Latest news from Australian states and territories."
          : "अष्ट्रेलियाका राज्य र टेरिटोरीबाट ताजा समाचार।",
      type: "website",
      images: [{ url: "/logo/logo.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle(title, lang),
      images: ["/logo/logo.png"],
    },
  };
}

export const revalidate = 60;

export default async function AustraliaIndexPage({ searchParams }: AustraliaIndexProps) {
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, requestHost(headerList));
  const isEnglish = lang === "en";
  const langQ = isEnglish ? "?lang=en" : "";

  const articles = await getCachedAustraliaIndex(lang);

  return (
    <main className="w-full bg-white pb-16 pt-6 text-gray-900">
      <PortalContainer className="space-y-6">
        <SectionHeader
          title={isEnglish ? "Australia News" : "अष्ट्रेलिया समाचार"}
          href={isEnglish ? "/?lang=en" : "/"}
          linkLabel={isEnglish ? "Home" : "गृह"}
        />

        <div className="flex flex-wrap gap-1.5">
          {AU_REGIONS.map((region) => (
            <Link
              key={region.code}
              href={`/australia/${region.slug}${langQ}`}
              className="px-2.5 py-1.5 text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {isEnglish ? region.short : resolveAuRegionName(region, "ne")}
            </Link>
          ))}
        </div>

        {articles.length === 0 ? (
          <p className="border border-dashed border-gray-300 px-4 py-12 text-center text-sm text-gray-500">
            {isEnglish ? "No Australia news yet." : "अष्ट्रेलिया समाचार उपलब्ध छैन।"}
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {articles.map((art) => {
              const title = resolveArticleTitle(art, lang);
              const thumb =
                optimizeCloudinaryUrl(art.coverImage || undefined, "thumbnail") || art.coverImage;
              const region = AU_REGIONS.find((r) => r.code === art.auRegion);
              return (
                <li key={art.id}>
                  <Link
                    href={`/article/${art.slug}${langQ}`}
                    className="group flex gap-4 py-4"
                  >
                    {thumb ? (
                      <div className="relative h-16 w-24 shrink-0 overflow-hidden bg-gray-100">
                        <PortalImage
                          src={thumb}
                          alt={title}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      {region ? (
                        <span className="text-[10px] font-bold uppercase" style={{ color: PORTAL.accent }}>
                          {region.short}
                        </span>
                      ) : null}
                      <h2 className="text-sm font-bold leading-snug group-hover:underline sm:text-[15px]">
                        {title}
                      </h2>
                      <span className="mt-1 block text-[12px] text-gray-400">
                        {formatTimeAgo(art.createdAt, lang)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </PortalContainer>
    </main>
  );
}
