import { Newspaper } from "lucide-react";
import { PORTAL } from "@/constants/portal";

export type EpaperCardItem = {
  id: string;
  title: string;
  pdfUrl: string;
  coverImage?: string | null;
};

type EpaperPdfCardProps = {
  item: EpaperCardItem;
  /** Optional small caption under title */
  caption?: string;
  className?: string;
};

/**
 * Cover + title card — click opens PDF in a new tab (read / download).
 * Layout inspired by Nepali news “special PDF materials” grids.
 */
export function EpaperPdfCard({ item, caption, className = "" }: EpaperPdfCardProps) {
  return (
    <a
      href={item.pdfUrl}
      target="_blank"
      rel="noreferrer"
      className={`group flex flex-col overflow-hidden border border-gray-200 bg-white transition-colors hover:border-gray-300 ${className}`}
      title={item.title}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
        {item.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.coverImage}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-2 px-3"
            style={{ backgroundColor: "rgba(25, 87, 166, 0.08)" }}
          >
            <Newspaper className="h-10 w-10" style={{ color: PORTAL.brand }} />
            <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">PDF</span>
          </div>
        )}
        <span
          className="pointer-events-none absolute bottom-2 right-2 rounded bg-black/65 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          PDF
        </span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-1 px-2.5 py-3 text-center sm:px-3 sm:py-3.5">
        <h3 className="line-clamp-3 text-xs font-bold leading-snug text-gray-900 group-hover:underline sm:text-[13px]">
          {item.title}
        </h3>
        {caption ? <p className="text-[10px] text-gray-500">{caption}</p> : null}
      </div>
    </a>
  );
}
