import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
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
  const title = lang === "en" ? "About us" : "हाम्रो बारे";
  return {
    title: pageTitle(title, lang),
    description:
      lang === "en"
        ? `${SITE_CONFIG.name} — independent digital journalism from Nepal.`
        : `${SITE_CONFIG.nameNp} — नेपालको विश्वसनीय डिजिटल पत्रकारिता।`,
    alternates: editionAlternates("/about", lang),
  };
}

export default async function AboutPage({ searchParams }: PageProps) {
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
          <span style={{ color: PORTAL.ink }}>{isEnglish ? "About" : "हाम्रो बारे"}</span>
        </nav>

        <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: PORTAL.brand }}>
          {isEnglish ? `About ${SITE_CONFIG.name}` : `${SITE_CONFIG.nameNp} बारे`}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
          {isEnglish
            ? `${SITE_CONFIG.name} is an independent digital newsroom covering politics, economy, society, sports, and public-interest reporting from Nepal.`
            : `${SITE_CONFIG.nameNp} स्वतन्त्र डिजिटल समाचार कक्ष हो — राजनीति, अर्थतन्त्र, समाज, खेलकुद र सार्वजनिक हितका समाचारमा केन्द्रित।`}
        </p>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
          {isEnglish
            ? "We publish in Nepali and English editions for readers across Nepal and the diaspora."
            : "हामी नेपाली र अंग्रेजी संस्करणमा नेपाल तथा प्रवासी पाठकका लागि समाचार प्रकाशित गर्छौं।"}
        </p>
        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href={`/editorial-team${langQ}`} className="font-medium hover:underline" style={{ color: PORTAL.brand }}>
            {isEnglish ? "Editorial team" : "सम्पादकीय टोली"}
          </Link>
          <Link href={`/contact${langQ}`} className="font-medium hover:underline" style={{ color: PORTAL.brand }}>
            {isEnglish ? "Contact" : "सम्पर्क"}
          </Link>
        </div>
      </PortalContainer>
    </main>
  );
}
