import {
  ArticleStatus,
  ArticleType,
  AuRegion,
  LanguageEdition,
  HomeDisplayMode,
} from "@prisma/client";
import { buildBodies, approxWordCount } from "./content";
import { PLACE_EN, PLACE_NP, pad, hoursFor } from "./packs-core";
import { allCategoryPacks, AUSTRALIA_TOPICS } from "./packs-extra";
import { SEED_SLUG_PREFIX, type ArticleBlueprint } from "./types";

function statusFor(index: number): ArticleStatus {
  // ~15% drafts for filter testing
  if (index % 7 === 0) return ArticleStatus.DRAFT;
  return ArticleStatus.PUBLISHED;
}

function typeFor(index: number, categorySlug: string): ArticleType {
  if (categorySlug === "opinion") return ArticleType.OPINION;
  if (index % 11 === 0) return ArticleType.FEATURE;
  return ArticleType.STANDARD;
}

export function buildArticleBlueprints(): ArticleBlueprint[] {
  const packs = allCategoryPacks();
  const articles: ArticleBlueprint[] = [];
  let globalIndex = 0;

  for (const pack of packs) {
    pack.topics.forEach((topic, i) => {
      const n = i + 1;
      const slug = `${SEED_SLUG_PREFIX}${pack.categorySlug}-${pad(n)}`;
      const placeIdx = (globalIndex + i) % PLACE_EN.length;
      const bodies = buildBodies({
        placeEn: PLACE_EN[placeIdx],
        placeNp: PLACE_NP[placeIdx],
        title: topic.title,
        titleNp: topic.titleNp,
        focusEn: topic.focusEn,
        focusNp: topic.focusNp,
        index: globalIndex,
      });

      const status = statusFor(globalIndex);
      const published = status === ArticleStatus.PUBLISHED;
      const hoursAgo = hoursFor(globalIndex, 120);

      articles.push({
        slug,
        categorySlug: pack.categorySlug,
        title: topic.title,
        titleNp: topic.titleNp,
        excerpt: bodies.excerpt,
        excerptNp: bodies.excerptNp,
        content: bodies.content,
        contentNp: bodies.contentNp,
        status,
        type: typeFor(globalIndex, pack.categorySlug),
        languageEdition: LanguageEdition.BOTH,
        isFeatured: published && globalIndex % 19 === 0,
        isBreaking: false,
        showOnHome: published && globalIndex % 23 === 0,
        homeDisplay:
          globalIndex % 2 === 0
            ? HomeDisplayMode.TITLE_MEDIA
            : HomeDisplayMode.TITLE_ONLY,
        views: published ? 80 + ((globalIndex * 37) % 4200) : 0,
        province: pack.categorySlug === "national" || pack.categorySlug === "politics"
          ? ((globalIndex % 7) + 1)
          : null,
        district: null,
        auRegion: null,
        tagSlugs: pack.tagSlugs.slice(0, 4),
        imageQuery: pack.imageQuery,
        metaTitle: `${topic.title} | Echo Manch`,
        metaTitleNp: `${topic.titleNp} | इको माञ्च`,
        metaDescription: bodies.excerpt.slice(0, 155),
        metaDescriptionNp: bodies.excerptNp.slice(0, 155),
        keywords: pack.tagSlugs.join(", "),
        keywordsNp: pack.tagSlugs.join(", "),
        caption: "Demo stock photo for Echo Manch development seed",
        hoursAgo,
      });

      const words = approxWordCount(bodies.content);
      if (words < 200) {
        console.warn(`  ⚠ Short EN body (${words} words): ${slug}`);
      }

      globalIndex += 1;
    });
  }

  // Australia extras — distributed across categories with auRegion
  AUSTRALIA_TOPICS.forEach((topic, i) => {
    const n = i + 1;
    const slug = `${SEED_SLUG_PREFIX}australia-${pad(n)}`;
    const bodies = buildBodies({
      placeEn: topic.placeEn,
      placeNp: topic.placeNp,
      title: topic.title,
      titleNp: topic.titleNp,
      focusEn: topic.focusEn,
      focusNp: topic.focusNp,
      index: globalIndex,
    });
    const status = statusFor(globalIndex);
    const published = status === ArticleStatus.PUBLISHED;
    const hoursAgo = hoursFor(globalIndex, 120);

    articles.push({
      slug,
      categorySlug: topic.categorySlug,
      title: topic.title,
      titleNp: topic.titleNp,
      excerpt: bodies.excerpt,
      excerptNp: bodies.excerptNp,
      content: bodies.content,
      contentNp: bodies.contentNp,
      status,
      type: ArticleType.FEATURE,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: published && i % 5 === 0,
      isBreaking: false,
      showOnHome: published && i % 4 === 0,
      homeDisplay: HomeDisplayMode.TITLE_MEDIA,
      views: published ? 120 + i * 90 : 0,
      province: null,
      district: null,
      auRegion: topic.auRegion as AuRegion,
      tagSlugs: topic.tagSlugs.slice(0, 4),
      imageQuery: topic.imageQuery,
      metaTitle: `${topic.title} | Echo Manch`,
      metaTitleNp: `${topic.titleNp} | इको माञ्च`,
      metaDescription: bodies.excerpt.slice(0, 155),
      metaDescriptionNp: bodies.excerptNp.slice(0, 155),
      keywords: topic.tagSlugs.join(", "),
      keywordsNp: topic.tagSlugs.join(", "),
      caption: "Demo Australia-related stock photo",
      hoursAgo,
    });
    globalIndex += 1;
  });

  return articles;
}
