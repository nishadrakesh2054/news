"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  CalendarDays,
  Camera,
  Coins,
  DollarSign,
  Film,
  Globe2,
  HeartPulse,
  Landmark,
  Leaf,
  MapPinned,
  MessageCircle,
  Newspaper,
  Sparkles,
  Trophy,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { PORTAL } from "@/constants/portal";
import { SITE_CONFIG } from "@/constants/site";

type CategoryItem = {
  id: string;
  name: string;
  nameNp: string | null;
  slug: string;
  displayName?: string;
};

type CategorySideDrawerProps = {
  open: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  isEnglish: boolean;
  langQuery: string;
  /** Switch language edition (same pattern as header EN/ने) */
  onToggleLanguage?: () => void;
};

type DrawerLink = {
  key: string;
  href: string;
  label: string;
  icon: LucideIcon;
  color: string;
  badge?: boolean;
  active: boolean;
};

const CATEGORY_META: Record<string, { icon: LucideIcon; color: string }> = {
  politics: { icon: Landmark, color: "#0D9488" },
  economy: { icon: Briefcase, color: "#7C3AED" },
  society: { icon: Users, color: "#2563EB" },
  sports: { icon: Trophy, color: "#65A30D" },
  entertainment: { icon: Film, color: "#6D28D9" },
  opinion: { icon: MessageCircle, color: "#0891B2" },
  technology: { icon: Globe2, color: "#0284C7" },
  world: { icon: Globe2, color: "#0369A1" },
  lifestyle: { icon: Leaf, color: "#16A34A" },
  health: { icon: HeartPulse, color: "#DC2626" },
};

function metaForSlug(slug: string): { icon: LucideIcon; color: string } {
  return CATEGORY_META[slug] ?? { icon: Newspaper, color: PORTAL.brand };
}

/**
 * OnlineKhabar-style right side drawer — categories + utility pages.
 * Full-height slide-over; safe on mobile (never overflows viewport).
 */
export function CategorySideDrawer({
  open,
  onClose,
  categories,
  isEnglish,
  langQuery,
  onToggleLanguage,
}: CategorySideDrawerProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const categoryLinks: DrawerLink[] = categories.map((cat) => {
    const { icon, color } = metaForSlug(cat.slug);
    const label = isEnglish
      ? cat.name || cat.nameNp || cat.displayName || cat.slug
      : cat.nameNp || cat.name || cat.displayName || cat.slug;
    return {
      key: cat.id,
      href: `/category/${cat.slug}${langQuery}`,
      label: label || cat.slug,
      icon,
      color,
      active: pathname === `/category/${cat.slug}`,
    };
  });

  const pageLinks: DrawerLink[] = [
    {
      key: "australia",
      href: `/australia${langQuery}`,
      label: isEnglish ? "Australia News" : "अष्ट्रेलिया समाचार",
      icon: MapPinned,
      color: "#EA580C",
      badge: true,
      active: pathname.startsWith("/australia"),
    },
    {
      key: "media",
      href: `/media${langQuery}`,
      label: isEnglish ? "Reels" : "रिल्स",
      icon: Film,
      color: "#E11D48",
      badge: true,
      active: pathname === "/media",
    },
    {
      key: "rashifal",
      href: `/rashifal${langQuery}`,
      label: isEnglish ? "Horoscope" : "राशिफल",
      icon: Sparkles,
      color: "#F59E0B",
      badge: true,
      active: pathname.startsWith("/rashifal"),
    },
    {
      key: "forex",
      href: `/forex${langQuery}`,
      label: isEnglish ? "Forex" : "मुद्रा दर",
      icon: DollarSign,
      color: "#059669",
      active: pathname === "/forex",
    },
    {
      key: "gold",
      href: `/gold-rate${langQuery}`,
      label: isEnglish ? "Gold & silver" : "सुन–चाँदी",
      icon: Coins,
      color: "#CA8A04",
      active: pathname === "/gold-rate",
    },
    {
      key: "bs-date",
      href: `/bs-date-converter${langQuery}`,
      label: isEnglish ? "Date converter" : "मिति रूपान्तरण",
      icon: CalendarDays,
      color: "#9333EA",
      active: pathname === "/bs-date-converter",
    },
    {
      key: "galleries",
      href: `/galleries${langQuery}`,
      label: isEnglish ? "Photo gallery" : "फोटो ग्यालेरी",
      icon: Camera,
      color: "#DB2777",
      active: pathname.startsWith("/galler"),
    },
  ];

  const homeActive = pathname === "/";

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label={isEnglish ? "Menu" : "मेनु"}>
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={isEnglish ? "Close menu" : "मेनु बन्द गर्नुहोस्"}
        onClick={onClose}
      />

      <div
        className="absolute inset-y-0 right-0 flex w-full max-w-[min(100vw,20rem)] flex-col bg-[#F4F6F8] shadow-xl sm:max-w-[20rem]"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 px-3 pt-3 pb-1">
          <Link
            href={`/${langQuery}`}
            onClick={onClose}
            className="inline-flex h-9 items-center"
            aria-label={isEnglish ? SITE_CONFIG.name : SITE_CONFIG.nameNp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo/logo.png"
              alt={isEnglish ? SITE_CONFIG.name : SITE_CONFIG.nameNp}
              className="h-7 w-auto max-w-[8.5rem] object-contain object-left"
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
            style={{ color: PORTAL.brand }}
            aria-label={isEnglish ? "Close" : "बन्द गर्नुहोस्"}
          >
            <X className="h-5 w-5" strokeWidth={2.25} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3">
          {categoryLinks.map((item) => (
            <DrawerRow key={item.key} item={item} onClose={onClose} />
          ))}

          <div className="mx-2 my-1.5 border-t border-neutral-200/80" />

          {pageLinks.map((item) => (
            <DrawerRow key={item.key} item={item} onClose={onClose} />
          ))}
        </nav>

        {onToggleLanguage ? (
          <div className="shrink-0 border-t border-neutral-200 px-4 py-3">
            <button
              type="button"
              onClick={() => {
                onToggleLanguage();
                onClose();
              }}
              className="text-[13px] font-medium text-neutral-500 underline-offset-2 hover:text-neutral-800 hover:underline"
            >
              {isEnglish ? "नेपाली संस्करण" : "English edition"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DrawerRow({ item, onClose }: { item: DrawerLink; onClose: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors hover:bg-white"
    >
      <span
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: item.color }}
        aria-hidden
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
      <span
        className={`min-w-0 flex-1 truncate text-[14px] font-medium leading-snug ${
          item.active ? "" : "text-neutral-700"
        }`}
        style={item.active ? { color: PORTAL.brand } : undefined}
      >
        {item.label}
      </span>
      {item.badge ? (
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-white uppercase"
          style={{ backgroundColor: PORTAL.accent }}
        >
          New
        </span>
      ) : null}
    </Link>
  );
}
