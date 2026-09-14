import type { Metadata } from "next";
import { Khand, Noto_Sans_Devanagari } from "next/font/google";
import { headers } from "next/headers";
import { SITE_CONFIG } from "@/constants/site";
import { htmlLang, resolveLanguageEdition } from "@/lib/language";
import {
  SITE_LANG_HEADER,
  getAdminSeoMetadataOverrides,
  requestHost,
} from "@/lib/seo";
import { Toaster } from "sonner";
import {
  GoogleTagManagerNoscript,
  TrackingScripts,
} from "@/components/portal/TrackingScripts";
import "./globals.css";

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
});

const khand = Khand({
  variable: "--font-khand",
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
});

const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  applicationName: SITE_CONFIG.name,
  title: {
    default: SITE_CONFIG.title,
    template: "%s",
  },
  description: SITE_CONFIG.description,
  keywords: [
    "Echo Manch",
    "नेपाल समाचार",
    "नेपाली खबर",
    "breaking news nepal",
    "nepali news",
    "politics",
    "business",
    "sports",
    "entertainment",
    "latest updates",
  ],
  alternates: {
    canonical: SITE_CONFIG.url,
    languages: {
      "ne-NP": SITE_CONFIG.url,
      en: SITE_CONFIG.englishUrl,
      "x-default": SITE_CONFIG.url,
    },
  },
  openGraph: {
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    type: "website",
    locale: "ne_NP",
    alternateLocale: ["en_US"],
    images: [
      {
        url: "/logo/logo.png",
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_CONFIG.twitter,
    creator: SITE_CONFIG.twitter,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: ["/logo/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const lang = resolveLanguageEdition(
    headerList.get(SITE_LANG_HEADER),
    requestHost(headerList)
  );
  const overrides = await getAdminSeoMetadataOverrides(lang);

  return {
    ...baseMetadata,
    ...overrides,
    openGraph: {
      ...baseMetadata.openGraph,
      ...overrides.openGraph,
      url: lang === "en" ? SITE_CONFIG.englishUrl : SITE_CONFIG.url,
    },
    twitter: {
      ...(baseMetadata.twitter as object),
      ...(overrides.twitter as object),
    } as Metadata["twitter"],
    alternates: {
      ...baseMetadata.alternates,
      canonical: lang === "en" ? SITE_CONFIG.englishUrl : SITE_CONFIG.url,
      languages: {
        "ne-NP": SITE_CONFIG.url,
        en: SITE_CONFIG.englishUrl,
        "x-default": SITE_CONFIG.url,
      },
    },
    robots: overrides.robots ?? baseMetadata.robots,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host")?.split(",")[0]?.trim() || headerList.get("host");
  const langFromHeader = headerList.get(SITE_LANG_HEADER);
  const lang = resolveLanguageEdition(langFromHeader, host);

  return (
    <html
      lang={htmlLang(lang)}
      className={`${notoSansDevanagari.variable} ${khand.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <GoogleTagManagerNoscript />
        {children}
        <Toaster richColors position="top-right" />
        <TrackingScripts />
      </body>
    </html>
  );
}
