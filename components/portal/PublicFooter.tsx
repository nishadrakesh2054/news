"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import { NewsletterSignup } from "./NewsletterSignup";
import { PushOptIn } from "./PushOptIn";
import { SITE_CONFIG } from "@/constants/site";

export function PublicFooter() {
  return (
    <footer className="w-full bg-slate-950 text-slate-300 border-t border-slate-800 select-none pt-12 pb-6">
      <div className="max-w-[1480px] mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
        {/* Brand & Editorial Registration Info */}
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/newslogo.png"
              alt={`${SITE_CONFIG.nameNp} (${SITE_CONFIG.name})`}
              className="h-12 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity rounded-none"
            />
          </Link>
          <p className="text-xs text-slate-400 leading-relaxed">
            नेपालको अग्रणी विश्वसनीय डिजिटल समाचार पत्रिका। निष्पक्ष पत्रकारिता र राष्ट्रिय हितप्रति समर्पित।
          </p>

          <div className="space-y-1.5 text-xs text-slate-400 pt-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-[#027081]" />
              <span>सूचना विभाग दर्ता नं.: १२३४/०८२-८३</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-[#027081]" />
              <span>प्रेस काउन्सिल दर्ता नं.: ५६७/०८२</span>
            </div>
          </div>
        </div>

        {/* Quick Category Links */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
            मुख्य समाचार वर्ग
          </h4>
          <ul className="space-y-2 text-xs font-medium">
            <li><Link href="/category/rajniti" className="hover:text-white transition-colors">राजनीति</Link></li>
            <li><Link href="/category/arthatantra" className="hover:text-white transition-colors">अर्थतन्त्र</Link></li>
            <li><Link href="/category/samaj" className="hover:text-white transition-colors">समाज</Link></li>
            <li><Link href="/category/khelkud" className="hover:text-white transition-colors">खेलकुद</Link></li>
            <li><Link href="/category/vichar" className="hover:text-white transition-colors">विचार / दृष्टिकोण</Link></li>
          </ul>
        </div>

        {/* Editorial Contact Details */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
            सम्पर्क र ठेगाना
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-400">
            <li className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-[#027081] shrink-0 mt-0.5" />
              <span>काठमाडौँ, नेपाल (Kathmandu, Nepal)</span>
            </li>
            <li className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-[#027081] shrink-0" />
              <span>+९७७ ०१-४५६७८९०</span>
            </li>
            <li className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-[#027081] shrink-0" />
              <span>{SITE_CONFIG.email}</span>
            </li>
          </ul>
        </div>

        {/* Newsletter & Push alerts */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-white border-b border-slate-800 pb-2">
            समाचार सदस्यता
          </h4>
          <NewsletterSignup source="footer" />
          <PushOptIn />
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="max-w-[1480px] mx-auto px-4 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <p>© २०८३ {SITE_CONFIG.domain}। सर्वाधिकार सुरक्षित।</p>
        <div className="flex flex-wrap items-center space-x-4">
          <Link href="/editorial-team" className="hover:underline text-amber-400 font-bold">सम्पादकीय टोली तथा दर्ता</Link>
          <Link href="/epaper" className="hover:underline text-sky-400 font-bold">इ-पत्रिका छापा संस्करण</Link>
          <Link href="/privacy" className="hover:underline">गोपनीयता नीति</Link>
          <Link href="/terms" className="hover:underline">सेवाका सर्तहरू</Link>
          <Link href="/admin" className="hover:underline text-slate-400">एडमिन</Link>
        </div>
      </div>
    </footer>
  );
}
