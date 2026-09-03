import { PrismaClient, AdSlot } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding sample news portal advertisement data...");

  const sampleAds = [
    {
      title: "Subisu High-Speed Optical Fiber Internet Special Offer 2026",
      slot: AdSlot.HEADER_LEADERBOARD,
      imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000&auto=format&fit=crop",
      targetUrl: "https://subisu.net.np",
      isActive: true,
      impressions: 14250,
      clicks: 620,
    },
    {
      title: "Nabil Bank Digital Mobile Banking App - Instant Personal Loans",
      slot: AdSlot.SIDEBAR_TOP,
      imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop",
      targetUrl: "https://nabilbank.com",
      isActive: true,
      impressions: 8900,
      clicks: 410,
    },
    {
      title: "Himalayan Airlines Special Domestic Fare Promo",
      slot: AdSlot.SIDEBAR_BOTTOM,
      imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop",
      targetUrl: "https://himalayanairlines.com",
      isActive: true,
      impressions: 6400,
      clicks: 280,
    },
    {
      title: "CG Electronics 4K Smart TV New Year Festival Offer",
      slot: AdSlot.IN_ARTICLE,
      imageUrl: "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=1000&auto=format&fit=crop",
      targetUrl: "https://cgelectronics.com.np",
      isActive: true,
      impressions: 19400,
      clicks: 890,
    },
    {
      title: "Nepal Telecom 5G Unlimited Night Data Pack & Voice Offer",
      slot: AdSlot.STICKY_FOOTER,
      imageUrl: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop",
      targetUrl: "https://ntc.net.np",
      isActive: true,
      impressions: 25600,
      clicks: 1120,
    },
    {
      title: "Google AdSense Responsive Auto Ads Unit",
      slot: AdSlot.IN_ARTICLE,
      scriptCode: `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>\n<!-- Article Inline Ad -->\n<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-1234567890123456" data-ad-slot="9876543210" data-ad-format="auto"></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`,
      isActive: true,
      impressions: 31200,
      clicks: 1450,
    },
  ];

  for (const ad of sampleAds) {
    const existing = await prisma.ad.findFirst({
      where: { title: ad.title },
    });
    if (!existing) {
      await prisma.ad.create({ data: ad });
      console.log(`✅ Created ad unit: ${ad.title}`);
    }
  }

  console.log("🎉 Advertisements seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
