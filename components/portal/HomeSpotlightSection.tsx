import Link from "next/link";
import { Clock } from "lucide-react";
import type { HomeDisplayMode } from "@prisma/client";
import type { LanguageEditionType } from "@/lib/language";
import {
  resolveArticleExcerpt,
  resolveArticleTitle,
} from "@/lib/language";
import { formatTimeAgo } from "@/lib/nepaliDate";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";
import { PortalImage } from "@/components/portal/PortalImage";
import type { HomeSpotlightAd } from "@/components/portal/HomeFullWidthAd";
import { HomeFullWidthAd } from "@/components/portal/HomeFullWidthAd";
import { PORTAL } from "@/constants/portal";
import type { PortalArticleCard } from "@/components/portal/NewsCard";

export type HomeSpotlightArticle = PortalArticleCard & {
  homeDisplay?: HomeDisplayMode | "TITLE_ONLY" | "TITLE_MEDIA" | null;
};

type HomeSpotlightSectionProps = {
  articles: HomeSpotlightArticle[];
  lang: LanguageEditionType;
  spotlightAds?: HomeSpotlightAd[];
};

function SpotlightMeta({
  authorName,
  authorImage,
  when,
}: {
  authorName?: string | null;
  authorImage?: string | null;
  when: string;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:mt-5">
      {authorName ? (
        <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-800 sm:text-[15px]">
          {authorImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={authorImage}
              alt=""
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: PORTAL.accent }}
              aria-hidden
            >
              {authorName.slice(0, 1)}
            </span>
          )}
          {authorName}
        </span>
      ) : null}
      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 sm:text-[15px]">
        <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
        {when}
      </span>
    </div>
  );
}

/**
 * Admin-controlled homepage spotlight:
 * - TITLE_ONLY → big title + date + editor
 * - TITLE_MEDIA → big title + date + editor + full-width image + excerpt
 */
export function HomeSpotlightSection({
  articles,
  lang,
  spotlightAds = [],
}: HomeSpotlightSectionProps) {
  if (articles.length === 0) return null;

  return (
    <section className="w-full">
      {articles.map((article, index) => {
        const title = resolveArticleTitle(article, lang);
        const excerpt = resolveArticleExcerpt(article, lang);
        const href = lang === "en" ? `/article/${article.slug}?lang=en` : `/article/${article.slug}`;
        const withMedia = article.homeDisplay === "TITLE_MEDIA";
        const image =
          withMedia
            ? optimizeCloudinaryUrl(article.coverImage, "hero") || article.coverImage
            : null;
        const when = formatTimeAgo(
          typeof article.createdAt === "string"
            ? new Date(article.createdAt)
            : article.createdAt,
          lang
        );

        return (
          <article
            key={article.id}
            className="border-b border-gray-200 py-7 first:pt-2 last:border-b-0 sm:py-9"
          >
            <Link href={href} className="group block">
              {/* Title block — padded / constrained like before */}
              <div className="mx-auto max-w-[920px] px-5 sm:px-10 lg:px-16 xl:px-20">
                <h2
                  className="text-center font-khand-nav text-pretty text-gray-700 transition-colors duration-200 group-hover:text-[#1957A6]"
                  style={{
                    fontSize: "clamp(2rem, 4.2vw, 68px)",
                    fontWeight: 600,
                    lineHeight: "clamp(2.6rem, 5.5vw, 88px)",
                  }}
                >
                  {title}
                </h2>

                {/* Date above, editor/author below — reference style */}
                <SpotlightMeta
                  authorName={article.author?.name}
                  authorImage={article.author?.image}
                  when={when}
                />
              </div>
            </Link>

            {/* Nepali portal pattern: heading first, then full-width ad */}
            {index === 0 ? <HomeFullWidthAd lang={lang} ads={spotlightAds} /> : null}

            <Link href={href} className="group block">
              {/* Image = layout/container width, centered */}
              {withMedia && image ? (
                <div className="relative mx-auto mt-6 aspect-[16/9] w-full overflow-hidden bg-gray-200 sm:mt-8">
                  <PortalImage
                    src={image}
                    alt={title}
                    fill
                    priority={index === 0}
                    quality={80}
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    className="object-cover object-center transition-transform duration-200 group-hover:translate-y-px"
                  />
                </div>
              ) : null}

              {withMedia && excerpt ? (
                <p className="mx-auto mt-4 max-w-[920px] px-5 text-center text-sm leading-relaxed text-gray-600 sm:mt-5 sm:px-10 sm:text-base lg:px-16">
                  {excerpt}
                </p>
              ) : null}
            </Link>
          </article>
        );
      })}
    </section>
  );
}
