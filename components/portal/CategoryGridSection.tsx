import Link from "next/link";
import { formatTimeAgo } from "@/lib/nepaliDate";
import {
  resolveArticleExcerpt,
  resolveArticleTitle,
  type LanguageEditionType,
} from "@/lib/language";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";
import { PortalImage } from "@/components/portal/PortalImage";
import { SectionHeader } from "@/components/portal/SectionHeader";
import { PORTAL } from "@/constants/portal";

type CategoryArticle = {
  id: string;
  title: string;
  titleNp?: string | null;
  slug: string;
  excerpt?: string | null;
  excerptNp?: string | null;
  coverImage?: string | null;
  createdAt: Date | string;
  author?: { name?: string | null } | null;
  category?: { name?: string; nameNp?: string | null; slug?: string } | null;
};

type CategoryGridSectionProps = {
  title: string;
  titleNp: string;
  categorySlug: string;
  articles: CategoryArticle[];
  lang?: LanguageEditionType | string;
};

export function CategoryGridSection({
  title,
  titleNp,
  categorySlug,
  articles,
  lang = "ne",
}: CategoryGridSectionProps) {
  if (!articles || articles.length === 0) return null;

  const isEnglish = lang === "en";
  const edition: LanguageEditionType = isEnglish ? "en" : "ne";
  const langQ = isEnglish ? "?lang=en" : "";
  const sectionTitle = isEnglish ? title : titleNp || title;

  const mainArticle = articles[0];
  const secondaryArticles = articles.slice(1, 4);

  const mainImage =
    optimizeCloudinaryUrl(mainArticle.coverImage, "hero") || mainArticle.coverImage;
  const mainTitle = resolveArticleTitle(mainArticle, edition);
  const mainExcerpt = resolveArticleExcerpt(mainArticle, edition);
  const mainWhen = formatTimeAgo(
    typeof mainArticle.createdAt === "string"
      ? new Date(mainArticle.createdAt)
      : mainArticle.createdAt,
    edition
  );

  return (
    <section>
      <SectionHeader
        title={sectionTitle}
        href={`/category/${categorySlug}${langQ}`}
        linkLabel={isEnglish ? "More news" : "थप समाचार"}
      />

      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-12 lg:gap-4">
        {/* Lead feature — ~70% */}
        <Link
          href={`/article/${mainArticle.slug}${langQ}`}
          className="group relative block min-h-[280px] overflow-hidden bg-neutral-800 sm:min-h-[340px] lg:col-span-8"
        >
          {mainImage ? (
            <PortalImage
              src={mainImage}
              alt={mainTitle}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : null}

          <span
            className="absolute left-0 top-0 z-10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: PORTAL.accent }}
          >
            {sectionTitle}
          </span>

          <div
            className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4 pt-20 sm:px-5 sm:pb-5 sm:pt-28"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0) 100%)",
            }}
          >
            <p className="mb-1.5 text-[10px] font-medium text-white/80">{mainWhen}</p>
            <h3
              className="line-clamp-3 text-xl font-extrabold leading-snug text-white sm:text-2xl"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.55)" }}
            >
              {mainTitle}
            </h3>
            {mainExcerpt ? (
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-white/85 sm:text-[13px]">
                {mainExcerpt}
              </p>
            ) : null}
            {mainArticle.author?.name ? (
              <p className="mt-2 text-[11px] text-white/70">
                {isEnglish ? "By" : "द्वारा"} {mainArticle.author.name}
              </p>
            ) : null}
          </div>
        </Link>

        {/* Side stack — ~30% */}
        <div className="flex w-full flex-col divide-y divide-gray-100 border border-gray-200 bg-white lg:col-span-4">
          {secondaryArticles.length > 0 ? (
            secondaryArticles.map((art) => {
              const image =
                optimizeCloudinaryUrl(art.coverImage, "thumbnail") || art.coverImage;
              const itemTitle = resolveArticleTitle(art, edition);
              const when = formatTimeAgo(
                typeof art.createdAt === "string" ? new Date(art.createdAt) : art.createdAt,
                edition
              );

              return (
                <Link
                  key={art.id}
                  href={`/article/${art.slug}${langQ}`}
                  className="group flex gap-3 p-3 transition-colors hover:bg-gray-50"
                >
                  <div className="relative h-16 w-[4.5rem] shrink-0 overflow-hidden bg-gray-200">
                    {image ? (
                      <PortalImage
                        src={image}
                        alt={itemTitle}
                        fill
                        sizes="72px"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="line-clamp-3 text-sm font-bold leading-snug text-gray-900 group-hover:underline">
                      {itemTitle}
                    </h4>
                    <span className="block text-[10px] text-gray-500">{when}</span>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="flex items-center justify-center p-6 text-center text-xs text-gray-400">
              {isEnglish ? "More stories coming soon." : "थप समाचार चाँडै आउँदैछ।"}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
