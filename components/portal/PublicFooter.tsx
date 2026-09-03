"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { NewsletterSignup } from "./NewsletterSignup";
import { PushOptIn } from "./PushOptIn";
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

  useEffect(() => {
    fetch(`/api/categories${isEnglish ? "?lang=en" : ""}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data.slice(0, 8));
        }
      })
      .catch(() => {});
  }, [isEnglish]);

  return (
    <footer className="w-full select-none border-t border-slate-800 bg-slate-950 pb-6 pt-12 text-slate-300">
      <div className={`${PORTAL.container} grid grid-cols-1 gap-8 border-b border-slate-800 pb-10 md:grid-cols-4`}>
        <div className="space-y-4">
          <Link href={isEnglish ? "/?lang=en" : "/"} className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/newslogo.png"
              alt={`${SITE_CONFIG.nameNp} (${SITE_CONFIG.name})`}
              className="h-12 w-auto object-contain opacity-90 brightness-0 invert transition-opacity hover:opacity-100"
            />
          </Link>
          <p className="text-xs leading-relaxed text-slate-400">
            {isEnglish
              ? "Independent digital journalism from Nepal — news, analysis, and public-interest reporting."
              : "नेपालको विश्वसनीय डिजिटल समाचार — निष्पक्ष पत्रकारिता र सार्वजनिक हितप्रति समर्पित।"}
          </p>
          <div className="space-y-1.5 pt-1 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" style={{ color: PORTAL.brand }} />
              <span>{isEnglish ? "Registered digital publication" : "दर्ता भएको डिजिटल प्रकाशन"}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="border-b border-slate-800 pb-2 text-sm font-bold uppercase tracking-wider text-white">
            {isEnglish ? "Sections" : "वर्गहरू"}
          </h4>
          <ul className="space-y-2 text-xs font-medium">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}${langQ}`} className="hover:text-white">
                    {cat.displayName ||
                      (isEnglish ? cat.name || cat.nameNp : cat.nameNp || cat.name)}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li>
                  <Link href={`/category/politics${langQ}`} className="hover:text-white">
                    {isEnglish ? "Politics" : "राजनीति"}
                  </Link>
                </li>
                <li>
                  <Link href={`/category/economy${langQ}`} className="hover:text-white">
                    {isEnglish ? "Economy" : "अर्थतन्त्र"}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="border-b border-slate-800 pb-2 text-sm font-bold uppercase tracking-wider text-white">
            {isEnglish ? "Contact" : "सम्पर्क"}
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: PORTAL.brand }} />
              <span>Kathmandu, Nepal</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" style={{ color: PORTAL.brand }} />
              <span>{SITE_CONFIG.email}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" style={{ color: PORTAL.brand }} />
              <span>{SITE_CONFIG.domain}</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="border-b border-slate-800 pb-2 text-sm font-bold uppercase tracking-wider text-white">
            {isEnglish ? "Subscribe" : "सदस्यता"}
          </h4>
          <NewsletterSignup source="footer" />
          <PushOptIn />
        </div>
      </div>

      <div className={`${PORTAL.container} flex flex-col items-center justify-between gap-3 pt-6 text-xs text-slate-500 sm:flex-row`}>
        <p>
          © {new Date().getFullYear()} {SITE_CONFIG.name}
          {isEnglish ? ". All rights reserved." : "। सर्वाधिकार सुरक्षित।"}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href={`/editorial-team${langQ}`} className="font-semibold text-amber-400 hover:underline">
            {isEnglish ? "Editorial team" : "सम्पादकीय टोली"}
          </Link>
          <Link href={`/epaper${langQ}`} className="font-semibold text-sky-400 hover:underline">
            {isEnglish ? "E-Paper" : "इ-पत्रिका"}
          </Link>
          <Link href={`/media${langQ}`} className="hover:underline">
            {isEnglish ? "Media" : "मिडिया"}
          </Link>
          <Link href="/admin" className="hover:underline">
            {isEnglish ? "Admin" : "एडमिन"}
          </Link>
        </div>
      </div>
    </footer>
  );
}
