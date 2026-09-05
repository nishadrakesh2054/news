"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Home, Search, X } from "lucide-react";
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

/** Desktop/tablet category strip. Mobile menu lives in PublicHeader. */
export function CategoryNavbar({ categories = [] }: CategoryNavbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  const langParam = searchParams.get("lang");
  const isEnglish =
    langParam === "en" ||
    (typeof window !== "undefined" && isEnglishHostname(window.location.hostname));
  const langQuery = isEnglish ? "?lang=en" : "";

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen && !menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchOpen && searchWrapRef.current && !searchWrapRef.current.contains(target)) {
        setSearchOpen(false);
      }
      if (menuOpen && menuWrapRef.current && !menuWrapRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [searchOpen, menuOpen]);

  const closeMenu = () => setMenuOpen(false);

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

  return (
    <nav
      className="relative sticky top-0 z-40 hidden w-full select-none text-white md:block"
      style={{ backgroundColor: PORTAL.brand }}
    >
      <div className={`${PORTAL.container} flex items-center justify-between gap-2`}>
        <div className="flex min-w-0 flex-1 items-center overflow-x-auto scrollbar-none">
          <Link
            href={`/${langQuery}`}
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
                className={itemClass(active)}
                style={activeStyle(active)}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href={`/epaper${langQuery}`}
            className={itemClass(pathname === "/epaper")}
            style={activeStyle(pathname === "/epaper")}
          >
            {isEnglish ? "E-Paper" : "इ-पत्रिका"}
          </Link>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <div ref={searchWrapRef} className="relative flex items-center">
            {searchOpen ? (
              <form
                onSubmit={handleSearch}
                className="absolute right-0 top-1/2 z-50 flex -translate-y-1/2 items-center bg-white text-gray-900 shadow-md"
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
                  setMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="inline-flex h-10 w-10 items-center justify-center text-white hover:bg-black/10"
                aria-label={isEnglish ? "Search" : "खोज"}
                title={isEnglish ? "Search" : "खोज"}
              >
                <Search className="h-4 w-4" />
              </button>
            )}
          </div>

          <div ref={menuWrapRef} className="relative">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center text-white hover:bg-black/10"
              onClick={() => {
                setSearchOpen(false);
                setMenuOpen((v) => !v);
              }}
              aria-expanded={menuOpen}
              aria-label={isEnglish ? "All menu" : "सबै मेनु"}
            >
              <HamburgerIcon open={menuOpen} />
            </button>

            {menuOpen ? (
              <div className="absolute right-0 top-full z-50 w-64 bg-white text-gray-900 shadow-lg">
                <div className="flex max-h-[70vh] flex-col overflow-y-auto">
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
                    onClick={closeMenu}
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
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
