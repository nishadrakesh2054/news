"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Mail, Phone, MapPin } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FacebookIcon, TwitterIcon, YoutubeIcon } from "./SocialIcons";
import { SITE_CONFIG } from "@/constants/site";
import { isEnglishHostname } from "@/lib/language";
import { PORTAL } from "@/constants/portal";

interface CategoryItem {
  id: string;
  name: string;
  nameNp: string | null;
  slug: string;
  displayName?: string;
}

type PublicFooterProps = {
  categories?: CategoryItem[];
};

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-2 flex items-center gap-1.5 text-[13px] font-extrabold text-white">
      <span className="inline-block h-3.5 w-0.5 shrink-0 bg-white" />
      {children}
    </h4>
  );
}

export function PublicFooter({ categories: initialCategories = [] }: PublicFooterProps) {
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const isEnglish =
    langParam === "en" ||
    (typeof window !== "undefined" && isEnglishHostname(window.location.hostname));
  const langQ = isEnglish ? "?lang=en" : "";
  const categories = initialCategories.slice(0, 6);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: "footer",
          locale: isEnglish ? "en" : "ne",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || (isEnglish ? "Subscription failed" : "सदस्यता असफल"));
      toast.success(json.message || (isEnglish ? "Subscribed" : "सदस्यता सफल भयो"));
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : isEnglish ? "Failed" : "असफल");
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    { href: `/about${langQ}`, label: isEnglish ? "About" : "हाम्रो बारे" },
    { href: `/contact${langQ}`, label: isEnglish ? "Contact" : "सम्पर्क" },
    { href: `/privacy${langQ}`, label: isEnglish ? "Privacy" : "गोपनीयता" },
    { href: `/epaper${langQ}`, label: isEnglish ? "E-Paper" : "इ-पत्रिका" },
    { href: `/media${langQ}`, label: isEnglish ? "Photo & Video" : "मिडिया" },
  ];

  const sectionLinks =
    categories.length > 0
      ? categories.map((cat) => ({
          href: `/category/${cat.slug}${langQ}`,
          label: isEnglish
            ? cat.name || cat.nameNp || cat.displayName || ""
            : cat.nameNp || cat.name || cat.displayName || "",
        }))
      : [
          {
            href: `/category/politics${langQ}`,
            label: isEnglish ? "Politics" : "राजनीति",
          },
          {
            href: `/category/economy${langQ}`,
            label: isEnglish ? "Economy" : "अर्थतन्त्र",
          },
        ];

  const linkClass =
    "group inline-flex items-center gap-0.5 text-xs text-white/75 transition-colors hover:text-white";

  return (
    <footer className="w-full select-none text-white" style={{ backgroundColor: PORTAL.brand }}>
      <div className="border-b border-white/10 bg-black/10">
        <div
          className={`${PORTAL.container} flex flex-wrap items-center justify-between gap-2 py-1.5 text-[10px] font-semibold text-white/70`}
        >
          <p>
            {isEnglish ? SITE_CONFIG.name.toUpperCase() : SITE_CONFIG.nameNp}
            <span className="mx-1.5 text-white/30">|</span>
            {isEnglish ? "Digital news from Nepal" : "नेपालको डिजिटल समाचार"}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <Link href={`/rashifal${langQ}`} className="hover:text-white">
              {isEnglish ? "Horoscope" : "राशिफल"}
            </Link>
            <Link href={`/forex${langQ}`} className="hover:text-white">
              {isEnglish ? "Forex" : "विदेशी विनिमय"}
            </Link>
            <Link href={`/gold-rate${langQ}`} className="hover:text-white">
              {isEnglish ? "Gold" : "सुन चाँदी"}
            </Link>
          </div>
        </div>
      </div>

      <div className={`${PORTAL.container} py-5 sm:py-6`}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-5">
          <div className="lg:col-span-4">
            <Link href={isEnglish ? "/?lang=en" : "/"} className="inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/newslogo.png"
                alt={isEnglish ? SITE_CONFIG.name : SITE_CONFIG.nameNp}
                className="h-11 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="mt-2.5 max-w-sm text-xs leading-5 text-white/70">
              {isEnglish
                ? "Independent digital journalism from Nepal — news, analysis, and public-interest reporting."
                : "नेपालको विश्वसनीय डिजिटल समाचार — निष्पक्ष पत्रकारिता र सार्वजनिक हितप्रति समर्पित।"}
            </p>
            <div className="mt-2.5 flex items-center gap-0.5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="inline-flex h-7 w-7 items-center justify-center text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <FacebookIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href={`https://twitter.com/${SITE_CONFIG.twitter.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
                aria-label="X / Twitter"
                className="inline-flex h-7 w-7 items-center justify-center text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <TwitterIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="inline-flex h-7 w-7 items-center justify-center text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <YoutubeIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <FooterHeading>{isEnglish ? "Sections" : "वर्गहरू"}</FooterHeading>
            <ul className="space-y-1">
              {sectionLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    <ChevronRight
                      className="h-3 w-3 shrink-0 text-white/65 transition-colors group-hover:text-white"
                      aria-hidden
                    />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <FooterHeading>{isEnglish ? "Explore" : "अन्वेषण"}</FooterHeading>
            <ul className="space-y-1">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    <ChevronRight
                      className="h-3 w-3 shrink-0 text-white/65 transition-colors group-hover:text-white"
                      aria-hidden
                    />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <FooterHeading>{isEnglish ? "Contact" : "सम्पर्क"}</FooterHeading>
            <ul className="space-y-1.5 text-xs text-white/75">
              <li className="flex items-start gap-1.5">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-white/50" />
                <span>{isEnglish ? "Kathmandu, Nepal" : "काठमाडौँ, नेपाल"}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Mail className="h-3 w-3 shrink-0 text-white/50" />
                <a href={`mailto:${SITE_CONFIG.email}`} className="hover:text-white">
                  {SITE_CONFIG.email}
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <Phone className="h-3 w-3 shrink-0 text-white/50" />
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <a href="tel:+9779800000001" className="hover:text-white">
                    +977 980-0000001
                  </a>
                  <span className="text-white/25">·</span>
                  <a href="tel:+9779800000002" className="hover:text-white">
                    +977 980-0000002
                  </a>
                </span>
              </li>
            </ul>

            <div className="mt-3">
              <p className="mb-1.5 text-[11px] font-bold text-white">
                {isEnglish ? "Get news in your inbox" : "इमेलमा समाचार पाउनुहोस्"}
              </p>
              <form onSubmit={handleSubscribe} className="flex">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isEnglish ? "Your email" : "तपाईंको इमेल"}
                  className="min-w-0 flex-1 border-0 bg-white/10 px-2.5 py-1.5 text-[11px] text-white outline-none placeholder:text-white/45 focus:bg-white/15"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="shrink-0 px-2.5 py-1.5 text-[11px] font-extrabold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: PORTAL.accent }}
                >
                  {loading ? "…" : isEnglish ? "Subscribe" : "सदस्यता"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0E3A73]">
        <div
          className={`${PORTAL.container} flex flex-col items-start justify-between gap-1.5 py-2 text-[10px] text-white/60 sm:flex-row sm:items-center`}
        >
          <p>
            © {new Date().getFullYear()} {isEnglish ? SITE_CONFIG.name : SITE_CONFIG.nameNp}
            {isEnglish ? ". All rights reserved." : "। सर्वाधिकार सुरक्षित।"}
          </p>
          <nav className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
            <Link href={`/about${langQ}`} className="hover:text-white">
              {isEnglish ? "About" : "हाम्रो बारे"}
            </Link>
            <span className="text-white/25">·</span>
            <Link href={`/privacy${langQ}`} className="hover:text-white">
              {isEnglish ? "Privacy" : "गोपनीयता"}
            </Link>
            <span className="text-white/25">·</span>
            <Link href={`/contact${langQ}`} className="hover:text-white">
              {isEnglish ? "Contact" : "सम्पर्क"}
            </Link>
            <span className="text-white/25">·</span>
            <Link href={`/epaper${langQ}`} className="hover:text-white">
              {isEnglish ? "E-Paper" : "इ-पत्रिका"}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
