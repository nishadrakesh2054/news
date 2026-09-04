import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Mail, Phone, MapPin } from "lucide-react";
import { SITE_CONFIG } from "@/constants/site";
import { resolveLanguageEdition } from "@/lib/language";
import { editionAlternates, pageTitle, requestHost } from "@/lib/seo";
import { PortalContainer } from "@/components/portal/SectionHeader";
import { PORTAL } from "@/constants/portal";

type PageProps = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, requestHost(headerList));
  const title = lang === "en" ? "Contact" : "सम्पर्क";
  return {
    title: pageTitle(title, lang),
    description:
      lang === "en"
        ? `Contact ${SITE_CONFIG.name} newsroom.`
        : `${SITE_CONFIG.nameNp} समाचार कक्षसँग सम्पर्क गर्नुहोस्।`,
    alternates: editionAlternates("/contact", lang),
  };
}

export default async function ContactPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, requestHost(headerList));
  const isEnglish = lang === "en";
  const langQ = isEnglish ? "?lang=en" : "";

  return (
    <main className="w-full bg-white pb-16 text-gray-900">
      <PortalContainer className="py-8 sm:py-10">
        <nav className="mb-8 text-[12px] text-gray-400">
          <Link href={isEnglish ? "/?lang=en" : "/"} className="hover:underline" style={{ color: PORTAL.brand }}>
            {isEnglish ? "Home" : "गृह"}
          </Link>
          <span className="mx-1.5">/</span>
          <span style={{ color: PORTAL.ink }}>{isEnglish ? "Contact" : "सम्पर्क"}</span>
        </nav>

        <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: PORTAL.brand }}>
          {isEnglish ? "Contact us" : "सम्पर्क गर्नुहोस्"}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-gray-600">
          {isEnglish
            ? "Reach the newsroom for tips, corrections, and partnership inquiries."
            : "समाचार सुझाव, सच्याइ र सहकार्यका लागि हामीलाई सम्पर्क गर्नुहोस्।"}
        </p>

        <ul className="mt-8 max-w-md space-y-4 text-sm">
          <li className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0" style={{ color: PORTAL.accent }} />
            <a href={`mailto:${SITE_CONFIG.email}`} className="hover:underline" style={{ color: PORTAL.brand }}>
              {SITE_CONFIG.email}
            </a>
          </li>
          <li className="flex items-start gap-3">
            <Phone className="mt-0.5 h-4 w-4 shrink-0" style={{ color: PORTAL.accent }} />
            <span>+977-1-4000000</span>
          </li>
          <li className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: PORTAL.accent }} />
            <span>{isEnglish ? "Kathmandu, Nepal" : "काठमाडौँ, नेपाल"}</span>
          </li>
        </ul>

        <p className="mt-8 text-sm">
          <Link href={`/editorial-team${langQ}`} className="font-medium hover:underline" style={{ color: PORTAL.brand }}>
            {isEnglish ? "View editorial team →" : "सम्पादकीय टोली हेर्नुहोस् →"}
          </Link>
        </p>
      </PortalContainer>
    </main>
  );
}
