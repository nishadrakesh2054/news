/**
 * Tag / create sample Australia regional articles for homepage demo.
 *
 * Run: pnpm exec tsx prisma/seed-australia.ts
 */
import {
  PrismaClient,
  ArticleStatus,
  ArticleType,
  LanguageEdition,
  AuRegion,
} from "@prisma/client";

const prisma = new PrismaClient();

const SAMPLES: Array<{
  auRegion: AuRegion;
  title: string;
  titleNp: string;
  slug: string;
  excerpt: string;
  excerptNp: string;
}> = [
  {
    auRegion: AuRegion.NSW,
    title: "Sydney council expands Nepali community festival support",
    titleNp: "सिड्नी परिषद्ले नेपाली समुदायको महोत्सवमा सहयोग बढायो",
    slug: "au-nsw-sydney-nepali-festival-support",
    excerpt: "Local funding will help cultural groups host larger events this spring.",
    excerptNp: "यस वसन्तमा सांस्कृतिक समूहहरूले ठूला कार्यक्रम गर्न स्थानीय सहयोग पाउनेछन्।",
  },
  {
    auRegion: AuRegion.VIC,
    title: "Melbourne transport update affects weekend services",
    titleNp: "मेलबर्न यातायात अद्यावधिकले सप्ताहन्त सेवा प्रभावित",
    slug: "au-vic-melbourne-transport-weekend",
    excerpt: "Commuters are advised to check timetables before travelling.",
    excerptNp: "यात्रुहरूलाई यात्राअघि तालिका जाँच गर्न सुझाव दिइएको छ।",
  },
  {
    auRegion: AuRegion.QLD,
    title: "Brisbane weather alert issued for coastal suburbs",
    titleNp: "ब्रिस्बेन तटीय क्षेत्रका लागि मौसम चेतावनी",
    slug: "au-qld-brisbane-weather-alert",
    excerpt: "Heavy rain is expected overnight across southeast Queensland.",
    excerptNp: "दक्षिण-पूर्वी क्विन्सल्यान्डमा रातभरि भारी वर्षाको सम्भावना छ।",
  },
  {
    auRegion: AuRegion.SA,
    title: "Adelaide universities welcome more international students",
    titleNp: "एडिलेड विश्वविद्यालयहरूमा अन्तर्राष्ट्रिय विद्यार्थी बढ्दै",
    slug: "au-sa-adelaide-international-students",
    excerpt: "Enrolment numbers rose again in the latest intake period.",
    excerptNp: "नवीनतम भर्ना अवधिमा विद्यार्थी संख्या फेरि बढेको छ।",
  },
  {
    auRegion: AuRegion.WA,
    title: "Perth mining jobs drive draws skilled workers",
    titleNp: "पर्थ खानी रोजगारीले दक्ष कामदार तान्दै",
    slug: "au-wa-perth-mining-jobs",
    excerpt: "Employers report strong demand across engineering roles.",
    excerptNp: "इन्जिनियरिङ भूमिकाहरूमा रोजगारदाताहरूको माग उच्च रहेको छ।",
  },
  {
    auRegion: AuRegion.TAS,
    title: "Hobart tourism season opens with new ferry routes",
    titleNp: "होबार्ट पर्यटन सिजन नयाँ फेरी रुटसहित सुरु",
    slug: "au-tas-hobart-tourism-ferries",
    excerpt: "Operators expect higher visitor numbers over summer.",
    excerptNp: "सञ्चालकहरूले गर्मीमा बढी पर्यटकको अपेक्षा गरेका छन्।",
  },
  {
    auRegion: AuRegion.ACT,
    title: "Canberra policy briefing focuses on migration pathways",
    titleNp: "क्यानबरा नीति ब्रिफिङमा आप्रवासन मार्गमा जोड",
    slug: "au-act-canberra-migration-briefing",
    excerpt: "Community leaders urged clearer guidance for skilled visas.",
    excerptNp: "समुदायका नेताहरूले दक्ष भिसाका लागि स्पष्ट मार्गदर्शन मागे।",
  },
  {
    auRegion: AuRegion.NT,
    title: "Darwin festival highlights multicultural programmes",
    titleNp: "डार्विन महोत्सवमा बहुसांस्कृतिक कार्यक्रम",
    slug: "au-nt-darwin-multicultural-festival",
    excerpt: "Organisers say participation from diaspora groups is rising.",
    excerptNp: "आयोजकहरूका अनुसार डायस्पोरा समूहको सहभागिता बढ्दै छ।",
  },
  // Extra NSW/VIC so grids look full when filtering is off (mixed latest)
  {
    auRegion: AuRegion.NSW,
    title: "Western Sydney housing plan draws resident feedback",
    titleNp: "पश्चिमी सिड्नी आवास योजनामा बासिन्दाको प्रतिक्रिया",
    slug: "au-nsw-western-sydney-housing",
    excerpt: "Public consultation meetings continue through the month.",
    excerptNp: "सार्वजनिक परामर्श बैठक यस महिनाभर जारी रहनेछ।",
  },
  {
    auRegion: AuRegion.VIC,
    title: "Geelong sports complex upgrades near completion",
    titleNp: "गिलोङ खेलकुद परिसर स्तरोन्नति पूरा हुँदै",
    slug: "au-vic-geelong-sports-upgrade",
    excerpt: "New facilities are scheduled to open before the next season.",
    excerptNp: "नयाँ सुविधाहरू अर्को सिजनअघि खुल्ने तालिका छ।",
  },
  // Extra state stories so homepage sidebar (slots 3–6) is filled for layout checks
  {
    auRegion: AuRegion.QLD,
    title: "Gold Coast schools host Nepali language weekend classes",
    titleNp: "गोल्ड कोस्ट स्कुलमा नेपाली भाषा सप्ताहांत कक्षा",
    slug: "au-qld-gold-coast-nepali-classes",
    excerpt: "Volunteer teachers say enrolment has doubled this year.",
    excerptNp: "स्वयंसेवक शिक्षकहरूका अनुसार यस वर्ष भर्ना दोब्बर भएको छ।",
  },
  {
    auRegion: AuRegion.SA,
    title: "Adelaide market celebrates Himalayan food stalls",
    titleNp: "एडिलेड बजारमा हिमाली खाना स्टल मनाइयो",
    slug: "au-sa-adelaide-himalayan-food",
    excerpt: "Visitors lined up for momo and sel roti over the weekend.",
    excerptNp: "सप्ताहन्तमा मोमो र सेल रोटीका लागि दर्शक लाइनमा उभिए।",
  },
  {
    auRegion: AuRegion.WA,
    title: "Perth council plans new community hall in northern suburbs",
    titleNp: "पर्थ परिषद्ले उत्तरी उपनगरमा नयाँ सामुदायिक हल योजना",
    slug: "au-wa-perth-community-hall",
    excerpt: "Construction could begin early next year if funding is approved.",
    excerptNp: "बजेट स्वीकृत भए अर्को वर्षको सुरुमै निर्माण सुरु हुन सक्छ।",
  },
  {
    auRegion: AuRegion.TAS,
    title: "Launceston farmers market draws record weekend crowd",
    titleNp: "लन्सेस्टन किसान बजारमा रेकर्ड भीड",
    slug: "au-tas-launceston-farmers-market",
    excerpt: "Organisers credited fine weather and new local vendors.",
    excerptNp: "आयोजकहरूले राम्रो मौसम र नयाँ स्थानीय विक्रेतालाई श्रेय दिए।",
  },
  {
    auRegion: AuRegion.NSW,
    title: "Parramatta river clean-up attracts hundreds of volunteers",
    titleNp: "प्यारामाटा नदी सफाइमा सयौं स्वयंसेवक",
    slug: "au-nsw-paramatta-river-cleanup",
    excerpt: "Local groups collected waste along the foreshore trail.",
    excerptNp: "स्थानीय समूहहरूले तटवर्ती ट्रेलमा फोहोर संकलन गरे।",
  },
  {
    auRegion: AuRegion.VIC,
    title: "Footscray library expands multilingual newspaper section",
    titleNp: "फुटस्क्रे पुस्तकालयमा बहुभाषी पत्रिका खण्ड विस्तार",
    slug: "au-vic-footscray-multilingual-library",
    excerpt: "Nepali and Hindi titles were among the new additions.",
    excerptNp: "नेपाली र हिन्दी शीर्षक नयाँ थपिएका सामग्रीमध्ये छन्।",
  },
];

function bodyHtml(en: string, np: string) {
  return {
    content: `<p>${en}</p><p>This is sample Australia regional coverage for Echo Manch.</p>`,
    contentNp: `<p>${np}</p><p>यो इको मञ्चका लागि अष्ट्रेलिया क्षेत्रीय नमूना समाचार हो।</p>`,
  };
}

async function main() {
  const author =
    (await prisma.user.findFirst({ where: { role: "ADMIN" } })) ||
    (await prisma.user.findFirst());
  if (!author) {
    throw new Error("No user found — run main seed first.");
  }

  const category =
    (await prisma.category.findFirst({ where: { slug: "news" } })) ||
    (await prisma.category.findFirst());
  if (!category) {
    throw new Error("No category found — run main seed first.");
  }

  let created = 0;
  let updated = 0;

  for (let i = 0; i < SAMPLES.length; i++) {
    const sample = SAMPLES[i];
    const body = bodyHtml(sample.excerpt, sample.excerptNp);
    const publishedAt = new Date(Date.now() - i * 36e5);

    const existing = await prisma.article.findUnique({ where: { slug: sample.slug } });
    const coverImage = `https://picsum.photos/seed/${sample.slug}/800/500`;
    if (existing) {
      await prisma.article.update({
        where: { id: existing.id },
        data: {
          auRegion: sample.auRegion,
          status: ArticleStatus.PUBLISHED,
          publishedAt,
          title: sample.title,
          titleNp: sample.titleNp,
          excerpt: sample.excerpt,
          excerptNp: sample.excerptNp,
          coverImage,
        },
      });
      updated++;
      console.log(`↻ ${sample.auRegion} ${sample.slug}`);
      continue;
    }

    await prisma.article.create({
      data: {
        title: sample.title,
        titleNp: sample.titleNp,
        slug: sample.slug,
        excerpt: sample.excerpt,
        excerptNp: sample.excerptNp,
        ...body,
        status: ArticleStatus.PUBLISHED,
        type: ArticleType.STANDARD,
        languageEdition: LanguageEdition.BOTH,
        auRegion: sample.auRegion,
        authorId: author.id,
        categoryId: category.id,
        publishedAt,
        coverImage,
      },
    });
    created++;
    console.log(`✓ ${sample.auRegion} ${sample.slug}`);
  }

  console.log(`\nAustralia seed done. created=${created} updated=${updated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
