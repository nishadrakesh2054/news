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
import { getEnglishSiteUrl, getSiteUrl } from "@/lib/site-url";
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

const siteUrl = getSiteUrl();
const englishUrl = getEnglishSiteUrl();

const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: SITE_CONFIG.name,
  title: {
    default: SITE_CONFIG.titleNp,
    template: "%s",
  },
  description: SITE_CONFIG.descriptionNp,
  keywords: [
    "Echo Manch",
    "इको माञ्च",
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
    canonical: siteUrl,
    languages: {
      "ne-NP": siteUrl,
      en: englishUrl,
      "x-default": siteUrl,
    },
  },
  openGraph: {
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.titleNp,
    description: SITE_CONFIG.descriptionNp,
    url: siteUrl,
    type: "website",
    locale: "ne_NP",
    alternateLocale: ["en_US"],
    images: [
      {
        url: SITE_CONFIG.ogImagePath,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.nameNp,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SITE_CONFIG.twitter,
    creator: SITE_CONFIG.twitter,
    title: SITE_CONFIG.titleNp,
    description: SITE_CONFIG.descriptionNp,
    images: [SITE_CONFIG.ogImagePath],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
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
  const canonical = lang === "en" ? englishUrl : siteUrl;
  const brand = lang === "en" ? SITE_CONFIG.name : SITE_CONFIG.nameNp;

  return {
    ...baseMetadata,
    ...overrides,
    openGraph: {
      ...baseMetadata.openGraph,
      ...overrides.openGraph,
      url: canonical,
      siteName: brand,
    },
    twitter: {
      ...(baseMetadata.twitter as object),
      ...(overrides.twitter as object),
    } as Metadata["twitter"],
    alternates: {
      ...baseMetadata.alternates,
      canonical,
      languages: {
        "ne-NP": siteUrl,
        en: englishUrl,
        "x-default": siteUrl,
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
