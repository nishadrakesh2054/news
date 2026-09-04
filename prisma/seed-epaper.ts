/**
 * Seed demo E-paper editions for /epaper
 * Run: pnpm exec tsx prisma/seed-epaper.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Public sample PDFs suitable for iframe / download demos */
const SAMPLE_PDF =
  "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf";
const SAMPLE_PDF_ALT =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

function daysAgo(n: number) {
  const d = new Date();
  d.setHours(6, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

const editions = [
  {
    title: "आर्थिक वर्ष २०८३/८४ को बजेट वक्तव्य",
    pdfUrl: SAMPLE_PDF,
    coverImage: "https://placehold.co/400x500/c4a574/1a1a1a?text=Budget+2083%2F84",
    publishDate: daysAgo(0),
  },
  {
    title: "नीति तथा कार्यक्रम २०८३",
    pdfUrl: SAMPLE_PDF_ALT,
    coverImage: "https://placehold.co/400x500/ffffff/c41e3a?text=Policy+2083",
    publishDate: daysAgo(1),
  },
  {
    title: "नेपालको वर्तमान आर्थिक स्थितिपत्र",
    pdfUrl: SAMPLE_PDF,
    coverImage: "https://placehold.co/400x500/f5f5f5/1957a6?text=Economic+Status",
    publishDate: daysAgo(2),
  },
  {
    title: "सुशासन मार्गचित्र — २०८२",
    pdfUrl: SAMPLE_PDF_ALT,
    coverImage: "https://placehold.co/400x500/0c4ea0/ffffff?text=Governance+2082",
    publishDate: daysAgo(3),
  },
  {
    title: "इको मञ्च दैनिक — आजको संस्करण",
    pdfUrl: SAMPLE_PDF,
    coverImage: "https://placehold.co/400x500/1957A6/ffffff?text=Daily+E-Paper",
    publishDate: daysAgo(0),
  },
];

async function main() {
  console.log("🌱 Seeding E-paper editions…");

  let created = 0;
  let updated = 0;

  for (const edition of editions) {
    const existing = await prisma.ePaper.findFirst({
      where: { title: edition.title },
    });

    if (existing) {
      await prisma.ePaper.update({
        where: { id: existing.id },
        data: {
          pdfUrl: edition.pdfUrl,
          coverImage: edition.coverImage,
          publishDate: edition.publishDate,
        },
      });
      updated += 1;
      console.log(`↻ Updated: ${edition.title}`);
    } else {
      await prisma.ePaper.create({ data: edition });
      created += 1;
      console.log(`✅ Created: ${edition.title}`);
    }
  }

  const total = await prisma.ePaper.count();
  console.log(`🎉 E-paper seed done — created=${created}, updated=${updated}, total=${total}`);
}

main()
  .catch((e) => {
    console.error("❌ E-paper seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
