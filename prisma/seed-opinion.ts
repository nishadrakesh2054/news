/**
 * Seed opinion / विचार articles for homepage “विचार र दृष्टिकोण”
 * Run: npx tsx prisma/seed-opinion.ts
 */
import {
  PrismaClient,
  ArticleStatus,
  ArticleType,
  LanguageEdition,
  Role,
} from "@prisma/client";

function resolveDatabaseUrl(): string {
  let raw = process.env.DATABASE_URL?.trim() || "";
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    raw = raw.slice(1, -1).trim();
  }
  if (!raw) return "";
  try {
    const url = new URL(raw);
    url.searchParams.delete("channel_binding");
    if (!url.searchParams.has("sslmode")) {
      url.searchParams.set("sslmode", "require");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

function loadEnvFiles() {
  const fs = require("fs") as typeof import("fs");
  const path = require("path") as typeof import("path");
  for (const name of [".env", ".env.local"]) {
    const file = path.join(process.cwd(), name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 0) continue;
      const k = t.slice(0, i).trim();
      let v = t.slice(i + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (process.env[k] === undefined || process.env[k] === "") {
        process.env[k] = v;
      }
    }
  }
}

loadEnvFiles();

const prisma = new PrismaClient({
  datasources: { db: { url: resolveDatabaseUrl() } },
});

function p(...paragraphs: string[]) {
  return paragraphs.map((text) => `<p>${text}</p>`).join("");
}

const OPINIONS = [
  {
    title: "Opinion: Nepal needs climate justice, not only sympathy",
    titleNp: "विचार: नेपाललाई सहानुभूति मात्र होइन, जलवायु न्याय चाहिन्छ",
    slug: "opinion-nepal-needs-climate-justice",
    excerpt:
      "Least-developed mountain nations face rising loss and damage; financing must match the science.",
    excerptNp:
      "अल्पविकसित हिमाली राष्ट्रहरूले बढ्दो क्षति बेहोरिरहेका छन्; विज्ञानअनुसारको वित्तपोषण आवश्यक छ।",
    content: p(
      "Nepal’s recent floods are not an isolated tragedy. They sit inside a wider pattern of glacial risk, extreme rainfall and fragile infrastructure.",
      "International forums often offer sympathy. What frontline communities need is predictable finance for early warning, resilient roads and social protection."
    ),
    contentNp: p(
      "हालैका बाढी एक्ला त्रासदी होइनन्। यी ग्लेसियर जोखिम, चरम वर्षा र कमजोर पूर्वाधारको फराकिलो चित्रसँग जोडिएका छन्।",
      "अन्तर्राष्ट्रिय मञ्चमा सहानुभूति धेरै आउँछ। अग्रपङ्क्ति समुदायलाई भने पूर्वसूचना, बलियो सडक र सामाजिक सुरक्षाका लागि भरपर्दो वित्त चाहिन्छ।"
    ),
    coverImage:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    hoursAgo: 6,
    views: 7650,
  },
  {
    title: "Federalism works only when local budgets reach citizens",
    titleNp: "संघीयता तब मात्र सफल हुन्छ जब स्थानीय बजेट नागरिकसम्म पुग्छ",
    slug: "opinion-federalism-local-budgets",
    excerpt:
      "Devolution without timely grants and clear audit trails leaves municipalities stuck between promise and delivery.",
    excerptNp:
      "समयमै अनुदान र स्पष्ट लेखापरीक्षण बिना विकेन्द्रीकरणले स्थानीय तहलाई वाचा र कार्यान्वयनबीच अड्काउँछ।",
    content: p(
      "Federalism was sold as nearer government. In practice, many wards still wait months for capital grants while needs are immediate.",
      "Transparency on conditional grants and simpler procurement for small projects would do more for trust than another slogan campaign."
    ),
    contentNp: p(
      "संघीयता नजिकको शासनका रूपमा प्रस्तुत भएको थियो। व्यवहारमा धेरै वडा अझै पुँजीगत अनुदान कुर्दै छन् भने आवश्यकता तत्काल छ।",
      "सशर्त अनुदानमा पारदर्शिता र साना आयोजनाका लागि सरल खरिद प्रक्रिया नारामुखी अभियानभन्दा बढी विश्वास जन्माउँछ।"
    ),
    coverImage:
      "https://images.unsplash.com/photo-1529107382642-6b286daa0f20?auto=format&fit=crop&w=1200&q=80",
    hoursAgo: 14,
    views: 4320,
  },
  {
    title: "Youth migration is not only a remittance story",
    titleNp: "युवा पलायन रेमिट्यान्सको कथा मात्र होइन",
    slug: "opinion-youth-migration-beyond-remittance",
    excerpt:
      "Families celebrate foreign jobs, but schools, farms and local enterprises quietly lose the next generation of builders.",
    excerptNp:
      "विदेशी रोजगारी परिवारले मनाउँछन्, तर विद्यालय, खेती र स्थानीय उद्यमले अर्को पुस्ताका निर्माता चुपचाप गुमाइरहेका छन्।",
    content: p(
      "Remittances keep household cash flowing. That is real. So is the thinning of skilled labour in mid-hills and small towns.",
      "Policy should pair safe migration with credible domestic opportunity—skills, credit and dignified work—not guilt-trip those who leave."
    ),
    contentNp: p(
      "रेमिट्यान्सले घरपरिवारको नगद प्रवाह जोगाउँछ। यो सत्य हो। मध्यपहाड र साना सहरमा दक्ष श्रम पातलिँदै जानु पनि उत्तिकै सत्य हो।",
      "नीतिले सुरक्षित आप्रवासनसँगै स्वदेशमै भरपर्दो अवसर—सीप, कर्जा र मर्यादित रोजगारी—जोड्नुपर्छ; जानेलाई दोषी ठहराएर होइन।"
    ),
    coverImage:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    hoursAgo: 28,
    views: 5890,
  },
  {
    title: "Public transport reform needs riders, not only new buses",
    titleNp: "सार्वजनिक यातायात सुधारलाई नयाँ बस मात्र होइन, यात्रु चाहिन्छ",
    slug: "opinion-public-transport-riders-first",
    excerpt:
      "Fleet upgrades fail if routes stay opaque, stops unsafe and ticketing fragmented across operators.",
    excerptNp:
      "रुट अस्पष्ट, स्टप असुरक्षित र टिकट प्रणाली टुक्रिएको रहँदासम्म फ्लिट स्तरोन्नतिले मात्र काम गर्दैन।",
    content: p(
      "Kathmandu keeps buying the idea of modern buses. Riders keep asking for reliable frequency and last-mile walking safety.",
      "Integrate routes, publish live schedules, and treat sidewalks as part of the transit system—or cars will keep winning by default."
    ),
    contentNp: p(
      "काठमाडौँले आधुनिक बसको कल्पना किनिरहेको छ। यात्रुले भरपर्दो फ्रिक्वेन्सी र अन्तिम माइलको पैदल सुरक्षा मागिरहेका छन्।",
      "रुट एकीकृत गर्नुहोस्, लाइभ तालिका सार्वजनिक गर्नुहोस्, र फुटपाथलाई यातायात प्रणालीकै भाग मान्नुहोस्—नत्र कार नै पूर्वनिर्धारित विकल्प बनिरहन्छ।"
    ),
    coverImage:
      "https://images.unsplash.com/photo-1544620341-73adc401eb00?auto=format&fit=crop&w=1200&q=80",
    hoursAgo: 36,
    views: 3180,
  },
];

async function main() {
  console.log("🌱 Seeding opinion / विचार articles…");

  const author =
    (await prisma.user.findFirst({ where: { role: Role.ADMIN } })) ||
    (await prisma.user.findFirst({ where: { role: Role.EDITOR } }));

  if (!author) {
    throw new Error("No admin/editor user found. Run the main seed first.");
  }

  const category = await prisma.category.upsert({
    where: { slug: "opinion" },
    update: {
      name: "Opinion",
      nameNp: "विचार",
      description: "Editorials and analysis",
      descriptionNp: "सम्पादकीय तथा विश्लेषण",
    },
    create: {
      name: "Opinion",
      nameNp: "विचार",
      slug: "opinion",
      order: 6,
      description: "Editorials and analysis",
      descriptionNp: "सम्पादकीय तथा विश्लेषण",
    },
  });

  for (const art of OPINIONS) {
    const publishedAt = new Date(Date.now() - art.hoursAgo * 60 * 60 * 1000);

    await prisma.article.upsert({
      where: { slug: art.slug },
      update: {
        title: art.title,
        titleNp: art.titleNp,
        excerpt: art.excerpt,
        excerptNp: art.excerptNp,
        content: art.content,
        contentNp: art.contentNp,
        coverImage: art.coverImage,
        caption: "स्तम्भ / Column — इको माञ्च",
        status: ArticleStatus.PUBLISHED,
        type: ArticleType.OPINION,
        languageEdition: LanguageEdition.BOTH,
        isFeatured: false,
        isBreaking: false,
        views: art.views,
        authorId: author.id,
        categoryId: category.id,
        publishedAt,
        metaTitle: `${art.title} | Echo Manch`,
        metaTitleNp: `${art.titleNp} | इको माञ्च`,
        metaDescription: art.excerpt,
        metaDescriptionNp: art.excerptNp,
        keywords: "opinion, editorial, Nepal",
        keywordsNp: "विचार, सम्पादकीय, नेपाल",
      },
      create: {
        title: art.title,
        titleNp: art.titleNp,
        slug: art.slug,
        excerpt: art.excerpt,
        excerptNp: art.excerptNp,
        content: art.content,
        contentNp: art.contentNp,
        coverImage: art.coverImage,
        caption: "स्तम्भ / Column — इको माञ्च",
        status: ArticleStatus.PUBLISHED,
        type: ArticleType.OPINION,
        languageEdition: LanguageEdition.BOTH,
        isFeatured: false,
        isBreaking: false,
        views: art.views,
        authorId: author.id,
        categoryId: category.id,
        publishedAt,
        metaTitle: `${art.title} | Echo Manch`,
        metaTitleNp: `${art.titleNp} | इको माञ्च`,
        metaDescription: art.excerpt,
        metaDescriptionNp: art.excerptNp,
        keywords: "opinion, editorial, Nepal",
        keywordsNp: "विचार, सम्पादकीय, नेपाल",
      },
    });

    console.log(`  ✓ ${art.slug}`);
  }

  const count = await prisma.article.count({
    where: {
      status: ArticleStatus.PUBLISHED,
      OR: [
        { type: ArticleType.OPINION },
        { category: { slug: "opinion" } },
      ],
    },
  });

  console.log(`🎉 Opinion seed done — published opinion articles: ${count}`);
}

main()
  .catch((e) => {
    console.error("❌ Opinion seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
