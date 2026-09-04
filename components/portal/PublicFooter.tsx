"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
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

export function PublicFooter() {
  const searchParams = useSearchParams();
  const langParam = searchParams.get("lang");
  const isEnglish =
    langParam === "en" ||
    (typeof window !== "undefined" && isEnglishHostname(window.location.hostname));
  const langQ = isEnglish ? "?lang=en" : "";
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/categories${isEnglish ? "?lang=en" : ""}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data.slice(0, 6));
        }
      })
      .catch(() => {});
  }, [isEnglish]);

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
      if (!res.ok) throw new Error(json.error || "Subscription failed");
      toast.success(json.message || (isEnglish ? "Subscribed" : "सदस्यता सफल भयो"));
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    { href: `/editorial-team${langQ}`, label: isEnglish ? "Editorial team" : "सम्पादकीय टोली" },
    { href: `/epaper${langQ}`, label: isEnglish ? "E-Paper" : "इ-पत्रिका" },
    { href: `/media${langQ}`, label: isEnglish ? "Photo & Video" : "मिडिया" },
    { href: `/search${langQ}`, label: isEnglish ? "Search" : "खोज" },
    { href: `/unicode${langQ}`, label: isEnglish ? "Unicode tools" : "युनिकोड" },
  ];

  const linkClass = "text-white/80 transition-colors hover:text-white";

  return (
    <footer className="w-full select-none text-white" style={{ backgroundColor: PORTAL.brand }}>
      <div className="h-1 w-full" style={{ backgroundColor: PORTAL.accent }} />

      <div className={`${PORTAL.container} py-12`}>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-4 lg:col-span-4">
            <Link href={isEnglish ? "/?lang=en" : "/"} className="inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/newslogo.png"
                alt={`${SITE_CONFIG.nameNp} (${SITE_CONFIG.name})`}
                className="h-11 w-auto object-contain brightness-0 invert opacity-95 transition-opacity hover:opacity-100"
              />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-white/75">
              {isEnglish
                ? "Independent digital journalism from Nepal — news, analysis, and public-interest reporting."
                : "नेपालको विश्वसनीय डिजिटल समाचार — निष्पक्ष पत्रकारिता र सार्वजनिक हितप्रति समर्पित।"}
            </p>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <ShieldCheck className="h-4 w-4 shrink-0 text-white" />
              <span>{isEnglish ? "Registered digital publication" : "दर्ता भएको डिजिटल प्रकाशन"}</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="inline-flex h-9 w-9 items-center justify-center border border-white/25 text-white/85 transition-colors hover:border-white/60 hover:bg-white/10 hover:text-white"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href={`https://twitter.com/${SITE_CONFIG.twitter.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
                aria-label="X / Twitter"
                className="inline-flex h-9 w-9 items-center justify-center border border-white/25 text-white/85 transition-colors hover:border-white/60 hover:bg-white/10 hover:text-white"
              >
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="inline-flex h-9 w-9 items-center justify-center border border-white/25 text-white/85 transition-colors hover:border-white/60 hover:bg-white/10 hover:text-white"
              >
                <YoutubeIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-white">
              {isEnglish ? "Sections" : "वर्गहरू"}
            </h4>
            <div className="h-px w-10 bg-white/40" />
            <ul className="space-y-2.5 text-sm">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/category/${cat.slug}${langQ}`} className={linkClass}>
                      {cat.displayName ||
                        (isEnglish ? cat.name || cat.nameNp : cat.nameNp || cat.name)}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href={`/category/politics${langQ}`} className={linkClass}>
                      {isEnglish ? "Politics" : "राजनीति"}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/category/economy${langQ}`} className={linkClass}>
                      {isEnglish ? "Economy" : "अर्थतन्त्र"}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="space-y-4 lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-white">
              {isEnglish ? "Explore" : "अन्वेषण"}
            </h4>
            <div className="h-px w-10 bg-white/40" />
            <ul className="space-y-2.5 text-sm">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-white">
              {isEnglish ? "Contact" : "सम्पर्क"}
            </h4>
            <div className="h-px w-10 bg-white/40" />
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                <span>Kathmandu, Nepal</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-white" />
                <a href={`mailto:${SITE_CONFIG.email}`} className="hover:text-white">
                  {SITE_CONFIG.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-white" />
                <span>{SITE_CONFIG.domain}</span>
              </li>
            </ul>

            <div className="space-y-2 border-t border-white/15 pt-4">
              <p className="text-xs font-bold text-white">
                {isEnglish ? "Newsletter" : "न्यूजलेटर"}
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isEnglish ? "Email" : "इमेल"}
                  className="min-w-0 flex-1 border border-white/25 bg-white/10 px-2.5 py-2 text-xs text-white outline-none placeholder:text-white/50 focus:border-white/50"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="shrink-0 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                  style={{ backgroundColor: PORTAL.accent }}
                >
                  {loading ? "…" : isEnglish ? "Join" : "सदस्यता"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15 bg-black/15">
        <div
          className={`${PORTAL.container} flex flex-col items-center justify-between gap-3 py-4 text-xs text-white/70 sm:flex-row`}
        >
          <p>
            © {new Date().getFullYear()} {isEnglish ? SITE_CONFIG.name : SITE_CONFIG.nameNp}
            {isEnglish ? ". All rights reserved." : "। सर्वाधिकार सुरक्षित।"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href={`/editorial-team${langQ}`} className="hover:text-white">
              {isEnglish ? "Editorial" : "सम्पादकीय"}
            </Link>
            <Link href={`/epaper${langQ}`} className="hover:text-white">
              {isEnglish ? "E-Paper" : "इ-पत्रिका"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
