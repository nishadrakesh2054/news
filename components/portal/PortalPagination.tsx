import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PORTAL } from "@/constants/portal";

type PortalPaginationProps = {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
  isEnglish?: boolean;
  /** Optional “Showing X–Y of Z” line */
  totalItems?: number;
  pageSize?: number;
};

function pageWindow(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, total, current]);
  for (let p = current - 1; p <= current + 1; p++) {
    if (p >= 1 && p <= total) pages.add(p);
  }
  if (current <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (current >= total - 2) {
    pages.add(total - 1);
    pages.add(total - 2);
    pages.add(total - 3);
  }
  return [...pages].sort((a, b) => a - b);
}

export function PortalPagination({
  currentPage,
  totalPages,
  buildHref,
  isEnglish = false,
  totalItems,
  pageSize,
}: PortalPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(currentPage, totalPages);
  const from =
    totalItems != null && pageSize
      ? (currentPage - 1) * pageSize + 1
      : null;
  const to =
    totalItems != null && pageSize
      ? Math.min(currentPage * pageSize, totalItems)
      : null;

  const navBtn =
    "inline-flex h-10 items-center gap-1 px-3 text-sm font-bold transition-colors hover:underline disabled:pointer-events-none disabled:opacity-40";
  const pageBtn = (active: boolean) =>
    `inline-flex h-10 min-w-10 items-center justify-center px-3 text-sm font-bold transition-colors ${
      active
        ? "text-white"
        : "border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
    }`;

  return (
    <nav
      className="mt-10 flex flex-col items-center gap-4 border-t pt-6 sm:flex-row sm:justify-between"
      style={{ borderColor: PORTAL.rule }}
      aria-label={isEnglish ? "Pagination" : "पृष्ठहरू"}
    >
      <p className="text-xs text-gray-500 sm:text-left">
        {from != null && to != null && totalItems != null ? (
          <>
            {isEnglish ? "Showing" : "देखाइँदै"}{" "}
            <span className="font-semibold text-gray-700">
              {from}–{to}
            </span>{" "}
            {isEnglish ? "of" : "मध्ये"}{" "}
            <span className="font-semibold text-gray-700">{totalItems}</span>
          </>
        ) : (
          <>
            {isEnglish ? "Page" : "पृष्ठ"}{" "}
            <span className="font-semibold text-gray-700">
              {currentPage} / {totalPages}
            </span>
          </>
        )}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {currentPage > 1 ? (
          <Link
            href={buildHref(currentPage - 1)}
            className={navBtn}
            style={{ color: PORTAL.brand }}
            rel="prev"
            aria-label={isEnglish ? "Previous page" : "अघिल्लो पृष्ठ"}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">{isEnglish ? "Previous" : "अघिल्लो"}</span>
          </Link>
        ) : (
          <span className={`${navBtn} text-gray-300`} aria-hidden>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{isEnglish ? "Previous" : "अघिल्लो"}</span>
          </span>
        )}

        {pages.map((p, idx) => {
          const prev = pages[idx - 1];
          const showEllipsis = prev != null && p - prev > 1;
          const isCurrent = p === currentPage;
          return (
            <span key={p} className="inline-flex items-center gap-1.5">
              {showEllipsis ? (
                <span className="px-1 text-gray-400" aria-hidden>
                  …
                </span>
              ) : null}
              <Link
                href={buildHref(p)}
                aria-current={isCurrent ? "page" : undefined}
                className={pageBtn(isCurrent)}
                style={isCurrent ? { backgroundColor: PORTAL.brand } : undefined}
              >
                {p}
              </Link>
            </span>
          );
        })}

        {currentPage < totalPages ? (
          <Link
            href={buildHref(currentPage + 1)}
            className={navBtn}
            style={{ color: PORTAL.brand }}
            rel="next"
            aria-label={isEnglish ? "Next page" : "अर्को पृष्ठ"}
          >
            <span className="hidden sm:inline">{isEnglish ? "Next" : "अर्को"}</span>
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <span className={`${navBtn} text-gray-300`} aria-hidden>
            <span className="hidden sm:inline">{isEnglish ? "Next" : "अर्को"}</span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}
