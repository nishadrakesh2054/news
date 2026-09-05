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

  const sections: {
    title: string;
    paragraphs?: string[];
    items?: string[];
  }[] = isEnglish
    ? [
        {
          title: "Who we are",
          paragraphs: [
            `${SITE_CONFIG.name} is an independent digital newsroom based in Kathmandu. We cover politics, the economy, society, sports, culture, and public-interest stories from across Nepal.`,
            "Our work is built for readers who want clear reporting, timely updates, and context — not noise. We publish for audiences inside Nepal and for Nepali readers abroad.",
          ],
        },
        {
          title: "What we publish",
          items: [
            "Breaking news and verified updates as events unfold.",
            "Explainers and analysis that help readers understand policy, markets, and public life.",
            "Provincial and local stories that often sit outside national headlines.",
            "Photo features, video, e-paper editions, and special materials for deeper reading.",
          ],
        },
        {
          title: "Editorial standards",
          paragraphs: [
            "We aim for accuracy, fairness, and independence. Facts are checked before publication; corrections are made when we get something wrong.",
            "Opinion pieces are labeled and kept separate from news reporting. Sponsored or partner content, when published, is clearly marked.",
            "We do not sell news judgment. Editorial decisions stay with the newsroom.",
          ],
        },
        {
          title: "Languages & editions",
          paragraphs: [
            "We publish in Nepali and English so readers can follow the same newsroom in the language they prefer.",
            "Coverage priorities stay aligned across editions: public interest first, clear writing, and reliable sourcing.",
          ],
        },
        {
          title: "Tips, corrections & contact",
          paragraphs: [
            "Have a tip, a document, or a correction? Reach the newsroom through our contact page. We treat sources carefully and take accuracy requests seriously.",
            `You can also write to ${SITE_CONFIG.email} or call the numbers listed on our contact page.`,
          ],
        },
      ]
    : [
        {
          title: "हामी को हौं",
          paragraphs: [
            `${SITE_CONFIG.nameNp} काठमाडौंमा आधारित स्वतन्त्र डिजिटल समाचार कक्ष हो। हामी राजनीति, अर्थतन्त्र, समाज, खेलकुद, संस्कृति र सार्वजनिक हितका समाचार नेपालभरबाट समेट्छौं।`,
            "हाम्रो लक्ष्य स्पष्ट, समयमै र सन्दर्भसहितको पत्रकारिता हो — शोर होइन। हामी नेपालभित्रका पाठक र विदेशमा रहेका नेपाली दुवैका लागि प्रकाशित गर्छौं।",
          ],
        },
        {
          title: "के प्रकाशित गर्छौं",
          items: [
            "घटनाक्रम अनुसार ब्रेकिङ समाचार र प्रमाणित अपडेट।",
            "नीति, बजार र सार्वजनिक जीवन बुझ्न मद्दत गर्ने विश्लेषण तथा व्याख्या।",
            "प्रदेश र स्थानीय समाचार जुन राष्ट्रिय शीर्षकमा नआउन सक्छ।",
            "फोटो फिचर, भिडियो, इ-पत्रिका र विशेष सामग्री।",
          ],
        },
        {
          title: "सम्पादकीय मापदण्ड",
          paragraphs: [
            "हामी शुद्धता, निष्पक्षता र स्वतन्त्रतामा जोड दिन्छौं। प्रकाशनअघि तथ्य जाँच हुन्छ; गल्ती भए सच्याइन्छ।",
            "विचार सामग्री छुट्टै चिन्हित हुन्छ र समाचारबाट अलग राखिन्छ। प्रायोजित वा साझेदार सामग्री स्पष्ट रूपमा जनाइन्छ।",
            "समाचारको सम्पादकीय निर्णय समाचार कक्षमै रहन्छ।",
          ],
        },
        {
          title: "भाषा र संस्करण",
          paragraphs: [
            "हामी नेपाली र अंग्रेजी दुवै संस्करणमा प्रकाशित गर्छौं ताकि पाठक आफू अनुकूल भाषामा समाचार पढ्न सकून्।",
            "दुवै संस्करणमा प्राथमिकता एउटै रहन्छ — सार्वजनिक हित, स्पष्ट लेखन र भरपर्दो स्रोत।",
          ],
        },
        {
          title: "सुझाव, सच्याइ र सम्पर्क",
          paragraphs: [
            "समाचार सुझाव, कागजात वा सच्याइका लागि सम्पर्क पृष्ठमार्फत समाचार कक्षलाई लेख्नुहोस्। स्रोतको गोपनीयता र शुद्धता हाम्रा लागि महत्त्वपूर्ण छ।",
            `${SITE_CONFIG.email} मा इमेल गर्न वा सम्पर्क पृष्ठमा दिइएका नम्बरमा फोन गर्न सकिन्छ।`,
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
          <span style={{ color: PORTAL.ink }}>{isEnglish ? "About" : "हाम्रो बारे"}</span>
        </nav>

        <header className="max-w-3xl">
          <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl" style={{ color: PORTAL.brand }}>
            {isEnglish ? `About ${SITE_CONFIG.name}` : `${SITE_CONFIG.nameNp} बारे`}
          </h1>
          <p className="mt-5 text-base leading-8 text-gray-600 sm:text-[17px] sm:leading-8">
            {isEnglish
              ? `${SITE_CONFIG.name} is an independent digital newsroom dedicated to credible journalism from Nepal — politics, economy, society, sports, and stories that matter to the public.`
              : `${SITE_CONFIG.nameNp} स्वतन्त्र डिजिटल समाचार कक्ष हो — नेपालका राजनीति, अर्थतन्त्र, समाज, खेलकुद र सार्वजनिक हितका समाचारमा केन्द्रित विश्वसनीय पत्रकारिता।`}
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
            href={`/contact${langQ}`}
            className="inline-flex items-center gap-1 font-bold hover:underline"
            style={{ color: PORTAL.brand }}
          >
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {isEnglish ? "Contact" : "सम्पर्क"}
          </Link>
          <Link
            href={`/privacy${langQ}`}
            className="inline-flex items-center gap-1 font-bold hover:underline"
            style={{ color: PORTAL.brand }}
          >
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {isEnglish ? "Privacy" : "गोपनीयता"}
          </Link>
          <Link
            href={`/epaper${langQ}`}
            className="inline-flex items-center gap-1 font-bold hover:underline"
            style={{ color: PORTAL.brand }}
          >
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {isEnglish ? "E-Paper" : "इ-पत्रिका"}
          </Link>
        </div>
      </PortalContainer>
    </main>
  );
}

