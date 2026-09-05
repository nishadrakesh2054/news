"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Home, Menu, Search, X } from "lucide-react";
import { isEnglishHostname } from "@/lib/language";
import { PORTAL } from "@/constants/portal";

interface CategoryItem {
  id: string;
  name: string;
  nameNp: string | null;
  slug: string;
  displayName?: string;
}

type CategoryNavbarProps = {
  categories?: CategoryItem[];
};

export function CategoryNavbar({ categories = [] }: CategoryNavbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const langParam = searchParams.get("lang");
  const isEnglish =
    langParam === "en" ||
    (typeof window !== "undefined" && isEnglishHostname(window.location.hostname));
  const langQuery = isEnglish ? "?lang=en" : "";

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [searchOpen]);

  const closeMobile = () => setMobileOpen(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(
      `/search?q=${encodeURIComponent(searchQuery.trim())}${isEnglish ? "&lang=en" : ""}`
    );
    setSearchOpen(false);
    setSearchQuery("");
  };

  const itemClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-xs font-bold sm:text-sm ${
      active ? "text-white" : "text-white/95 hover:bg-black/10"
    }`;

  const activeStyle = (active: boolean): React.CSSProperties | undefined =>
    active ? { backgroundColor: PORTAL.accent } : undefined;

  const links = (
    <>
      <Link
        href={`/${langQuery}`}
        onClick={closeMobile}
        className={itemClass(pathname === "/")}
        style={activeStyle(pathname === "/")}
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
            onClick={closeMobile}
            className={itemClass(active)}
            style={activeStyle(active)}
          >
            {label}
          </Link>
        );
      })}
      <Link
        href={`/epaper${langQuery}`}
        onClick={closeMobile}
        className={itemClass(pathname === "/epaper")}
        style={activeStyle(pathname === "/epaper")}
      >
        {isEnglish ? "E-Paper" : "इ-पत्रिका"}
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-40 w-full select-none text-white" style={{ backgroundColor: PORTAL.brand }}>
      <div className={`${PORTAL.container} flex items-center justify-between gap-2`}>
        <div className="hidden min-w-0 flex-1 items-center overflow-x-auto scrollbar-none md:flex">
          {links}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <div ref={searchWrapRef} className="relative flex items-center">
            {searchOpen ? (
              <form
                onSubmit={handleSearch}
                className="absolute right-0 top-1/2 z-50 flex -translate-y-1/2 items-center bg-white text-gray-900 shadow-md md:static md:translate-y-0 md:shadow-none"
              >
                <Search className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder={isEnglish ? "Search…" : "खोज्नुहोस्…"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[min(58vw,14rem)] bg-transparent py-2 pl-1.5 pr-1 text-sm outline-none sm:w-52"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="px-2 py-2 text-gray-500 hover:text-gray-800"
                  aria-label={isEnglish ? "Close search" : "बन्द गर्नुहोस्"}
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setSearchOpen(true);
                }}
                className="inline-flex h-9 w-9 items-center justify-center text-white hover:bg-black/10"
                aria-label={isEnglish ? "Search" : "खोज"}
                title={isEnglish ? "Search" : "खोज"}
              >
                <Search className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-2 py-2 text-xs font-bold hover:bg-black/10 sm:px-3"
            onClick={() => {
              setSearchOpen(false);
              setMobileOpen((v) => !v);
            }}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5 md:h-4 md:w-4" /> : <Menu className="h-5 w-5 md:h-4 md:w-4" />}
            <span className="hidden sm:inline">{isEnglish ? "All Menu" : "सबै मेनु"}</span>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          className="md:absolute md:right-4 md:mt-0 md:w-64 md:bg-white md:text-gray-900 md:shadow-lg"
          style={{ backgroundColor: PORTAL.brand }}
        >
          <div className={`${PORTAL.container} flex flex-col md:bg-white md:px-0`}>
            <div className="flex flex-col md:hidden">
              <Link
                href={`/${langQuery}`}
                onClick={closeMobile}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold ${
                  pathname === "/" ? "text-white" : "text-white/95 hover:bg-black/10"
                }`}
                style={pathname === "/" ? { backgroundColor: PORTAL.accent } : undefined}
              >
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/70" aria-hidden />
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
                    onClick={closeMobile}
                    className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold ${
                      active ? "text-white" : "text-white/95 hover:bg-black/10"
                    }`}
                    style={active ? { backgroundColor: PORTAL.accent } : undefined}
                  >
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/70" aria-hidden />
                    {label}
                  </Link>
                );
              })}
              <Link
                href={`/epaper${langQuery}`}
                onClick={closeMobile}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold ${
                  pathname === "/epaper" ? "text-white" : "text-white/95 hover:bg-black/10"
                }`}
                style={pathname === "/epaper" ? { backgroundColor: PORTAL.accent } : undefined}
              >
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/70" aria-hidden />
                {isEnglish ? "E-Paper" : "इ-पत्रिका"}
              </Link>
            </div>
            <div className="hidden flex-col md:flex">
              {categories.map((cat) => {
                const label = isEnglish
                  ? cat.name || cat.nameNp || cat.displayName
                  : cat.nameNp || cat.name || cat.displayName;
                const active = pathname === `/category/${cat.slug}`;
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}${langQuery}`}
                    onClick={closeMobile}
                    className={`group inline-flex items-center gap-1.5 border-b border-gray-200 px-4 py-2.5 text-sm font-semibold transition-colors ${
                      active
                        ? "text-white"
                        : "text-gray-900 hover:bg-[#C41E3A] hover:text-white"
                    }`}
                    style={active ? { backgroundColor: PORTAL.accent } : undefined}
                  >
                    <ChevronRight
                      className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                        active ? "text-white/80" : "text-gray-400 group-hover:text-white/80"
                      }`}
                      aria-hidden
                    />
                    {label}
                  </Link>
                );
              })}
              <Link
                href={`/epaper${langQuery}`}
                onClick={closeMobile}
                className={`group inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-colors ${
                  pathname === "/epaper"
                    ? "text-white"
                    : "text-gray-900 hover:bg-[#C41E3A] hover:text-white"
                }`}
                style={pathname === "/epaper" ? { backgroundColor: PORTAL.accent } : undefined}
              >
                <ChevronRight
                  className={`h-3.5 w-3.5 shrink-0 transition-colors ${
                    pathname === "/epaper"
                      ? "text-white/80"
                      : "text-gray-400 group-hover:text-white/80"
                  }`}
                  aria-hidden
                />
                {isEnglish ? "E-Paper" : "इ-पत्रिका"}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
