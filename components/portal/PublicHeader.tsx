"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  ChevronRight,
  Coins,
  DollarSign,
  Globe,
  Home,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { FacebookIcon, TwitterIcon, YoutubeIcon } from "./SocialIcons";
import { getFormattedNepaliDate } from "@/lib/nepaliDate";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  HeaderLeaderboardRotator,
  type LeaderboardAd,
} from "@/components/portal/HeaderLeaderboardRotator";
import { TopbarUtilitiesMenu } from "@/components/portal/TopbarUtilitiesMenu";
import { SITE_CONFIG } from "@/constants/site";
import { editionPathHref } from "@/lib/site-url";
import { isEnglishHostname } from "@/lib/language";
import { PORTAL } from "@/constants/portal";

type CategoryItem = {
  id: string;
  name: string;
  nameNp: string | null;
  slug: string;
  displayName?: string;
};

type PublicHeaderProps = {
  leaderboardAds?: LeaderboardAd[];
  /** @deprecated use leaderboardAds */
  leaderboardAd?: LeaderboardAd | null;
  categories?: CategoryItem[];
};

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-[14px] w-[22px]" aria-hidden>
      <span
        className={`absolute left-0 top-0 h-[2.5px] w-full rounded-full bg-current transition-all duration-200 ${
          open ? "translate-y-[5.75px] rotate-45" : ""
        }`}
      />
      <span
        className={`absolute left-1/2 top-[5.75px] h-[2.5px] w-[60%] -translate-x-1/2 rounded-full bg-current transition-all duration-150 ${
          open ? "opacity-0 scale-x-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 bottom-0 h-[2.5px] w-full rounded-full bg-current transition-all duration-200 ${
          open ? "-translate-y-[5.75px] -rotate-45" : ""
        }`}
      />
    </span>
  );
}

export function PublicHeader({
  leaderboardAds,
  leaderboardAd = null,
  categories = [],
}: PublicHeaderProps) {
  const [nepaliDateStr] = useState(() => getFormattedNepaliDate());
  const [englishDateStr] = useState(() =>
    new Date().toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobilePinned, setMobilePinned] = useState(false);
  const [mobileBarHeight, setMobileBarHeight] = useState(60);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileDateRef = useRef<HTMLDivElement>(null);
  const mobileBarRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const langParam = searchParams.get("lang");
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const isEnglish = langParam === "en" || isEnglishHostname(hostname);
  const langQuery = isEnglish ? "?lang=en" : "";

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Pin mobile logo bar after the date strip scrolls away (sticky fails inside short <header>).
  useEffect(() => {
    const sync = () => {
      const dateH = mobileDateRef.current?.offsetHeight ?? 0;
      const barH = mobileBarRef.current?.offsetHeight;
      if (barH && barH > 0) setMobileBarHeight(barH);
      setMobilePinned(window.scrollY >= dateH);
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [searchOpen, menuOpen]);

  const toggleLanguage = () => {
    const target = isEnglish ? "ne" : "en";
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lang");
    const qs = params.toString();
    const path = qs ? `${pathname}?${qs}` : pathname;
    const href = editionPathHref(path, target, hostname);
    if (href.startsWith("http")) {
      window.location.href = href;
      return;
    }
    router.push(href);
  };

  const homeHref = isEnglish ? "/?lang=en" : "/";
  const ads =
    leaderboardAds && leaderboardAds.length > 0
      ? leaderboardAds
      : leaderboardAd
        ? [leaderboardAd]
        : [];

  const closeMenu = () => setMenuOpen(false);

  const toggleMenu = () => {
    setSearchOpen(false);
    setMenuOpen((v) => !v);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(
      `/search?q=${encodeURIComponent(searchQuery.trim())}${isEnglish ? "&lang=en" : ""}`
    );
    setSearchOpen(false);
    setSearchQuery("");
    setMenuOpen(false);
  };

  const dateLabel = isEnglish ? englishDateStr : nepaliDateStr || "नेपाली मिति";

  const renderNavMenu = () =>
    menuOpen ? (
      <div
        className="absolute inset-x-0 top-full z-50 border-b border-white/10 text-white shadow-lg"
        style={{ backgroundColor: PORTAL.brand }}
      >
        <div className="flex max-h-[70vh] flex-col overflow-y-auto">
          <Link
            href={homeHref}
            onClick={closeMenu}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold ${
              pathname === "/" ? "bg-black/15" : "hover:bg-black/10"
            }`}
          >
            <Home className="h-4 w-4" />
            {isEnglish ? "Home" : "गृह"}
          </Link>
          {categories.map((cat) => {
            const label = isEnglish
              ? cat.name || cat.nameNp || cat.displayName
              : cat.nameNp || cat.name || cat.displayName;
            const active = pathname === `/category/${cat.slug}`;
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}${langQuery}`}
                onClick={closeMenu}
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold ${
                  active ? "bg-black/15" : "hover:bg-black/10"
                }`}
              >
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/60" aria-hidden />
                {label}
              </Link>
            );
          })}
          <Link
            href={`/epaper${langQuery}`}
            onClick={closeMenu}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold ${
              pathname === "/epaper" ? "bg-black/15" : "hover:bg-black/10"
            }`}
          >
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/60" aria-hidden />
            {isEnglish ? "E-Paper" : "इ-पत्रिका"}
          </Link>

          <div className="border-t border-white/15 px-4 py-2">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-white/50">
              {isEnglish ? "Utilities" : "उपयोगी"}
            </p>
            <Link
              href={`/forex${langQuery}`}
              onClick={closeMenu}
              className="inline-flex w-full items-center gap-2 py-2 text-sm font-semibold hover:bg-black/10"
            >
              <DollarSign className="h-3.5 w-3.5 opacity-70" />
              {isEnglish ? "Forex" : "मुद्रा दर"}
            </Link>
            <Link
              href={`/gold-rate${langQuery}`}
              onClick={closeMenu}
              className="inline-flex w-full items-center gap-2 py-2 text-sm font-semibold hover:bg-black/10"
            >
              <Coins className="h-3.5 w-3.5 opacity-70" />
              {isEnglish ? "Gold & silver" : "सुन–चाँदी"}
            </Link>
            <Link
              href={`/rashifal${langQuery}`}
              onClick={closeMenu}
              className="inline-flex w-full items-center gap-2 py-2 text-sm font-semibold hover:bg-black/10"
            >
              <Sparkles className="h-3.5 w-3.5 opacity-70" />
              {isEnglish ? "Horoscope" : "राशिफल"}
            </Link>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      {/* Mobile date strip — scrolls away */}
      <div
        ref={mobileDateRef}
        className={`${PORTAL.container} flex items-center justify-between gap-2 py-1.5 text-[10px] font-semibold text-white sm:hidden`}
        style={{ backgroundColor: PORTAL.brand }}
      >
        <span className="inline-flex min-w-0 items-center gap-1 truncate">
          <Calendar className="h-3 w-3 shrink-0 opacity-90" />
          {dateLabel}
        </span>
        <button
          type="button"
          onClick={toggleLanguage}
          className="inline-flex shrink-0 items-center gap-0.5 bg-white px-1.5 py-0.5 text-[10px] font-bold"
          style={{ color: PORTAL.brand }}
          aria-label={isEnglish ? "Switch to Nepali" : "Switch to English"}
        >
          <Globe className="h-3 w-3" />
          {isEnglish ? "ने" : "EN"}
        </button>
      </div>

      {/* Spacer when bar is fixed so layout doesn’t jump */}
      {mobilePinned ? (
        <div className="sm:hidden" style={{ height: mobileBarHeight }} aria-hidden />
      ) : null}

      {/* Mobile: hamburger | logo | search — pins to top on scroll */}
      <div
        ref={mobileBarRef}
        className={`z-50 border-b border-gray-100 bg-white sm:hidden ${
          mobilePinned ? "fixed inset-x-0 top-0 shadow-sm" : "relative"
        }`}
      >
        <div className={`${PORTAL.container} relative py-2.5`}>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={toggleMenu}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center"
              style={{ color: PORTAL.brand }}
              aria-expanded={menuOpen}
              aria-label={isEnglish ? "Open menu" : "मेनु खोल्नुहोस्"}
            >
              <HamburgerIcon open={menuOpen} />
            </button>

            <Link href={homeHref} className="flex min-w-0 flex-1 items-center justify-center overflow-hidden px-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/newslogo.png"
                alt={isEnglish ? SITE_CONFIG.name : SITE_CONFIG.nameNp}
                width={240}
                height={72}
                fetchPriority="high"
                decoding="async"
                className="h-11 w-auto max-w-[13rem] object-contain"
              />
            </Link>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen((v) => !v);
              }}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center"
              style={{ color: PORTAL.brand }}
              aria-label={isEnglish ? "Search" : "खोज"}
              aria-expanded={searchOpen}
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
          </div>

          {searchOpen ? (
            <form onSubmit={handleSearch} className="mt-2 flex items-center border border-gray-200 bg-white">
              <Search className="ml-2.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
              <input
                ref={searchInputRef}
                type="search"
                placeholder={isEnglish ? "Search…" : "खोज्नुहोस्…"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
              />
              <button
                type="submit"
                className="shrink-0 px-3 py-2 text-xs font-bold text-white"
                style={{ backgroundColor: PORTAL.brand }}
              >
                {isEnglish ? "Go" : "खोज"}
              </button>
            </form>
          ) : null}
        </div>

        {renderNavMenu()}
      </div>

      <header className="hidden w-full select-none bg-white sm:block">
        {/* Desktop / tablet top utility bar */}
        <div
          className="py-1.5 text-xs font-medium text-white"
          style={{ backgroundColor: PORTAL.brand }}
        >
          <div className={`${PORTAL.container} flex flex-row items-center justify-between gap-3`}>
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <Calendar className="h-3.5 w-3.5" />
              {dateLabel}
            </span>

            <div className="flex items-center gap-2 sm:gap-3">
              <TopbarUtilitiesMenu isEnglish={isEnglish} />
              <button
                type="button"
                onClick={toggleLanguage}
                className="inline-flex items-center gap-1 bg-white px-2 py-0.5 text-[11px] font-bold"
                style={{ color: PORTAL.brand }}
              >
                <Globe className="h-3 w-3" />
                {isEnglish ? "नेपाली" : "English"}
              </button>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="text-white hover:opacity-80"
                title="Facebook"
              >
                <FacebookIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="text-white hover:opacity-80"
                title="X"
              >
                <TwitterIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="text-white hover:opacity-80"
                title="YouTube"
              >
                <YoutubeIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Desktop brand + leaderboard */}
        <div
          className={`${PORTAL.container} flex items-center justify-between gap-4 py-3`}
        >
          <Link href={homeHref} className="min-w-0 shrink overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/newslogo.png"
              alt={isEnglish ? SITE_CONFIG.name : SITE_CONFIG.nameNp}
              width={220}
              height={76}
              decoding="async"
              className="h-14 w-auto object-contain object-left md:h-16 lg:h-[4.75rem]"
            />
          </Link>
          <HeaderLeaderboardRotator ads={ads} isEnglish={isEnglish} intervalMs={3000} />
        </div>
      </header>
    </>
  );
}
