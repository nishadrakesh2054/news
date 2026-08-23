import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding initial media assets...");

  const sampleMedia = [
    {
      filename: "kathmandu-air-pollution-campaign.webp",
      url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop",
      mimeType: "image/webp",
      size: 245000,
      width: 1200,
      height: 800,
      altText: "Air pollution campaign in Kathmandu valley",
      caption: "Kathmandu Valley Environmental Initiative",
      folder: "articles",
    },
    {
      filename: "nepal-cricket-victory-celebration.webp",
      url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1000&auto=format&fit=crop",
      mimeType: "image/webp",
      size: 310000,
      width: 1200,
      height: 800,
      altText: "Nepal national cricket team celebrating win",
      caption: "International Cricket Series Highlights",
      folder: "articles",
    },
    {
      filename: "nrb-[#027081]-policy-review.webp",
      url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1000&auto=format&fit=crop",
      mimeType: "image/webp",
      size: 198000,
      width: 1200,
      height: 800,
      altText: "Nepal Rastra Bank central office monetary review",
      caption: "Central Bank Press Release",
      folder: "articles",
    },
    {
      filename: "nepal-trekking-tourism-season.webp",
      url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop",
      mimeType: "image/webp",
      size: 412000,
      width: 1200,
      height: 800,
      altText: "Foreign tourists trekking in Annapurna circuit",
      caption: "Autumn Tourism Season Peak",
      folder: "articles",
    },
    {
      filename: "brand-header-banner-ad.webp",
      url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000&auto=format&fit=crop",
      mimeType: "image/webp",
      size: 145000,
      width: 970,
      height: 250,
      altText: "Official Sponsor Header Banner",
      caption: "Corporate Advertisement",
      folder: "ads",
    },
  ];

  for (const m of sampleMedia) {
    const existing = await prisma.media.findFirst({
      where: { filename: m.filename },
    });
    if (!existing) {
      await prisma.media.create({ data: m });
      console.log(`✅ Created media asset: ${m.filename}`);
    }
  }

  console.log("🎉 Initial media seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
