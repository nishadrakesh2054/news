"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Home, Search, X } from "lucide-react";
import { CategorySideDrawer } from "@/components/portal/CategorySideDrawer";
import { isEnglishHostname } from "@/lib/language";
import { getFormattedNepaliDate } from "@/lib/nepaliDate";
import { editionPathHref } from "@/lib/site-url";
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
  const [isStuck, setIsStuck] = useState(false);
  const [dateLabel] = useState(() => {
    const english = new Date().toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return { ne: getFormattedNepaliDate(), en: english };
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const langParam = searchParams.get("lang");
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const isEnglish =
    langParam === "en" ||
    (typeof window !== "undefined" && isEnglishHostname(window.location.hostname));
  const langQuery = isEnglish ? "?lang=en" : "";
  const shownDate = isEnglish ? dateLabel.en : dateLabel.ne;

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const syncStuck = () => {
      const nav = navRef.current;
      if (!nav) return;
      setIsStuck(nav.getBoundingClientRect().top <= 0);
    };
    syncStuck();
    window.addEventListener("scroll", syncStuck, { passive: true });
    window.addEventListener("resize", syncStuck);
    return () => {
      window.removeEventListener("scroll", syncStuck);
      window.removeEventListener("resize", syncStuck);
    };
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchWrapRef.current && !searchWrapRef.current.contains(target)) {
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(
      `/search?q=${encodeURIComponent(searchQuery.trim())}${isEnglish ? "&lang=en" : ""}`
    );
    setSearchOpen(false);
    setSearchQuery("");
  };

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

  const itemClass = (active: boolean) =>
    `inline-flex h-12 items-center justify-center gap-1.5 whitespace-nowrap px-3.5 text-[18px] font-bold leading-[1.45] ${
      active ? "text-white" : "text-white/95 hover:bg-black/10"
    }`;

  const activeStyle = (active: boolean): React.CSSProperties | undefined =>
    active ? { backgroundColor: PORTAL.accent } : undefined;

  return (
    <>
      <nav
        ref={navRef}
        className="relative sticky top-0 z-40 hidden w-full select-none font-khand-nav text-white md:block"
        style={{ backgroundColor: PORTAL.brand }}
      >
        <div className={`${PORTAL.container} flex min-h-12 items-center justify-between gap-2`}>
          <div className="flex min-h-12 min-w-0 flex-1 items-center">
            <div className="relative z-50 shrink-0">
              <Link
                href={`/${langQuery}`}
                className={itemClass(pathname === "/")}
                style={activeStyle(pathname === "/")}
              >
                <Home className="h-5 w-5 shrink-0" />
                <span className="inline-flex items-center leading-[1.45]">
                  {isEnglish ? "Home" : "गृह"}
                </span>
              </Link>

              {isStuck ? (
                <div className="pointer-events-none absolute left-0 top-full z-50 flex flex-col items-start">
                  <span
                    className="ml-3 block h-0 w-0 border-x-[6px] border-b-[7px] border-x-transparent border-b-[#1a1a1a]"
                    aria-hidden
                  />
                  <div className="whitespace-nowrap bg-[#1a1a1a] px-2.5 py-1 text-[10px] font-semibold leading-[1.45] text-white shadow-sm">
                    {shownDate}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex min-h-12 min-w-0 flex-1 items-center overflow-x-auto scrollbar-none">
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
                    <span className="inline-flex items-center leading-[1.45]">{label}</span>
                  </Link>
                );
              })}
              <Link
                href={`/epaper${langQuery}`}
                className={itemClass(pathname === "/epaper")}
                style={activeStyle(pathname === "/epaper")}
              >
                <span className="inline-flex items-center leading-[1.45]">
                  {isEnglish ? "E-Paper" : "इ-पत्रिका"}
                </span>
              </Link>
            </div>
          </div>

          <div className="ml-auto flex h-12 shrink-0 items-center gap-0.5">
            <div ref={searchWrapRef} className="relative flex h-12 items-center">
              {searchOpen ? (
                <form
                  onSubmit={handleSearch}
                  className="absolute right-0 top-1/2 z-50 flex h-8 -translate-y-1/2 items-center rounded-sm border border-gray-200 bg-white text-gray-900 shadow-sm"
                >
                  <Search className="ml-2 h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder={isEnglish ? "Search…" : "खोज्नुहोस्…"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-[10.75rem] bg-transparent py-0 pl-1.5 pr-1 text-sm outline-none sm:w-[11.75rem]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-800"
                    aria-label={isEnglish ? "Close search" : "बन्द गर्नुहोस्"}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setSearchOpen(true);
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center text-white hover:bg-black/10"
                  aria-label={isEnglish ? "Search" : "खोज"}
                  title={isEnglish ? "Search" : "खोज"}
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center text-white hover:bg-black/10"
              onClick={() => {
                setSearchOpen(false);
                setMenuOpen((v) => !v);
              }}
              aria-expanded={menuOpen}
              aria-label={isEnglish ? "All menu" : "सबै मेनु"}
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </nav>

      <CategorySideDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        categories={categories}
        isEnglish={isEnglish}
        langQuery={langQuery}
        onToggleLanguage={toggleLanguage}
      />
    </>
  );
}
