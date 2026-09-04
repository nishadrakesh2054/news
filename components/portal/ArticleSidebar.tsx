import Link from "next/link";
import type { ReactNode } from "react";
import { formatTimeAgoNp } from "@/lib/nepaliDate";
import { resolveArticleTitle } from "@/lib/language";
import { PORTAL } from "@/constants/portal";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";
import { ArticleAdSlot } from "@/components/portal/ArticleAdSlot";
import type { AdUnitData } from "@/components/portal/AdUnit";

type SidebarArticle = {
  id: string;
  title: string;
  titleNp: string | null;
  slug: string;
  coverImage: string | null;
  createdAt: Date;
  views?: number;
};

type ArticleSidebarProps = {
  latest: SidebarArticle[];
  trending: SidebarArticle[];
  lang: "ne" | "en";
  langQuery: string;
  path: string;
  adTop?: AdUnitData | null;
  adBottom?: AdUnitData | null;
};

function NewsList({
  items,
  lang,
  langQuery,
  numbered,
}: {
  items: SidebarArticle[];
  lang: "ne" | "en";
  langQuery: string;
  numbered?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <ul className="divide-y divide-gray-100">
      {items.map((item, index) => {
        const title = resolveArticleTitle(item, lang);
        const thumb =
          optimizeCloudinaryUrl(item.coverImage || undefined, "thumbnail") || item.coverImage;
        return (
          <li key={item.id}>
            <Link
              href={`/article/${item.slug}${langQuery}`}
              className="group flex gap-3 py-3"
            >
              {numbered ? (
                <span
                  className="w-5 shrink-0 pt-0.5 text-sm font-extrabold tabular-nums"
                  style={{ color: index < 3 ? PORTAL.accent : PORTAL.muted }}
                >
                  {index + 1}
                </span>
              ) : thumb ? (
                <div className="h-14 w-20 shrink-0 overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb}
                    alt=""
                    className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
                  />
                </div>
              ) : (
                <div
                  className="h-14 w-20 shrink-0 bg-gray-100"
                  aria-hidden
                />
              )}
              <div className="min-w-0 flex-1">
                <h3
                  className="text-[13px] font-bold leading-snug transition-colors group-hover:underline line-clamp-3"
                  style={{ color: PORTAL.ink }}
                >
                  {title}
                </h3>
                <span className="mt-1 block text-[11px] text-gray-400">
                  {formatTimeAgoNp(item.createdAt)}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <h2 className="shrink-0 text-sm font-extrabold" style={{ color: PORTAL.brand }}>
        {children}
      </h2>
      <div
        className="h-px min-w-4 flex-1"
        style={{ backgroundColor: PORTAL.accent, opacity: 0.35 }}
      />
    </div>
  );
}

/** Right-rail latest + trending lists for article detail. */
export function ArticleSidebar({
  latest,
  trending,
  lang,
  langQuery,
  path,
  adTop,
  adBottom,
}: ArticleSidebarProps) {
  const isEnglish = lang === "en";

  return (
    <aside className="space-y-8 lg:sticky lg:top-24">
      <ArticleAdSlot
        ad={adTop}
        path={path}
        isEnglish={isEnglish}
        variant="sidebar"
      />

      {latest.length > 0 ? (
        <section>
          <SectionTitle>{isEnglish ? "Latest" : "ताजा समाचार"}</SectionTitle>
          <NewsList items={latest} lang={lang} langQuery={langQuery} />
        </section>
      ) : null}

      <ArticleAdSlot
        ad={adBottom}
        path={path}
        isEnglish={isEnglish}
        variant="sidebar"
      />

      {trending.length > 0 ? (
        <section>
          <SectionTitle>{isEnglish ? "Trending" : "ट्रेन्डिङ"}</SectionTitle>
          <NewsList items={trending} lang={lang} langQuery={langQuery} numbered />
        </section>
      ) : null}
    </aside>
  );
}
