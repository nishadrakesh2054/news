/**
 * Consolidate categories to the canonical 12.
 * Moves all articles; never deletes articles. Removes empty leftover categories.
 * Adds public redirects for old /category/{slug} paths.
 *
 * Run: pnpm exec tsx prisma/merge-categories-12.ts
 */
import { PrismaClient } from "@prisma/client";
import {
  CANONICAL_CATEGORIES,
  CATEGORY_SLUG_REDIRECTS,
} from "../constants/categories";

const prisma = new PrismaClient();

async function ensureCategory(def: (typeof CANONICAL_CATEGORIES)[number]) {
  const bySlug = await prisma.category.findUnique({ where: { slug: def.slug } });
  if (bySlug) {
    return prisma.category.update({
      where: { id: bySlug.id },
      data: {
        name: def.name,
        nameNp: def.nameNp,
        order: def.order,
        description: def.description,
        descriptionNp: def.descriptionNp,
      },
    });
  }

  // Rename the first legacy slug into the new canonical slug (keeps category id stable).
  const primaryLegacy = def.mergeFromSlugs.find((s) => s !== def.slug);
  if (primaryLegacy) {
    const legacy = await prisma.category.findUnique({ where: { slug: primaryLegacy } });
    if (legacy) {
      const nameClash = await prisma.category.findFirst({
        where: { name: def.name, NOT: { id: legacy.id } },
      });
      if (nameClash) {
        // Free the name by temporarily renaming the clash holder
        await prisma.category.update({
          where: { id: nameClash.id },
          data: { name: `${nameClash.name} (legacy)` },
        });
      }
      return prisma.category.update({
        where: { id: legacy.id },
        data: {
          slug: def.slug,
          name: def.name,
          nameNp: def.nameNp,
          order: def.order,
          description: def.description,
          descriptionNp: def.descriptionNp,
        },
      });
    }
  }

  return prisma.category.create({
    data: {
      name: def.name,
      nameNp: def.nameNp,
      slug: def.slug,
      order: def.order,
      description: def.description,
      descriptionNp: def.descriptionNp,
    },
  });
}

async function main() {
  console.log("🔀 Merging categories → canonical 12…\n");

  const beforeCats = await prisma.category.count();
  const beforeArticles = await prisma.article.count();

  const targetIds: Record<string, string> = {};

  for (const def of CANONICAL_CATEGORIES) {
    const row = await ensureCategory(def);
    targetIds[def.slug] = row.id;
    console.log(`✓ ${def.order}. ${def.slug}`);
  }

  for (const def of CANONICAL_CATEGORIES) {
    const targetId = targetIds[def.slug];
    for (const fromSlug of def.mergeFromSlugs) {
      if (fromSlug === def.slug) continue;
      const source = await prisma.category.findUnique({ where: { slug: fromSlug } });
      if (!source || source.id === targetId) continue;

      const moved = await prisma.article.updateMany({
        where: { categoryId: source.id },
        data: { categoryId: targetId },
      });
      console.log(`  ← ${moved.count} articles: ${fromSlug} → ${def.slug}`);
    }
  }

  const all = await prisma.category.findMany({
    select: { id: true, slug: true, _count: { select: { articles: true } } },
  });
  const keep = new Set(CANONICAL_CATEGORIES.map((c) => c.slug));

  for (const cat of all) {
    if (keep.has(cat.slug)) continue;
    if (cat._count.articles > 0) {
      const moved = await prisma.article.updateMany({
        where: { categoryId: cat.id },
        data: { categoryId: targetIds.national },
      });
      console.log(`  ! leftover ${cat.slug}: ${moved.count} → national`);
    }
    await prisma.category.delete({ where: { id: cat.id } });
    console.log(`  − deleted ${cat.slug}`);
  }

  for (const [from, to] of Object.entries(CATEGORY_SLUG_REDIRECTS)) {
    const fromPath = `/category/${from}`;
    const toPath = `/category/${to}`;
    await prisma.redirect.upsert({
      where: { fromPath },
      create: { fromPath, toPath, isActive: true },
      update: { toPath, isActive: true },
    });
    console.log(`  ↗ ${fromPath} → ${toPath}`);
  }

  const afterCats = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: {
      slug: true,
      name: true,
      nameNp: true,
      order: true,
      _count: { select: { articles: true } },
    },
  });
  const afterArticles = await prisma.article.count();

  console.log("\n════════ Result ════════");
  console.log(`Categories: ${beforeCats} → ${afterCats.length}`);
  console.log(`Articles:   ${beforeArticles} → ${afterArticles}`);
  for (const c of afterCats) {
    console.log(
      `  ${String(c.order).padStart(2)}. ${c.slug.padEnd(22)} ${c.nameNp} / ${c.name} (${c._count.articles})`
    );
  }

  if (afterArticles !== beforeArticles) {
    throw new Error("Article count changed unexpectedly");
  }
  if (afterCats.length !== 12) {
    throw new Error(`Expected 12 categories, got ${afterCats.length}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
