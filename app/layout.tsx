import type { Metadata } from "next";
import { Noto_Sans_Devanagari, Geist_Mono } from "next/font/google";
import "./globals.css";

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nepalkhabar.com"),
  applicationName: "नेपाल खबर",
  title: {
    default: "नेपाल खबर | Nepali News, Breaking, Politics, Business & More",
    template: "%s | नेपाल खबर",
  },
  description:
    "नेपाल खबरले राजनीति, अर्थव्यवस्था, खेलकुद, प्रान्तीय समाचार, सामाजिक, संस्कृति, विज्ञान र जीवनसाथी विषयमा ताजा समाचार, विश्लेषण र विशेष सामग्री प्रदान गर्दछ।",
  keywords: [
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
    canonical: "/",
  },
  openGraph: {
    siteName: "नेपाल खबर",
    title: "नेपाल खबर | Nepali News, Breaking, Politics, Business & More",
    description:
      "ताजा नेपाली समाचार, राजनीति, अर्थव्यवस्था, खेलकुद, सामाजिक, मानवअधिकार, प्रदेशीय र विशेष रिपोर्टहरू।",
    url: "https://nepalkhabar.com",
    type: "website",
    locale: "ne_NP",
    images: [
      {
        url: "/logo/logo.png",
        width: 1200,
        height: 630,
        alt: "नेपाल खबर",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@nepalkhabar",
    creator: "@nepalkhabar",
    title: "नेपाल खबर | Nepali News, Breaking, Politics, Business & More",
    description:
      "ताजा नेपाली समाचार, राजनीति, अर्थव्यवस्था, खेलकुद, सामाजिक, मानवअधिकार, प्रदेशीय र विशेष रिपोर्टहरू।",
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

import { SessionProvider } from "@/components/providers/SessionProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ne"
      className={`${notoSansDevanagari.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <SessionProvider>
          <QueryProvider>
            {children}
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
