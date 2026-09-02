"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Home, Search, Sparkles } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  nameNp: string | null;
  slug: string;
}

export function CategoryNavbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  const langParam = searchParams.get("lang");
  const isEnHost = typeof window !== "undefined" && (window.location.hostname.startsWith("english.") || window.location.hostname.startsWith("en."));
  const isEnglish = langParam === "en" || isEnHost;

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const langQuery = isEnglish ? "?lang=en" : "";

  return (
    <nav className="w-full bg-background border-b-2 border-[#027081] sticky top-0 z-40 shadow-xs select-none">
      <div className="max-w-[1480px] mx-auto px-4 flex items-center justify-between overflow-x-auto scrollbar-none">
        <div className="flex items-center space-x-1 sm:space-x-2 py-1 font-bold text-xs sm:text-sm whitespace-nowrap">
          {/* Homepage Link */}
          <Link
            href={`/${langQuery}`}
            className={`flex items-center space-x-1.5 px-3 py-2.5 rounded-none transition-colors ${
              pathname === "/"
                ? "bg-[#027081] text-white"
                : "text-foreground hover:bg-muted/60"
            }`}
          >
            <Home className="h-4 w-4" />
            <span>{isEnglish ? "Home" : "गृह"}</span>
          </Link>

          {/* Rashifal Dedicated Page Link */}
          <Link
            href={`/rashifal${langQuery}`}
            className={`flex items-center space-x-1 px-3 py-2.5 rounded-none transition-colors font-bold ${
              pathname === "/rashifal"
                ? "bg-[#027081] text-white"
                : "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
            <span>{isEnglish ? "Horoscope" : "आजको राशिफल"}</span>
          </Link>

          {/* Dynamic Categories */}
          {categories.map((cat) => {
            const catHref = `/category/${cat.slug}${langQuery}`;
            const isActive = pathname === `/category/${cat.slug}`;
            const displayName = isEnglish ? (cat.name || cat.nameNp) : (cat.nameNp || cat.name);

            return (
              <Link
                key={cat.id}
                href={catHref}
                className={`px-3 py-2.5 rounded-none transition-colors ${
                  isActive
                    ? "bg-[#027081] text-white"
                    : "text-foreground hover:bg-muted/60"
                }`}
              >
                {displayName}
              </Link>
            );
          })}
        </div>

        {/* Public Search Link Button */}
        <Link
          href={`/search${langQuery}`}
          className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-[#027081] hover:bg-[#027081]/10 rounded-none transition-colors shrink-0"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">{isEnglish ? "Search" : "खोज्नुहोस्"}</span>
        </Link>
      </div>
    </nav>
  );
}
