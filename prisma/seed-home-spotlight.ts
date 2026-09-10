/**
 * Mark sample published articles for homepage spotlight.
 *
 * Run: pnpm exec tsx prisma/seed-home-spotlight.ts
 */
import { PrismaClient, ArticleStatus, HomeDisplayMode } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const published = await prisma.article.findMany({
    where: { status: ArticleStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    take: 4,
    select: { id: true, title: true, titleNp: true, coverImage: true, excerpt: true },
  });

  if (published.length === 0) {
    console.log("No published articles found. Publish articles first, then re-run.");
    return;
  }

  // First two: title only; next two (if any): title + image + excerpt
  for (let i = 0; i < published.length; i++) {
    const article = published[i];
    const withMedia = i >= 2;
    await prisma.article.update({
      where: { id: article.id },
      data: {
        showOnHome: true,
        homeDisplay: withMedia ? HomeDisplayMode.TITLE_MEDIA : HomeDisplayMode.TITLE_ONLY,
        homeOrder: i + 1,
        // Ensure media items have some excerpt text for demo
        ...(withMedia && !article.excerpt
          ? {
              excerpt: "Sample excerpt for homepage spotlight layout.",
              excerptNp: "होमपेज स्पॉटलाइट लेआउटका लागि नमूना अंश।",
            }
          : {}),
      },
    });
    console.log(
      `✓ ${withMedia ? "TITLE_MEDIA" : "TITLE_ONLY"} → ${article.titleNp || article.title}`
    );
  }

  console.log(`\nSeeded ${published.length} homepage spotlight article(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
