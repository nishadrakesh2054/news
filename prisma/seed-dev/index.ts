/**
 * Safe, idempotent development seed for Echo Manch.
 *
 * - Never deletes / truncates / updates existing non-seed records
 * - Skips articles that already exist (by deterministic slug)
 * - Only creates missing categories/tags (empty update on upsert)
 *
 * Run:
 *   pnpm db:seed-dev
 *
 * Optional env:
 *   IMAGE_PROVIDER_API_KEY=...   # Unsplash access key
 *   UNSPLASH_ACCESS_KEY=...      # alias
 *   PEXELS_API_KEY=...
 *   SEED_UPLOAD_CLOUDINARY=1     # upload images via existing Cloudinary config
 */
import { PrismaClient, HomeDisplayMode } from "@prisma/client";
import { CATEGORY_DEFS } from "./categories";
import { TAG_DEFS } from "./tags";
import { resolveAuthors, pickAuthor } from "./authors";
import { resolveSeedImage } from "./images";
import { buildArticleBlueprints } from "./articles";
import type { SeedRunSummary } from "./types";

const prisma = new PrismaClient();

async function ensureCategories(summary: SeedRunSummary) {
  const map: Record<string, string> = {};
  for (const cat of CATEGORY_DEFS) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      map[cat.slug] = existing.id;
      summary.categoriesSkipped += 1;
      continue;
    }
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        nameNp: cat.nameNp,
        slug: cat.slug,
        order: cat.order,
        description: cat.description,
        descriptionNp: cat.descriptionNp,
      },
    });
    map[cat.slug] = created.id;
    summary.categoriesCreated += 1;
    console.log(`  + category ${cat.slug}`);
  }
  return map;
}

async function ensureTags(summary: SeedRunSummary) {
  const map: Record<string, string> = {};
  for (const tag of TAG_DEFS) {
    const existing = await prisma.tag.findUnique({ where: { slug: tag.slug } });
    if (existing) {
      map[tag.slug] = existing.id;
      summary.tagsSkipped += 1;
      continue;
    }
    // name is unique — if name clash with different slug, skip create
    const byName = await prisma.tag.findUnique({ where: { name: tag.name } });
    if (byName) {
      map[tag.slug] = byName.id;
      summary.tagsSkipped += 1;
      continue;
    }
    const created = await prisma.tag.create({
      data: { name: tag.name, nameNp: tag.nameNp, slug: tag.slug },
    });
    map[tag.slug] = created.id;
    summary.tagsCreated += 1;
  }
  return map;
}

async function mapConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

async function main() {
  console.log("🌱 Echo Manch development seed (additive, idempotent)…\n");

  const beforeArticles = await prisma.article.count();
  const summary: SeedRunSummary = {
    categoriesCreated: 0,
    categoriesSkipped: 0,
    tagsCreated: 0,
    tagsSkipped: 0,
    authorsUsed: [],
    articlesCreated: 0,
    articlesSkipped: 0,
    mediaCreated: 0,
    errors: [],
  };

  const authors = await resolveAuthors(prisma);
  summary.authorsUsed = authors.map((a) => a.email);
  console.log(`Authors: ${summary.authorsUsed.join(", ")}`);

  console.log("Categories…");
  const categoryMap = await ensureCategories(summary);

  console.log("Tags…");
  const tagMap = await ensureTags(summary);

  const blueprints = buildArticleBlueprints();
  console.log(`\nArticle blueprints: ${blueprints.length}`);

  // Pre-resolve images with limited concurrency
  console.log("Resolving images…");
  const images = await mapConcurrency(blueprints, 6, async (bp) => {
    try {
      return await resolveSeedImage(bp.imageQuery, bp.slug);
    } catch (e) {
      summary.errors.push(`image ${bp.slug}: ${e instanceof Error ? e.message : String(e)}`);
      return {
        url: "https://images.unsplash.com/photo-1495020689067-958852a1665a?auto=format&fit=crop&w=1200&h=675&q=80",
        alt: "news fallback",
        source: "fallback" as const,
        width: 1200,
        height: 675,
      };
    }
  });

  console.log("Inserting articles (skip existing)…");
  for (let i = 0; i < blueprints.length; i++) {
    const bp = blueprints[i];
    const image = images[i];
    const categoryId = categoryMap[bp.categorySlug];
    if (!categoryId) {
      summary.errors.push(`missing category ${bp.categorySlug} for ${bp.slug}`);
      continue;
    }

    const existing = await prisma.article.findUnique({
      where: { slug: bp.slug },
      select: { id: true },
    });
    if (existing) {
      summary.articlesSkipped += 1;
      continue;
    }

    const author = pickAuthor(authors, i);
    const tagIds = bp.tagSlugs
      .map((s) => tagMap[s])
      .filter((id): id is string => Boolean(id));

    const when = new Date(Date.now() - bp.hoursAgo * 3600_000);
    const publishedAt = bp.status === "PUBLISHED" ? when : null;

    try {
      const article = await prisma.article.create({
        data: {
          title: bp.title,
          titleNp: bp.titleNp,
          slug: bp.slug,
          excerpt: bp.excerpt,
          excerptNp: bp.excerptNp,
          content: bp.content,
          contentNp: bp.contentNp,
          coverImage: image.url,
          ogImage: image.url,
          caption: bp.caption,
          status: bp.status,
          type: bp.type,
          languageEdition: bp.languageEdition,
          isFeatured: bp.isFeatured,
          isBreaking: bp.isBreaking,
          showOnHome: bp.showOnHome,
          homeDisplay: bp.homeDisplay as HomeDisplayMode,
          views: bp.views,
          metaTitle: bp.metaTitle,
          metaTitleNp: bp.metaTitleNp,
          metaDescription: bp.metaDescription,
          metaDescriptionNp: bp.metaDescriptionNp,
          keywords: bp.keywords,
          keywordsNp: bp.keywordsNp,
          authorId: author.id,
          categoryId,
          province: bp.province ?? null,
          district: bp.district ?? null,
          auRegion: bp.auRegion ?? null,
          publishedAt,
          createdAt: when,
          updatedAt: when,
          tags: tagIds.length
            ? { connect: tagIds.map((id) => ({ id })) }
            : undefined,
        },
      });

      // Optional media row (idempotent by filename)
      const filename = `${bp.slug}.jpg`;
      const mediaExists = await prisma.media.findFirst({
        where: { filename },
        select: { id: true },
      });
      if (!mediaExists) {
        await prisma.media.create({
          data: {
            filename,
            url: image.url,
            mimeType: "image/jpeg",
            size: 180000,
            width: image.width,
            height: image.height,
            altText: image.alt,
            caption: bp.caption,
            folder: "seed-dev",
            uploaderId: author.id,
          },
        });
        summary.mediaCreated += 1;
      }

      summary.articlesCreated += 1;
      if (summary.articlesCreated % 20 === 0) {
        console.log(`  … created ${summary.articlesCreated}`);
      }
      void article;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      summary.errors.push(`${bp.slug}: ${msg}`);
      console.error(`  ✗ ${bp.slug}: ${msg}`);
    }
  }

  const afterArticles = await prisma.article.count();

  console.log("\n════════ Seed summary ════════");
  console.log(`Categories created/skipped: ${summary.categoriesCreated}/${summary.categoriesSkipped}`);
  console.log(`Tags created/skipped:       ${summary.tagsCreated}/${summary.tagsSkipped}`);
  console.log(`Articles created/skipped:   ${summary.articlesCreated}/${summary.articlesSkipped}`);
  console.log(`Media rows created:         ${summary.mediaCreated}`);
  console.log(`Article count before→after: ${beforeArticles} → ${afterArticles}`);
  console.log(`Authors used:               ${summary.authorsUsed.join(", ")}`);
  if (summary.errors.length) {
    console.log(`Errors (${summary.errors.length}):`);
    for (const err of summary.errors.slice(0, 15)) console.log(`  - ${err}`);
  }
  console.log("\nExisting records were not deleted or truncated.");
  console.log("Re-run safely: existing dev-seed-* slugs are skipped.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
