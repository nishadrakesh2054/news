import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { ChevronRight } from "lucide-react";
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
  const langQ = isEnglish ? "?lang=en" : "";

  const sections: {
    title: string;
    paragraphs?: string[];
    items?: string[];
  }[] = isEnglish
    ? [
        {
          title: "Overview",
          paragraphs: [
            `This policy explains how ${SITE_CONFIG.name} (“we”, “us”) collects, uses, and protects information when you visit ${SITE_CONFIG.domain}, use our newsletter, leave comments, or otherwise interact with our digital news services.`,
            "We collect only what we need to run the site, improve reading experience, and communicate with subscribers. We do not sell personal data.",
          ],
        },
        {
          title: "Information we collect",
          items: [
            "Contact details you provide — for example an email address when you subscribe to the newsletter.",
            "Account or profile details if you register, comment, or use member features.",
            "Technical data such as browser type, device, approximate location, and pages viewed (usually via analytics tools).",
            "Cookies and similar technologies used for preferences, session state, analytics, and advertising measurement.",
            "Messages you send us (tips, corrections, partnership or privacy requests).",
          ],
        },
        {
          title: "How we use information",
          items: [
            "To publish and deliver news, newsletters, and related services.",
            "To respond to tips, corrections, and support requests.",
            "To understand which stories and features are useful, so we can improve the site.",
            "To measure advertising performance where ads are shown.",
            "To protect the newsroom, readers, and our systems against abuse or security risks.",
          ],
        },
        {
          title: "Cookies & analytics",
          paragraphs: [
            "Cookies may store language preference, session state, or help us measure traffic. Third-party analytics or ad partners may set their own cookies when their scripts load on our pages.",
            "You can block or delete cookies in your browser settings. Some features (such as staying signed in or remembering preferences) may not work fully if cookies are disabled.",
          ],
        },
        {
          title: "Sharing of information",
          paragraphs: [
            "We may share limited data with trusted service providers who help us host the site, send email, analyze traffic, or serve ads — only as needed to perform those services.",
            "We may disclose information if required by law, or to protect the rights, safety, and integrity of our readers and newsroom.",
            "We do not sell personal information to data brokers.",
          ],
        },
        {
          title: "Data retention & security",
          paragraphs: [
            "We keep personal data only as long as needed for the purposes above, or as required by law. Newsletter emails are retained until you unsubscribe or ask us to delete them.",
            "We use reasonable technical and organizational measures to protect data. No online service is completely secure; please use strong passwords where accounts exist and contact us if you suspect misuse.",
          ],
        },
        {
          title: "Your choices",
          items: [
            "Unsubscribe from newsletters using the link in any email, or contact us directly.",
            "Request access, correction, or deletion of personal data we hold about you, where applicable.",
            "Control cookies through your browser or device settings.",
            "Stop using the site at any time; optional features like comments or accounts can be closed on request where available.",
          ],
        },
        {
          title: "Children",
          paragraphs: [
            "Our services are aimed at a general audience. We do not knowingly collect personal information from children under 13. If you believe a child has provided us data, contact us and we will take appropriate steps.",
          ],
        },
        {
          title: "Updates to this policy",
          paragraphs: [
            "We may update this privacy policy from time to time. The revised version will be posted on this page with an updated date. Continued use of the site after changes means you accept the updated policy.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            `For privacy questions, data requests, or concerns, email ${SITE_CONFIG.email} or use our contact page. We will review requests and respond within a reasonable time.`,
          ],
        },
      ]
    : [
        {
          title: "सारांश",
          paragraphs: [
            `यो नीतिले ${SITE_CONFIG.nameNp} (“हामी”) ले ${SITE_CONFIG.domain} भ्रमण गर्दा, न्यूजलेटर प्रयोग गर्दा, टिप्पणी गर्दा वा अन्य डिजिटल समाचार सेवा प्रयोग गर्दा जानकारी कसरी सङ्कलन, प्रयोग र सुरक्षा गर्छ भन्ने कुरा बताउँछ।`,
            "हामी साइट सञ्चालन, पठन अनुभव सुधार र सदस्यसँग सम्पर्कका लागि आवश्यक जानकारी मात्र लिन्छौं। व्यक्तिगत जानकारी बिक्री गर्दैनौं।",
          ],
        },
        {
          title: "हामीले सङ्कलन गर्ने जानकारी",
          items: [
            "तपाईंले दिनुभएको सम्पर्क विवरण — जस्तै न्यूजलेटर सदस्यताका लागि इमेल।",
            "दर्ता, टिप्पणी वा सदस्य सुविधा प्रयोग गर्दा खाता/प्रोफाइल विवरण।",
            "ब्राउजर प्रकार, यन्त्र, अनुमानित स्थान र हेरिएका पृष्ठ जस्ता प्राविधिक जानकारी (सामान्यतया विश्लेषण उपकरणमार्फत)।",
            "प्राथमिकता, सत्र, विश्लेषण र विज्ञापन मापनका लागि कुकी तथा समान प्रविधि।",
            "तपाईंले पठाउनुभएका सन्देश (सुझाव, सच्याइ, सहकार्य वा गोपनीयता अनुरोध)।",
          ],
        },
        {
          title: "जानकारीको प्रयोग",
          items: [
            "समाचार, न्यूजलेटर र सम्बन्धित सेवा प्रवाह गर्न।",
            "सुझाव, सच्याइ र सहयोग अनुरोधको जवाफ दिन।",
            "कुन समाचार र सुविधा उपयोगी छन् बुझेर साइट सुधार गर्न।",
            "विज्ञापन देखाइएको ठाउँमा प्रदर्शन मापन गर्न।",
            "दुरुपयोग वा सुरक्षा जोखिमबाट समाचार कक्ष, पाठक र प्रणाली जोगाउन।",
          ],
        },
        {
          title: "कुकी र विश्लेषण",
          paragraphs: [
            "कुकीले भाषा प्राथमिकता, सत्र अवस्था राख्न वा ट्राफिक मापनमा मद्दत गर्न सक्छ। तेस्रो पक्षका विश्लेषण वा विज्ञापन साझेदारले आफ्नै कुकी सेट गर्न सक्छन्।",
            "ब्राउजर सेटिङबाट कुकी ब्लक वा मेटाउन सकिन्छ। कुकी अक्षम भए केही सुविधा (लगइन रहनु, प्राथमिकता सम्झिनु) पूर्ण काम नगर्न सक्छ।",
          ],
        },
        {
          title: "जानकारी साझेदारी",
          paragraphs: [
            "साइट होस्टिङ, इमेल पठाउने, ट्राफिक विश्लेषण वा विज्ञापन सेवा दिने भरपर्दो सेवा प्रदायकसँग सीमित जानकारी साझेदारी हुन सक्छ — सेवाका लागि आवश्यक हदसम्म मात्र।",
            "कानुनले मागेमा वा पाठक र समाचार कक्षको अधिकार, सुरक्षा र अखण्डता जोगाउन जानकारी खुलाउन सकिन्छ।",
            "हामी व्यक्तिगत जानकारी डाटा ब्रोकरलाई बिक्री गर्दैनौं।",
          ],
        },
        {
          title: "डाटा राख्ने अवधि र सुरक्षा",
          paragraphs: [
            "माथि उल्लेखित प्रयोजन वा कानुनी आवश्यकता पूरा नभएसम्म मात्र व्यक्तिगत डाटा राखिन्छ। न्यूजलेटर इमेल सदस्यता रद्द नभएसम्म वा मेटाउन अनुरोध नभएसम्म रहन्छ।",
            "डाटा सुरक्षाका लागि उचित प्राविधिक र संगठनात्मक उपाय अपनाउँछौं। अनलाइन सेवा पूर्ण सुरक्षित हुँदैन; खाता भए बलियो पासवर्ड प्रयोग गर्नुहोस् र दुरुपयोग शंका लागे हामीलाई जानकारी दिनुहोस्।",
          ],
        },
        {
          title: "तपाईंका विकल्पहरू",
          items: [
            "इमेलभित्रको लिंकबाट वा सिधै सम्पर्क गरी न्यूजलेटर रद्द गर्न सकिन्छ।",
            "हामीसँग रहेको व्यक्तिगत डाटा पहुँच, सच्याइ वा मेटाउन (लागू हुने हदसम्म) अनुरोध गर्न सकिन्छ।",
            "ब्राउजर वा यन्त्र सेटिङबाट कुकी नियन्त्रण गर्न सकिन्छ।",
            "जुनसुकै बेला साइट प्रयोग बन्द गर्न सकिन्छ; टिप्पणी वा खाता जस्ता वैकल्पिक सुविधा अनुरोधमा बन्द गर्न सकिन्छ।",
          ],
        },
        {
          title: "बालबालिका",
          paragraphs: [
            "हाम्रा सेवा सामान्य पाठकका लागि हुन्। १३ वर्षमुनिका बालबालिकाबाट जानाजानी व्यक्तिगत जानकारी लिँदैनौं। यदि बच्चाले जानकारी दिएको शंका लागे हामीलाई सम्पर्क गर्नुहोस् — उपयुक्त कदम चालिनेछ।",
          ],
        },
        {
          title: "नीति अद्यावधिक",
          paragraphs: [
            "यो गोपनीयता नीति बेलाबेलामा अद्यावधिक हुन सक्छ। संशोधित संस्करण यसै पृष्ठमा मितिसहित राखिन्छ। परिवर्तनपछि साइट प्रयोग जारी राख्नु भनेको अद्यावधिक नीति स्वीकार गर्नु हो।",
          ],
        },
        {
          title: "सम्पर्क",
          paragraphs: [
            `गोपनीयता प्रश्न, डाटा अनुरोध वा चिन्ताका लागि ${SITE_CONFIG.email} मा इमेल गर्नुहोस् वा सम्पर्क पृष्ठ प्रयोग गर्नुहोस्। हामी उचित समयभित्र जवाफ दिनेछौं।`,
          ],
        },
      ];

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

        <header className="max-w-3xl">
          <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl" style={{ color: PORTAL.brand }}>
            {isEnglish ? "Privacy policy" : "गोपनीयता नीति"}
          </h1>
          <p className="mt-5 text-base leading-7 text-gray-600 sm:text-[17px]">
            {isEnglish
              ? `How ${SITE_CONFIG.name} collects, uses, and protects your information when you use our news site and related services.`
              : `${SITE_CONFIG.nameNp} का समाचार साइट र सम्बन्धित सेवा प्रयोग गर्दा तपाईंको जानकारी कसरी सङ्कलन, प्रयोग र सुरक्षा गरिन्छ।`}
          </p>
          <p className="mt-2 text-xs text-gray-400">
            {isEnglish ? "Last updated: September 2026" : "अन्तिम अद्यावधिक: सेप्टेम्बर २०२६"}
          </p>
        </header>

        <div className="mt-12 max-w-3xl space-y-10 sm:mt-14 sm:space-y-11">
          {sections.map((section) => (
            <section key={section.title} className="space-y-2.5">
              <h2
                className="text-lg font-extrabold leading-snug tracking-tight sm:text-xl"
                style={{ color: PORTAL.brand }}
              >
                {section.title}
              </h2>

              {section.paragraphs ? (
                <div className="space-y-2.5 text-[15px] leading-7 text-gray-600 sm:text-base sm:leading-7">
                  {section.paragraphs.map((para) => (
                    <p key={para}>{para}</p>
                  ))}
                </div>
              ) : null}

              {section.items ? (
                <ul className="space-y-2.5">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2.5 text-[15px] leading-7 text-gray-600 sm:text-base sm:leading-7"
                    >
                      <ChevronRight
                        className="mt-1.5 h-3.5 w-3.5 shrink-0"
                        style={{ color: PORTAL.accent }}
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap gap-x-6 gap-y-3 text-sm sm:mt-16">
          <Link
            href={`/about${langQ}`}
            className="inline-flex items-center gap-1 font-bold hover:underline"
            style={{ color: PORTAL.brand }}
          >
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {isEnglish ? "About us" : "हाम्रो बारे"}
          </Link>
          <Link
            href={`/contact${langQ}`}
            className="inline-flex items-center gap-1 font-bold hover:underline"
            style={{ color: PORTAL.brand }}
          >
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {isEnglish ? "Contact" : "सम्पर्क"}
          </Link>
          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="inline-flex items-center gap-1 font-bold hover:underline"
            style={{ color: PORTAL.brand }}
          >
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {SITE_CONFIG.email}
          </a>
        </div>
      </PortalContainer>
    </main>
  );
}
