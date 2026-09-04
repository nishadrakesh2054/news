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
  const title = lang === "en" ? "Privacy policy" : "गोपनीयता नीति";
  return {
    title: pageTitle(title, lang),
    description:
      lang === "en"
        ? `${SITE_CONFIG.name} privacy policy.`
        : `${SITE_CONFIG.nameNp} गोपनीयता नीति।`,
    alternates: editionAlternates("/privacy", lang),
  };
}

export default async function PrivacyPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, requestHost(headerList));
  const isEnglish = lang === "en";

  return (
    <main className="w-full bg-white pb-16 text-gray-900">
      <PortalContainer className="py-8 sm:py-10">
        <nav className="mb-8 text-[12px] text-gray-400">
          <Link href={isEnglish ? "/?lang=en" : "/"} className="hover:underline" style={{ color: PORTAL.brand }}>
            {isEnglish ? "Home" : "गृह"}
          </Link>
          <span className="mx-1.5">/</span>
          <span style={{ color: PORTAL.ink }}>{isEnglish ? "Privacy" : "गोपनीयता"}</span>
        </nav>

        <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: PORTAL.brand }}>
          {isEnglish ? "Privacy policy" : "गोपनीयता नीति"}
        </h1>
        <div className="mt-6 max-w-2xl space-y-4 text-sm leading-relaxed text-gray-600">
          {isEnglish ? (
            <>
              <p>
                {SITE_CONFIG.name} collects limited personal data (such as email for newsletter
                subscriptions) to deliver news and improve the site. We do not sell personal data.
              </p>
              <p>
                Cookies and similar technologies may be used for analytics, preferences, and
                advertising measurement. You can control cookies through your browser settings.
              </p>
              <p>
                For privacy requests, contact{" "}
                <a href={`mailto:${SITE_CONFIG.email}`} className="underline" style={{ color: PORTAL.brand }}>
                  {SITE_CONFIG.email}
                </a>
                .
              </p>
            </>
          ) : (
            <>
              <p>
                {SITE_CONFIG.nameNp} ले न्यूजलेटर सदस्यता जस्ता सेवाका लागि सीमित व्यक्तिगत
                जानकारी (जस्तै इमेल) सङ्कलन गर्छ। हामी व्यक्तिगत जानकारी बिक्री गर्दैनौं।
              </p>
              <p>
                विश्लेषण, प्राथमिकता र विज्ञापन मापनका लागि कुकी तथा समान प्रविधि प्रयोग हुन
                सक्छ। ब्राउजर सेटिङबाट कुकी नियन्त्रण गर्न सकिन्छ।
              </p>
              <p>
                गोपनीयतासम्बन्धी अनुरोधका लागि{" "}
                <a href={`mailto:${SITE_CONFIG.email}`} className="underline" style={{ color: PORTAL.brand }}>
                  {SITE_CONFIG.email}
                </a>{" "}
                मा सम्पर्क गर्नुहोस्।
              </p>
            </>
          )}
        </div>
      </PortalContainer>
    </main>
  );
}
