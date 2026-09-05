import Link from "next/link";
import type { LanguageEditionType } from "@/lib/language";
import {
  resolveArticleExcerpt,
  resolveArticleTitle,
  resolveCategoryName,
} from "@/lib/language";
import { formatTimeAgo } from "@/lib/nepaliDate";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";
import { PortalImage } from "@/components/portal/PortalImage";
import { PORTAL } from "@/constants/portal";

export type PortalArticleCard = {
  id: string;
  title: string;
  titleNp?: string | null;
  slug: string;
  excerpt?: string | null;
  excerptNp?: string | null;
  coverImage?: string | null;
  createdAt: Date | string;
  views?: number;
  author?: { name?: string | null } | null;
  category?: {
    name: string;
    nameNp?: string | null;
    slug?: string;
  } | null;
};

type NewsCardProps = {
  article: PortalArticleCard;
  lang: LanguageEditionType;
  variant?: "lead" | "stack" | "feature" | "list" | "compact" | "ranked";
  badge?: string;
  rank?: number;
  showExcerpt?: boolean;
  showAuthor?: boolean;
  /** Mark first hero as LCP priority. */
  priority?: boolean;
  className?: string;
};

function articleHref(slug: string, lang: LanguageEditionType) {
  return lang === "en" ? `/article/${slug}?lang=en` : `/article/${slug}`;
}

export function NewsCard({
  article,
  lang,
  variant = "list",
  badge,
  rank,
  showExcerpt = true,
  showAuthor = false,
  priority = false,
  className = "",
}: NewsCardProps) {
  const title = resolveArticleTitle(article, lang);
  const excerpt = resolveArticleExcerpt(article, lang);
  const category = article.category ? resolveCategoryName(article.category, lang) : null;
  const label = badge || category;
  const href = articleHref(article.slug, lang);
  const image =
    optimizeCloudinaryUrl(
      article.coverImage,
      variant === "lead" ? "hero" : "card"
    ) || article.coverImage;
  const when = formatTimeAgo(
    typeof article.createdAt === "string" ? new Date(article.createdAt) : article.createdAt,
    lang
  );

  if (variant === "lead" || variant === "stack") {
    const isLead = variant === "lead";
    const frameH = isLead ? "h-[320px] sm:h-[460px]" : "h-[200px]";
    const titleSize = isLead
      ? "text-xl sm:text-3xl font-extrabold"
      : "text-sm sm:text-base font-bold";

    return (
      <Link
        href={href}
        className={`group relative block overflow-hidden bg-neutral-800 ${frameH} ${className}`}
      >
        {image ? (
          <PortalImage
            src={image}
            alt={title}
            fill
            priority={priority}
            quality={isLead ? 90 : 75}
            sizes={
              isLead
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 960px"
                : "(max-width: 1024px) 100vw, 35vw"
            }
            className="absolute inset-0 z-0 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : null}
        {label ? (
          <span
            className="absolute left-0 top-0 z-20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: PORTAL.accent }}
          >
            {label}
          </span>
        ) : null}
        <div
          className={`absolute inset-x-0 bottom-0 z-10 ${isLead ? "px-4 pb-4 pt-24 sm:px-5 sm:pb-5 sm:pt-28" : "px-3 pb-3 pt-14"}`}
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0) 100%)",
          }}
        >
          <h2
            className={`line-clamp-3 leading-snug text-white ${titleSize}`}
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.65)" }}
          >
            {title}
          </h2>
          <p
            className="mt-1 text-[10px] font-medium text-white/90"
            style={{ textShadow: "0 1px 2px rgba(0,0,0,0.55)" }}
          >
            {category ? `${category} · ` : ""}
            {when}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === "ranked") {
    return (
      <Link href={href} className={`group flex items-start gap-3 ${className}`}>
        <span className="w-7 shrink-0 font-mono text-lg font-black tabular-nums" style={{ color: PORTAL.brand }}>
          {String(rank ?? 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 space-y-1">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 group-hover:underline">
            {title}
          </h3>
          <p className="text-[10px] text-gray-500">{when}</p>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={href} className={`group flex gap-3 border-b border-gray-100 pb-3 last:border-0 ${className}`}>
        {image ? (
          <div className="relative h-16 w-20 shrink-0 overflow-hidden bg-gray-200">
            <PortalImage src={image} alt={title} fill sizes="80px" className="object-cover" />
          </div>
        ) : null}
        <div className="min-w-0 space-y-1">
          {category ? (
            <span className="text-[10px] font-bold uppercase" style={{ color: PORTAL.accent }}>
              {category}
            </span>
          ) : null}
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 group-hover:underline">
            {title}
          </h3>
          <span className="block text-[10px] text-gray-500">{when}</span>
        </div>
      </Link>
    );
  }

  if (variant === "feature") {
    return (
      <Link href={href} className={`group block space-y-2 ${className}`}>
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-200">
          {image ? (
            <PortalImage
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          ) : null}
        </div>
        {category ? (
          <span className="text-[10px] font-bold uppercase" style={{ color: PORTAL.accent }}>
            {category}
          </span>
        ) : null}
        <h3 className="line-clamp-3 text-base font-bold leading-snug text-gray-900 group-hover:underline">
          {title}
        </h3>
        {showExcerpt && excerpt ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-600">{excerpt}</p>
        ) : null}
      </Link>
    );
  }

  return (
    <article
      className={`group flex flex-col gap-3 border-b border-gray-100 py-4 transition-colors hover:bg-gray-50/80 sm:flex-row sm:gap-4 sm:py-5 ${className}`}
    >
      {image ? (
        <Link
          href={href}
          className="relative block h-44 shrink-0 overflow-hidden bg-gray-200 sm:h-28 sm:w-44"
        >
          <PortalImage
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 176px"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase">
          {category ? <span style={{ color: PORTAL.accent }}>{category}</span> : null}
          <span className="font-medium normal-case text-gray-500">{when}</span>
        </div>
        <h3 className="text-base font-bold leading-snug text-gray-900 sm:text-lg">
          <Link href={href} className="hover:underline">
            {title}
          </Link>
        </h3>
        {showExcerpt && excerpt ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-600 sm:text-[13px]">{excerpt}</p>
        ) : null}
        {showAuthor && article.author?.name ? (
          <p className="text-[11px] text-gray-500">{article.author.name}</p>
        ) : null}
      </div>
    </article>
  );
}
