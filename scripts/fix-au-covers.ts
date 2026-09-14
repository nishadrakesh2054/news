import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Stable Unsplash photos per region (editorial stock). */
const REGION_COVERS: Record<string, string> = {
  NSW: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=80",
  VIC: "https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1200&q=80",
  QLD: "https://images.unsplash.com/photo-1523482580745-df8e6f4ac8d3?w=1200&q=80",
  SA: "https://images.unsplash.com/photo-1590725121839-892b458a74fe?w=1200&q=80",
  WA: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=80",
  TAS: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
  ACT: "https://images.unsplash.com/photo-1524293581917-878a6d017c71?w=1200&q=80",
  NT: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80",
};

const FALLBACK =
  "https://images.unsplash.com/photo-1523482580745-df8e6f4ac8d3?w=1200&q=80";

function isPlaceholder(cover: string | null | undefined) {
  if (!cover?.trim()) return true;
  const src = cover.trim();
  return (
    src === "/logo/logo.png" ||
    src.endsWith("/logo/logo.png") ||
    src.includes("picsum.photos")
  );
}

async function main() {
  const rows = await prisma.article.findMany({
    where: { auRegion: { not: null } },
    select: { id: true, slug: true, coverImage: true, auRegion: true },
  });

  let updated = 0;
  for (const row of rows) {
    if (!isPlaceholder(row.coverImage)) continue;
    const cover =
      (row.auRegion && REGION_COVERS[row.auRegion]) || FALLBACK;
    await prisma.article.update({
      where: { id: row.id },
      data: { coverImage: cover },
    });
    updated += 1;
    console.log(`updated ${row.slug} -> ${row.auRegion}`);
  }
  console.log(`done: ${updated}/${rows.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
