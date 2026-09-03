/**
 * Echo Manch demo seed — bilingual (Nepali + English) sample data
 * Topics inspired by public news feeds; article text is original demo copy for Echo Manch.
 *
 * Run: pnpm prisma db seed
 */
import {
  PrismaClient,
  Role,
  ArticleStatus,
  ArticleType,
  LanguageEdition,
  AdSlot,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function p(...paragraphs: string[]) {
  return paragraphs.map((text) => `<p>${text}</p>`).join("");
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

type SeedArticle = {
  title: string;
  titleNp: string;
  slug: string;
  excerpt: string;
  excerptNp: string;
  content: string;
  contentNp: string;
  coverImage: string;
  caption: string;
  status: ArticleStatus;
  type: ArticleType;
  languageEdition: LanguageEdition;
  isFeatured: boolean;
  isBreaking: boolean;
  views: number;
  metaTitle: string;
  metaTitleNp: string;
  metaDescription: string;
  metaDescriptionNp: string;
  keywords: string;
  keywordsNp: string;
  categorySlug: string;
  province?: number;
  district?: string;
  tagSlugs?: string[];
  hoursAgo?: number;
};

async function main() {
  console.log("🌱 Seeding Echo Manch bilingual demo data…");

  const adminEmail = "nishadrakesh2054@gmail.com";
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword, role: Role.ADMIN },
    create: {
      name: "निषाद राकेश (प्रधान सम्पादक)",
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: "editor@echomanchs.com" },
    update: { password: hashedPassword, role: Role.EDITOR },
    create: {
      name: "सम्पादकीय टोली / Desk Editor",
      email: "editor@echomanchs.com",
      password: hashedPassword,
      role: Role.EDITOR,
    },
  });

  console.log(`✅ Users ready: ${admin.email}, ${editor.email}`);

  const categoriesData = [
    {
      name: "Politics",
      nameNp: "राजनीति",
      slug: "politics",
      order: 1,
      desc: "National and international politics",
      descNp: "राष्ट्रिय तथा अन्तर्राष्ट्रिय राजनीति",
    },
    {
      name: "Economy",
      nameNp: "अर्थतन्त्र",
      slug: "economy",
      order: 2,
      desc: "Markets, banks, budget and business",
      descNp: "बजार, बैंक, बजेट र व्यापार",
    },
    {
      name: "Society",
      nameNp: "समाज",
      slug: "society",
      order: 3,
      desc: "Social affairs and public interest",
      descNp: "सामाजिक सरोकार र जनहितका विषय",
    },
    {
      name: "Sports",
      nameNp: "खेलकुद",
      slug: "sports",
      order: 4,
      desc: "Cricket, football and national sports",
      descNp: "क्रिकेट, फुटबल र राष्ट्रिय खेलकुद",
    },
    {
      name: "Entertainment",
      nameNp: "मनोरञ्जन",
      slug: "entertainment",
      order: 5,
      desc: "Film, music and culture",
      descNp: "चलचित्र, संगीत र संस्कृति",
    },
    {
      name: "Opinion",
      nameNp: "विचार",
      slug: "opinion",
      order: 6,
      desc: "Editorials and analysis",
      descNp: "सम्पादकीय र विश्लेषण",
    },
    {
      name: "Technology",
      nameNp: "प्रविधि",
      slug: "technology",
      order: 7,
      desc: "Digital tech and innovation",
      descNp: "डिजिटल प्रविधि र नवप्रवर्तन",
    },
    {
      name: "World",
      nameNp: "विश्व",
      slug: "world",
      order: 8,
      desc: "International news",
      descNp: "अन्तर्राष्ट्रिय समाचार",
    },
    { name: "Lifestyle", nameNp: "जीवनशैली", slug: "lifestyle", order: 9, desc: "Health, travel and culture" },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        nameNp: cat.nameNp,
        order: cat.order,
        description: cat.desc,
        descriptionNp: cat.descNp,
      },
      create: {
        name: cat.name,
        nameNp: cat.nameNp,
        slug: cat.slug,
        description: cat.desc,
        descriptionNp: cat.descNp,
        order: cat.order,
      },
    });
    categoryMap[cat.slug] = row.id;
  }
  console.log(`✅ Categories: ${Object.keys(categoryMap).length}`);

  const tagsData = [
    { name: "Flood", slug: "flood" },
    { name: "Rasuwa", slug: "rasuwa" },
    { name: "Climate", slug: "climate" },
    { name: "Cricket", slug: "cricket" },
    { name: "Parliament", slug: "parliament" },
    { name: "Banking", slug: "banking" },
    { name: "Tourism", slug: "tourism" },
    { name: "5G", slug: "5g" },
    { name: "Film", slug: "film" },
    { name: "Hydropower", slug: "hydropower" },
  ];
  const tagMap: Record<string, string> = {};
  for (const tag of tagsData) {
    const row = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: { name: tag.name, slug: tag.slug },
    });
    tagMap[tag.slug] = row.id;
  }
  console.log(`✅ Tags: ${Object.keys(tagMap).length}`);

  const articles: SeedArticle[] = [
    {
      title: "DNA testing begins to identify missing flood victims",
      titleNp: "बाढीमा बेपत्ता नागरिक पहिचान गर्न डीएनए परीक्षण सुरु",
      slug: "dna-testing-missing-flood-victims-2026",
      excerpt:
        "Police have opened DNA registration for first-degree relatives of people still missing after the Bhotekoshi floods.",
      excerptNp:
        "भोटेकोशी बाढीपछि सम्पर्कविहीन नागरिकका पहिलो पुस्ताका नातेदारलाई डीएनए परीक्षणका लागि आह्वान गरिएको छ।",
      content: p(
        "<strong>Kathmandu.</strong> Nepal Police has started a DNA testing drive to help identify citizens still missing after devastating floods along the Bhotekoshi corridor in Rasuwa.",
        "Families living in Nepal and abroad are asked to complete registration so samples can be matched with unidentified remains recovered in recent days.",
        "Officials said temporary mortuary capacity remains limited, which makes scientific identification urgent for grieving relatives.",
        "Echo Manch will continue tracking district updates from Rasuwa, Nuwakot and Dhading."
      ),
      contentNp: p(
        "<strong>काठमाडौँ।</strong> रसुवाको भोटेकोशी क्षेत्रमा आएको विनाशकारी बाढीपछि सम्पर्कविहीन रहेका नागरिकको पहिचानका लागि प्रहरीले डीएनए परीक्षण प्रक्रिया सुरु गरेको छ।",
        "स्वदेश तथा विदेशमा रहेका बेपत्ता नागरिकका पहिलो पुस्ताका नातेदारले प्रक्रिया पूरा गरी नमूना दर्ता गर्नुपर्ने जानकारी दिइएको छ।",
        "सीमित शवगृह क्षमताका कारण पहिचान नभएका शवको व्यवस्थापन चुनौतीपूर्ण बनेकाले वैज्ञानिक पहिचानलाई प्राथमिकता दिइएको अधिकारीहरू बताउँछन्।",
        "इको माञ्चले रसुवा, नुवाकोट र धादिङका अपडेट निरन्तर अनुगमन गर्नेछ।"
      ),
      coverImage: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1200&q=80",
      caption: "Photo: rescue and identification efforts after floods",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.BREAKING,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: true,
      isBreaking: true,
      views: 15420,
      metaTitle: "DNA testing for missing flood victims | Echo Manch",
      metaTitleNp: "बाढी बेपत्ता पहिचानमा डीएनए परीक्षण | इको माञ्च",
      metaDescription: "Police open DNA registration for families of missing Bhotekoshi flood victims.",
      metaDescriptionNp: "भोटेकोशी बाढीमा बेपत्ता नागरिकका नातेदारलाई डीएनए परीक्षण आह्वान।",
      keywords: "flood, DNA, Rasuwa, Nepal",
      keywordsNp: "बाढी, डीएनए, रसुवा, नेपाल",
      categorySlug: "society",
      province: 3,
      district: "Rasuwa",
      tagSlugs: ["flood", "rasuwa"],
      hoursAgo: 2,
    },
    {
      title: "Power restored in most of Nuwakot after Rasuwa flood damage",
      titleNp: "रसुवा बाढीपछि नुवाकोटमा विद्युत् सेवा धेरैजसो पुनर्स्थापित",
      slug: "nuwakot-power-restored-after-rasuwa-flood",
      excerpt:
        "Energy authorities say about 90 percent of disrupted electricity supply in Nuwakot has been restored.",
      excerptNp:
        "ऊर्जा मन्त्रालयका अनुसार नुवाकोटमा अवरुद्ध विद्युत् आपूर्ति करिब ९० प्रतिशत पुनर्स्थापित भएको छ।",
      content: p(
        "<strong>Kathmandu.</strong> Electricity disrupted by the Bhotekoshi flood cascade has been restored across most of Nuwakot, officials said.",
        "Technical teams are still clearing debris near transmission corridors and hydropower facilities that were hit by mud and rock flows.",
        "Households in remote wards may face intermittent outages until backup lines are fully stabilized."
      ),
      contentNp: p(
        "<strong>काठमाडौँ।</strong> भोटेकोशी बाढीले अवरुद्ध गरेको नुवाकोटको विद्युत् आपूर्ति अधिकांश क्षेत्रमा फर्किएको ऊर्जा अधिकारीहरूले बताएका छन्।",
        "प्रसारण लाइन र जलविद्युत् संरचना वरिपरि जमेको लेदो तथा ढुंगा हटाउने काम जारी छ।",
        "दुर्गम वडाहरूमा भने पूर्ण स्थिरता आउन्जेल आंशिक अवरोध रहन सक्ने जानकारी दिइएको छ।"
      ),
      coverImage: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80",
      caption: "Photo: power infrastructure recovery",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.STANDARD,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: true,
      isBreaking: false,
      views: 9210,
      metaTitle: "Nuwakot power mostly restored | Echo Manch",
      metaTitleNp: "नुवाकोटमा विद्युत् पुनर्स्थापना | इको माञ्च",
      metaDescription: "About 90% of Nuwakot electricity restored after Rasuwa flood damage.",
      metaDescriptionNp: "रसुवा बाढीपछि नुवाकोटमा करिब ९० प्रतिशत विद्युत् सेवा फर्कियो।",
      keywords: "electricity, Nuwakot, flood, hydropower",
      keywordsNp: "विद्युत्, नुवाकोट, बाढी, जलविद्युत्",
      categorySlug: "economy",
      province: 3,
      district: "Nuwakot",
      tagSlugs: ["flood", "hydropower"],
      hoursAgo: 5,
    },
    {
      title: "Nepal bowl Malaysia out for 103 in ACC Premier Cup",
      titleNp: "एसीसी प्रिमियर कप: नेपालले मलेसियालाई १०३ रनमा अलआउट",
      slug: "nepal-bowl-malaysia-out-acc-premier-cup",
      excerpt:
        "Nepal’s bowlers shared the wickets as host Malaysia were dismissed cheaply in the second match of the tournament.",
      excerptNp:
        "एसीसी प्रिमियर कपको दोस्रो खेलमा नेपाली बलरहरूको दमदार प्रदर्शनसँगै मलेसिया १०३ रनमा अलआउट भयो।",
      content: p(
        "<strong>Kuala Lumpur.</strong> Nepal produced a clinical bowling display to dismiss Malaysia for 103 in the ACC Premier Cup.",
        "Seamers struck early and a late spin burst prevented any lower-order recovery, leaving Nepal in a strong position.",
        "Fans at home celebrated another confident showing from the national side on the regional stage."
      ),
      contentNp: p(
        "<strong>क्वालालम्पुर।</strong> एसीसी प्रिमियर कपअन्तर्गत नेपालले आयोजक मलेसियालाई १०३ रनमा अलआउट गर्दै बलरहरूको उत्कृष्ट प्रदर्शन देखाएको छ।",
        "सुरुवाती ओभरमै विकेट झार्दै नेपाली सिमरहरूले दबाब सिर्जना गरे भने स्पिनरहरूले तल्लो क्रमलाई रोके।",
        "स्वदेशी समर्थकहरूले क्षेत्रीय मञ्चमा नेपाली टोलीको यो प्रदर्शनलाई उत्साहजनक मानेका छन्।"
      ),
      coverImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80",
      caption: "Photo: Nepal cricket action",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.STANDARD,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: false,
      isBreaking: true,
      views: 18750,
      metaTitle: "Nepal dismiss Malaysia for 103 | Echo Manch",
      metaTitleNp: "नेपालले मलेसियालाई १०३ मा समेट्यो | इको माञ्च",
      metaDescription: "Nepal bowling unit restricts Malaysia to 103 in ACC Premier Cup.",
      metaDescriptionNp: "एसीसी प्रिमियर कपमा नेपाली बलरहरूको दमदार प्रदर्शन।",
      keywords: "cricket, Nepal, ACC, Malaysia",
      keywordsNp: "क्रिकेट, नेपाल, एसीसी, मलेसिया",
      categorySlug: "sports",
      tagSlugs: ["cricket"],
      hoursAgo: 4,
    },
    {
      title: "PM flags rising climate risks after glacial flood warnings",
      titleNp: "ग्लेसियर बाढीको चेतावनीसँगै प्रधानमन्त्रीले जलवायु जोखिममा जोड दिए",
      slug: "pm-climate-risk-glacial-flood-warning",
      excerpt:
        "The government says Nepal needs stronger early-warning systems as scientists warn of more cascading mountain disasters.",
      excerptNp:
        "वैज्ञानिकहरूले हिमाली क्षेत्रमा थप विपद्को चेतावनी दिएसँगै सरकारले पूर्वसूचना प्रणाली बलियो बनाउनुपर्ने बताएको छ।",
      content: p(
        "<strong>Kathmandu.</strong> The Prime Minister warned that climate risks are growing after researchers flagged unusual glacier movement near Langtang.",
        "Officials said investment in sensors, community drills and cross-border data sharing will be prioritized in the recovery plan.",
        "Nepal contributes little to global emissions yet faces outsized Himalayan hazards, climate advocates noted."
      ),
      contentNp: p(
        "<strong>काठमाडौँ।</strong> लान्ताङ क्षेत्रमा असामान्य ग्लेसियर गतिविधिबारे अध्ययन सार्वजनिक भएसँगै प्रधानमन्त्रीले जलवायु जोखिम बढिरहेको चेतावनी दिएका छन्।",
        "पुनर्निर्माण योजनामा सेन्सर, सामुदायिक अभ्यास र सीमापार सूचना आदानप्रदानलाई प्राथमिकता दिइने अधिकारीहरूको भनाइ छ।",
        "नेपालको उत्सर्जन न्यून भए पनि हिमाली विपद्को मार ठूलो रहेको जलवायु अभियन्ताहरू बताउँछन्।"
      ),
      coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      caption: "Photo: Himalayan landscape",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.FEATURE,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: true,
      isBreaking: false,
      views: 11200,
      metaTitle: "PM warns on glacial flood climate risks | Echo Manch",
      metaTitleNp: "ग्लेसियर बाढी र जलवायु जोखिम | इको माञ्च",
      metaDescription: "Government prioritizes early warning after glacial hazard alerts.",
      metaDescriptionNp: "ग्लेसियर विपद् चेतावनीपछि पूर्वसूचना प्रणालीमा जोड।",
      keywords: "climate, glacier, PM, Langtang",
      keywordsNp: "जलवायु, ग्लेसियर, प्रधानमन्त्री, लान्ताङ",
      categorySlug: "politics",
      province: 3,
      tagSlugs: ["climate", "flood"],
      hoursAgo: 8,
    },
    {
      title: "Trishuli-3A cable duct cleared of heavy flood debris",
      titleNp: "त्रिशूली–३ए केबल डक्टबाट बाढीको लेदो–ढुंगा सफाइ तीव्र",
      slug: "trishuli-3a-cable-duct-debris-clearance",
      excerpt:
        "Workers removed thousands of cubic metres of mud and stone blocking the hydropower project’s cable duct portal.",
      excerptNp:
        "जलविद्युत् आयोजनाको केबल डक्ट प्रवेशद्वार अवरुद्ध गर्ने हजारौं घनमिटर लेदो–ढुंगा हटाइएको छ।",
      content: p(
        "<strong>Kathmandu.</strong> Cleanup crews intensified work at Trishuli-3A after flood debris sealed the cable duct entrance.",
        "Project engineers said restoring safe access is essential before generation can return to normal levels.",
        "The flood also reduced Nepal’s seasonal electricity export capacity to neighbouring markets."
      ),
      contentNp: p(
        "<strong>काठमाडौँ।</strong> बाढीले थुपारेको लेदोले त्रिशूली–३ए आयोजनाको केबल डक्ट प्रवेशद्वार अवरुद्ध भएपछि सफाइ तीव्र पारिएको छ।",
        "उत्पादन सामान्य अवस्थामा फर्काउन सुरक्षित पहुँच अपरिहार्य रहेको इन्जिनियरहरू बताउँछन्।",
        "बाढीका कारण नेपालको मौसमी विद्युत् निर्यात क्षमतामा पनि असर परेको छ।"
      ),
      coverImage: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
      caption: "Photo: hydropower facility",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.STANDARD,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: false,
      isBreaking: false,
      views: 6840,
      metaTitle: "Trishuli-3A debris clearance advances | Echo Manch",
      metaTitleNp: "त्रिशूली–३ए सफाइ अघि बढ्यो | इको माञ्च",
      metaDescription: "Heavy debris cleared from Trishuli-3A cable duct after floods.",
      metaDescriptionNp: "बाढीपछि त्रिशूली–३ए केबल डक्टको सफाइ जारी।",
      keywords: "hydropower, Trishuli, flood, energy",
      keywordsNp: "जलविद्युत्, त्रिशूली, बाढी, ऊर्जा",
      categorySlug: "economy",
      province: 3,
      district: "Nuwakot",
      tagSlugs: ["hydropower", "flood"],
      hoursAgo: 10,
    },
    {
      title: "Emergency communications gaps exposed by mountain floods",
      titleNp: "हिमाली बाढीले आपत्कालीन सञ्चार प्रणालीको कमजोरी उजागर",
      slug: "emergency-communications-gaps-mountain-floods",
      excerpt:
        "Mobile services returned in many areas, but damaged towers and fibre forced operators onto slower backup links.",
      excerptNp:
        "धेरै ठाउँमा मोबाइल सेवा फर्किए पनि क्षतिग्रस्त टावर र फाइबरका कारण बैकल्पिक ढिलो लिंकमा निर्भर हुनुपरेको छ।",
      content: p(
        "<strong>Kathmandu.</strong> The Bhotekoshi disaster highlighted weak points in Nepal’s emergency communications network.",
        "Telecom operators restored most base stations, yet experts urge a dedicated disaster communications plan with redundant routes.",
        "Villages cut off for hours struggled to request helicopters and medical support."
      ),
      contentNp: p(
        "<strong>काठमाडौँ।</strong> भोटेकोशी विपद्ले नेपालको आपत्कालीन सञ्चार सञ्जालका कमजोरी स्पष्ट पारेको छ।",
        "अधिकांश बेस स्टेसन फर्किए पनि विपद्का बेला वैकल्पिक रुटसहितको छुट्टै सञ्चार योजना आवश्यक रहेको विज्ञहरू बताउँछन्।",
        "घण्टौं सम्पर्कविहीन गाउँले हेलिकोप्टर र स्वास्थ्य सहायता माग्न कठिनाइ भोगे।"
      ),
      coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      caption: "Photo: telecom tower silhouette",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.FEATURE,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: false,
      isBreaking: false,
      views: 8030,
      metaTitle: "Floods expose emergency telecom gaps | Echo Manch",
      metaTitleNp: "बाढी र आपत्कालीन सञ्चार चुनौती | इको माञ्च",
      metaDescription: "Experts call for redundant disaster communications after floods.",
      metaDescriptionNp: "बाढीपछि विपद् सञ्चार योजना आवश्यक रहेको विज्ञको भनाइ।",
      keywords: "telecom, disaster, communications, flood",
      keywordsNp: "सञ्चार, विपद्, टेलिकम, बाढी",
      categorySlug: "technology",
      tagSlugs: ["flood", "5g"],
      hoursAgo: 12,
    },
    {
      title: "Award-winning Nepali film screens for flood relief fund",
      titleNp: "पुरस्कृत नेपाली फिल्मको च्यारिटी प्रदर्शनबाट बाढी राहत कोषमा सहयोग",
      slug: "nepali-film-charity-screening-flood-relief",
      excerpt:
        "A special screening of a Cannes-recognised Nepali film raised funds for communities hit by the recent floods.",
      excerptNp:
        "कान्समा चर्चा कमाएको नेपाली फिल्मको विशेष प्रदर्शनबाट बाढी प्रभावितका लागि रकम संकलन गरिएको छ।",
      content: p(
        "<strong>Kathmandu.</strong> Filmmakers organised a charity screening so cinema audiences could support flood-affected families.",
        "Organisers said ticket proceeds will be transferred to the Prime Minister’s disaster relief fund.",
        "Artists called on the industry to keep cultural events tied to practical solidarity."
      ),
      contentNp: p(
        "<strong>काठमाडौँ।</strong> बाढी प्रभावित परिवारलाई सहयोग गर्न फिल्मकर्मीहरूले च्यारिटी प्रदर्शन आयोजना गरेका छन्।",
        "आयोजकका अनुसार टिकटबाट उठेको रकम प्रधानमन्त्री विपद् राहत कोषमा जम्मा गरिनेछ।",
        "कलाकारहरूले सांस्कृतिक कार्यक्रमलाई व्यावहारिक ऐक्यबद्धतासँग जोड्न आग्रह गरेका छन्।"
      ),
      coverImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
      caption: "Photo: cinema screening",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.STANDARD,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: false,
      isBreaking: false,
      views: 5320,
      metaTitle: "Film charity screening for flood relief | Echo Manch",
      metaTitleNp: "फिल्म च्यारिटीबाट बाढी राहत | इको माञ्च",
      metaDescription: "Nepali film screening raises money for flood-hit communities.",
      metaDescriptionNp: "नेपाली फिल्म प्रदर्शनबाट बाढी प्रभावितलाई सहयोग।",
      keywords: "film, charity, flood, culture",
      keywordsNp: "चलचित्र, च्यारिटी, बाढी, संस्कृति",
      categorySlug: "entertainment",
      tagSlugs: ["film", "flood"],
      hoursAgo: 14,
    },
    {
      title: "Live: Cabinet briefing on flood recovery and highway status",
      titleNp: "लाइभ: बाढी पुनर्निर्माण र राजमार्ग अवस्थाबारे मन्त्रिपरिषद् ब्रिफिङ",
      slug: "live-cabinet-flood-recovery-briefing",
      excerpt:
        "Follow minute-by-minute updates as ministers outline rescue, reconstruction and transport corridor repairs.",
      excerptNp:
        "उद्धार, पुनर्निर्माण र यातायात मार्ग मर्मतबारे मन्त्रीहरूको ब्रिफिङको पलपलको अपडेट।",
      content: p(
        "<strong>Kathmandu.</strong> The Cabinet is holding a special briefing on flood recovery priorities.",
        "Expected topics include temporary bridges, school shelters, DNA identification support and hydropower restoration timelines."
      ),
      contentNp: p(
        "<strong>काठमाडौँ।</strong> बाढी पुनर्निर्माण प्राथमिकताबारे मन्त्रिपरिषद् विशेष ब्रिफिङ आयोजना गर्दैछ।",
        "अस्थायी पुल, विद्यालय आश्रय, डीएनए पहिचान सहयोग र जलविद्युत् पुनर्स्थापना तालिका मुख्य विषय रहने अपेक्षा छ।"
      ),
      coverImage: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
      caption: "Live coverage: Singha Durbar briefing",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.LIVE,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: false,
      isBreaking: true,
      views: 9780,
      metaTitle: "Live: flood recovery Cabinet briefing | Echo Manch",
      metaTitleNp: "लाइभ: बाढी पुनर्निर्माण ब्रिफिङ | इको माञ्च",
      metaDescription: "Live updates from the Cabinet flood recovery briefing.",
      metaDescriptionNp: "मन्त्रिपरिषद् बाढी पुनर्निर्माण ब्रिफिङको लाइभ अपडेट।",
      keywords: "live, cabinet, flood, recovery",
      keywordsNp: "लाइभ, मन्त्रिपरिषद्, बाढी, पुनर्निर्माण",
      categorySlug: "politics",
      tagSlugs: ["flood", "parliament"],
      hoursAgo: 1,
    },
    {
      title: "Students cut snack money to support flood-hit classmates",
      titleNp: "विद्यार्थीले खाजा खर्च बचत गरी बाढीपीडित सहपाठीलाई सहयोग",
      slug: "students-snack-money-flood-relief",
      excerpt:
        "School communities say small daily savings are becoming meaningful relief for children displaced by floods.",
      excerptNp:
        "विद्यालय समुदायका अनुसार दैनिक सानो बचत बाढीले विस्थापित बालबालिकाका लागि अर्थपूर्ण राहत बनिरहेको छ।",
      content: p(
        "<strong>Kathmandu.</strong> Students in several valley schools have started skipping snacks to donate for flood-affected peers.",
        "Teachers said the campaign teaches empathy while delivering school kits and warm clothes to shelters."
      ),
      contentNp: p(
        "<strong>काठमाडौँ।</strong> उपत्यकाका केही विद्यालयका विद्यार्थीले खाजा खर्च बचत गरी बाढी प्रभावित सहपाठीलाई सहयोग गर्न थालेका छन्।",
        "शिक्षकहरूका अनुसार यो अभियानले सहानुभूति सिकाउँदै आश्रय शिविरमा शैक्षिक सामग्री र न्यानो कपडा पुर्‍याइरहेको छ।"
      ),
      coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
      caption: "Photo: school community solidarity",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.STANDARD,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: false,
      isBreaking: false,
      views: 4210,
      metaTitle: "Students donate snack money for flood relief | Echo Manch",
      metaTitleNp: "विद्यार्थीको खाजा बचतबाट बाढी राहत | इको माञ्च",
      metaDescription: "Schoolchildren donate snack savings to flood-hit classmates.",
      metaDescriptionNp: "विद्यार्थीले बचत गरी बाढीपीडित सहपाठीलाई सहयोग।",
      keywords: "students, school, flood, solidarity",
      keywordsNp: "विद्यार्थी, विद्यालय, बाढी, सहयोग",
      categorySlug: "society",
      tagSlugs: ["flood"],
      hoursAgo: 18,
    },
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
        "International forums often offer sympathy. What frontline communities need is predictable finance for early warning, resilient roads and social protection.",
        "Echo Manch argues that climate justice must move from communiqués to bankable projects in Himalayan districts."
      ),
      contentNp: p(
        "हालैका बाढी एक्ला त्रासदी होइनन्। यी ग्लेसियर जोखिम, चरम वर्षा र कमजोर पूर्वाधारको फराकिलो चित्रसँग जोडिएका छन्।",
        "अन्तर्राष्ट्रिय मञ्चमा सहानुभूति धेरै आउँछ। अग्रपङ्क्ति समुदायलाई भने पूर्वसूचना, बलियो सडक र सामाजिक सुरक्षाका लागि भरपर्दो वित्त चाहिन्छ।",
        "इको माञ्चको मत छ—जलवायु न्याय विज्ञप्तिबाट हिमाली जिल्लाका कार्यान्वयनयोग्य आयोजनासम्म पुग्नुपर्छ।"
      ),
      coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      caption: "Column: Echo Manch editorial desk",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.OPINION,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: true,
      isBreaking: false,
      views: 7650,
      metaTitle: "Opinion: climate justice for Nepal | Echo Manch",
      metaTitleNp: "विचार: नेपालका लागि जलवायु न्याय | इको माञ्च",
      metaDescription: "Editorial on climate finance and Himalayan resilience.",
      metaDescriptionNp: "जलवायु वित्त र हिमाली उत्थानशीलताबारे सम्पादकीय।",
      keywords: "opinion, climate justice, LDC, Himalaya",
      keywordsNp: "विचार, जलवायु न्याय, एलडीसी, हिमाल",
      categorySlug: "opinion",
      tagSlugs: ["climate"],
      hoursAgo: 20,
    },
    {
      title: "NRB signals support for SME credit after disaster shock",
      titleNp: "विपद्पछि साना व्यवसाय कर्जामा राष्ट्र बैंकको सहयोग संकेत",
      slug: "nrb-sme-credit-support-after-disaster",
      excerpt:
        "Bankers expect targeted refinancing to help shops and small factories restart in flood-hit districts.",
      excerptNp:
        "बाढी प्रभावित जिल्लामा पसल र साना कारखाना पुनः सुरु गर्न लक्षित पुनर्कर्जाको अपेक्षा बैंकरहरूले गरेका छन्।",
      content: p(
        "<strong>Kathmandu.</strong> Nepal Rastra Bank officials indicated policy room to expand concessional credit for disaster-hit SMEs.",
        "Chambers of commerce asked for faster claim settlement and working-capital windows before the festival season.",
        "Markets reacted cautiously as investors weighed reconstruction spending against revenue pressure."
      ),
      contentNp: p(
        "<strong>काठमाडौँ।</strong> नेपाल राष्ट्र बैंकले विपद् प्रभावित साना तथा मझौला व्यवसायका लागि सहुलियत कर्जा विस्तार गर्न सकिने संकेत दिएको छ।",
        "वाणिज्य संघहरूले चाडपर्वअघि दाबी भुक्तानी र चालु पुँजी सुविधा छिटो बनाउन आग्रह गरेका छन्।",
        "पुनर्निर्माण खर्च र राजस्व दबाबलाई हेर्दै बजारले सावधानीपूर्वक प्रतिक्रिया जनाएको छ।"
      ),
      coverImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
      caption: "Photo: banking and markets",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.STANDARD,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: false,
      isBreaking: false,
      views: 6100,
      metaTitle: "NRB hints SME credit after floods | Echo Manch",
      metaTitleNp: "विपद्पछि एसएमई कर्जा संकेत | इको माञ्च",
      metaDescription: "Central bank signals concessional credit for disaster-hit SMEs.",
      metaDescriptionNp: "विपद् प्रभावित व्यवसायका लागि सहुलियत कर्जाको संकेत।",
      keywords: "NRB, SME, banking, economy",
      keywordsNp: "राष्ट्र बैंक, एसएमई, बैंकिङ, अर्थतन्त्र",
      categorySlug: "economy",
      tagSlugs: ["banking"],
      hoursAgo: 22,
    },
    {
      title: "Trekking routes reopen cautiously as Langtang corridor recovers",
      titleNp: "लान्ताङ कोरिडोरमा सावधानीपूर्वक पदयात्रा मार्ग खुल्दै",
      slug: "langtang-trekking-routes-cautious-reopening",
      excerpt:
        "Tourism operators urge travellers to check trail advisories after roads and bridges were damaged by floods.",
      excerptNp:
        "बाढीले सडक–पुल क्षतिग्रस्त भएपछि पर्यटन व्यवसायीहरूले यात्रुलाई पदमार्ग सल्लाह जाँच्न आग्रह गरेका छन्।",
      content: p(
        "<strong>Dhunche.</strong> Sections of the Langtang approach are reopening with helicopter support for essential supplies.",
        "Guides recommend flexible itineraries until engineers certify temporary crossings.",
        "Domestic tourism boards say responsible travel can still support local livelihoods."
      ),
      contentNp: p(
        "<strong>धुन्चे।</strong> लान्ताङ जाने केही खण्ड अत्यावश्यक आपूर्तिसहित हेलिकोप्टर सहयोगमा खुल्दैछन्।",
        "अस्थायी क्रसिङ प्रमाणित नहुन्जेल लचिलो यात्रा तालिका राख्न गाइडहरू सुझाव दिन्छन्।",
        "जिम्मेवार पर्यटनले स्थानीय जीविकोपार्जनमा सहयोग पुर्‍याउन सक्ने पर्यटन बोर्डको भनाइ छ।"
      ),
      coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      caption: "Photo: Himalayan trekking trail",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.STANDARD,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: false,
      isBreaking: false,
      views: 5480,
      metaTitle: "Langtang trekking reopens carefully | Echo Manch",
      metaTitleNp: "लान्ताङ पदयात्रा सावधानीपूर्वक खुल्दै | इको माञ्च",
      metaDescription: "Trail advisories urged as Langtang corridor recovers from floods.",
      metaDescriptionNp: "बाढीपछि लान्ताङ कोरिडोरमा पदमार्ग सल्लाह आवश्यक।",
      keywords: "tourism, Langtang, trekking, travel",
      keywordsNp: "पर्यटन, लान्ताङ, पदयात्रा, यात्रा",
      categorySlug: "lifestyle",
      province: 3,
      district: "Rasuwa",
      tagSlugs: ["tourism", "rasuwa"],
      hoursAgo: 26,
    },
    {
      title: "World brief: mountain nations push loss-and-damage finance",
      titleNp: "विश्व संक्षेप: हिमाली राष्ट्रहरूले क्षतिपूर्ति वित्तमा जोड दिए",
      slug: "world-brief-mountain-nations-loss-damage-finance",
      excerpt:
        "At a ministerial meeting of LDCs, Nepal stressed climate justice and compensation over symbolic aid.",
      excerptNp:
        "एलडीसी मन्त्रीस्तरीय बैठकमा नेपालले सहानुभूतिभन्दा जलवायु न्याय र क्षतिपूर्तिमा जोड दिएको छ।",
      content: p(
        "<strong>International.</strong> Least-developed countries renewed calls for faster loss-and-damage disbursements.",
        "Nepal’s delegation argued Himalayan communities cannot wait for slow project cycles after cascading floods.",
        "Negotiators will carry the message into upcoming climate finance sessions."
      ),
      contentNp: p(
        "<strong>अन्तर्राष्ट्रिय।</strong> अल्पविकसित राष्ट्रहरूले क्षति तथा हानि कोषको छिटो परिचालन माग दोहोर्‍याएका छन्।",
        "नेपाली प्रतिनिधिमण्डलले हिमाली समुदायले बाढीपछि ढिलो आयोजना चक्र कुर्नु नहुने तर्क गरेको छ।",
        "वार्ताकारहरूले आगामी जलवायु वित्त बैठकमा यो सन्देश लैजानेछन्।"
      ),
      coverImage: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80",
      caption: "Photo: international summit hall",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.STANDARD,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: false,
      isBreaking: false,
      views: 3990,
      metaTitle: "LDCs press loss-and-damage finance | Echo Manch",
      metaTitleNp: "एलडीसीको क्षतिपूर्ति वित्त माग | इको माञ्च",
      metaDescription: "Mountain LDCs renew push for climate compensation finance.",
      metaDescriptionNp: "हिमाली एलडीसी राष्ट्रहरूको जलवायु क्षतिपूर्ति माग।",
      keywords: "world, LDC, climate finance, diplomacy",
      keywordsNp: "विश्व, एलडीसी, जलवायु वित्त, कूटनीति",
      categorySlug: "world",
      tagSlugs: ["climate"],
      hoursAgo: 28,
    },
    {
      title: "English-only briefing: How to follow Echo Manch’s bilingual editions",
      titleNp: "द्वैभाषिक संस्करण कसरी पढ्ने — छोटो गाइड",
      slug: "how-to-follow-echomanch-bilingual-editions",
      excerpt:
        "Use echomanchs.com for Nepali and en.echomanchs.com for English — one CMS powers both portals.",
      excerptNp:
        "नेपालीका लागि echomanchs.com र अंग्रेजीका लागि en.echomanchs.com — एउटै सीएमएसले दुवै पोर्टल चलाउँछ।",
      content: p(
        "<strong>Guide.</strong> Echo Manch publishes many stories in both languages from a single article record.",
        "Editors choose Nepali only, English only, or Both. Public sites filter automatically by domain.",
        "This demo seed fills dashboards so you can explore admin lists, review queues and public cards."
      ),
      contentNp: p(
        "<strong>गाइड।</strong> इको माञ्चले धेरै समाचार एउटै लेख रेकर्डबाट दुवै भाषामा प्रकाशन गर्छ।",
        "सम्पादकले नेपाली मात्र, अंग्रेजी मात्र वा दुवै छान्न सक्छन्। सार्वजनिक साइटले डोमेनअनुसार स्वतः फिल्टर गर्छ।",
        "यो डेमो सिडले ड्यासबोर्ड भर्छ ताकि एडमिन सूची, समीक्षा र सार्वजनिक कार्ड हेर्न सकियोस्।"
      ),
      coverImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
      caption: "Echo Manch product note",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.FEATURE,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: false,
      isBreaking: false,
      views: 2100,
      metaTitle: "Follow Echo Manch bilingual editions | Echo Manch",
      metaTitleNp: "इको माञ्च द्वैभाषिक संस्करण गाइड | इको माञ्च",
      metaDescription: "How Nepali and English portals share one CMS.",
      metaDescriptionNp: "नेपाली र अंग्रेजी पोर्टल एउटै सीएमएसबाट कसरी चल्छन्।",
      keywords: "Echo Manch, bilingual, CMS, guide",
      keywordsNp: "इको माञ्च, द्वैभाषिक, सीएमएस, गाइड",
      categorySlug: "technology",
      hoursAgo: 30,
    },
    {
      title: "Party meeting skips key leaders amid strategy talks",
      titleNp: "रणनीति छलफलको बैठकमा मुख्य नेताहरू अनुपस्थित",
      slug: "party-meeting-key-leaders-absent-strategy-talks",
      excerpt:
        "A proposed statute discussion drew attention after several senior figures did not attend.",
      excerptNp:
        "केही वरिष्ठ नेता अनुपस्थित रहँदा प्रस्तावित विधान छलफलले चर्चा पाएको छ।",
      content: p(
        "<strong>Kathmandu.</strong> Internal party meetings continued in the capital as factions weighed organisational proposals.",
        "Analysts said absences may signal negotiation rather than a formal split.",
        "Echo Manch will report confirmed decisions once the meeting minutes are public."
      ),
      contentNp: p(
        "<strong>काठमाडौँ।</strong> राजधानीमा दलीय बैठक जारी रहँदा गुटहरूले संगठनात्मक प्रस्तावमाथि छलफल गरेका छन्।",
        "विश्लेषकहरूका अनुसार अनुपस्थिति औपचारिक फुटभन्दा वार्ताको संकेत हुन सक्छ।",
        "बैठकका निर्णय सार्वजनिक भएपछि इको माञ्चले पुष्टि विवरण प्रकाशन गर्नेछ।"
      ),
      coverImage: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
      caption: "Photo: political meeting exterior",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.STANDARD,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: false,
      isBreaking: false,
      views: 8900,
      metaTitle: "Party strategy meeting draws attention | Echo Manch",
      metaTitleNp: "दलीय रणनीति बैठक चर्चामा | इको माञ्च",
      metaDescription: "Senior absences noted at party organisational talks.",
      metaDescriptionNp: "दलीय संगठनात्मक छलफलमा वरिष्ठ अनुपस्थिति चर्चामा।",
      keywords: "politics, party, Kathmandu, parliament",
      keywordsNp: "राजनीति, दल, काठमाडौँ, संसद्",
      categorySlug: "politics",
      tagSlugs: ["parliament"],
      hoursAgo: 7,
    },
    {
      title: "Airlines freeze fares as highway disruption lifts air demand",
      titleNp: "राजमार्ग अवरोधपछि हवाई माग बढ्दा टिकट दर स्थिर राख्ने घोषणा",
      slug: "airlines-freeze-fares-highway-disruption",
      excerpt:
        "Carriers say temporary fare freezes aim to protect travellers while road links remain unreliable.",
      excerptNp:
        "सडक मार्ग अनिश्चित रहँदा यात्रु जोगाउन अस्थायी रूपमा भाडा स्थिर राखिने एयरलाइन्सको भनाइ छ।",
      content: p(
        "<strong>Kathmandu.</strong> Domestic airlines announced fare freezes on key routes after floods disrupted major highways.",
        "Passenger volume rose as traders and aid workers shifted to air travel.",
        "Civil aviation monitors warned travellers to arrive early due to heavier terminal traffic."
      ),
      contentNp: p(
        "<strong>काठमाडौँ।</strong> बाढीले मुख्य राजमार्ग प्रभावित भएपछि आन्तरिक एयरलाइन्सले प्रमुख रुटमा भाडा स्थिर राख्ने घोषणा गरेका छन्।",
        "व्यापारी र राहतकर्मी हवाई यात्रातिर लाग्दा यात्रु चाप बढेको छ।",
        "टर्मिनलमा चाप बढेकाले चाँडै पुग्न नागरिक उड्डयन अनुगमन पक्षले आग्रह गरेको छ।"
      ),
      coverImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80",
      caption: "Photo: domestic airport operations",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.STANDARD,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: false,
      isBreaking: false,
      views: 7220,
      metaTitle: "Airlines freeze fares amid road disruption | Echo Manch",
      metaTitleNp: "राजमार्ग अवरोधमा हवाई भाडा स्थिर | इको माञ्च",
      metaDescription: "Domestic airlines freeze fares while highways recover.",
      metaDescriptionNp: "राजमार्ग पुनर्लाभ नहुन्जेल आन्तरिक हवाई भाडा स्थिर।",
      keywords: "aviation, fares, highway, travel",
      keywordsNp: "उड्डयन, भाडा, राजमार्ग, यात्रा",
      categorySlug: "economy",
      tagSlugs: ["tourism", "flood"],
      hoursAgo: 16,
    },
    {
      title: "Anti-graft body files land revenue corruption case",
      titleNp: "अख्तियारले मालपोतसम्बन्धी भ्रष्टाचार मुद्दा दायर गर्‍यो",
      slug: "ciaa-land-revenue-corruption-case-filed",
      excerpt:
        "Investigators named multiple defendants in a Rupandehi land revenue corruption filing.",
      excerptNp:
        "रुपन्देही मालपोतसम्बन्धी भ्रष्टाचार मुद्दामा अनुसन्धानकर्ताले बहुप्रतिवादी किटान गरेका छन्।",
      content: p(
        "<strong>Kathmandu.</strong> The Commission for Investigation of Abuse of Authority filed a corruption case linked to land revenue processes.",
        "The filing alleges irregularities affecting service seekers and public revenue.",
        "Courts will schedule hearings; Echo Manch will report verified procedural updates."
      ),
      contentNp: p(
        "<strong>काठमाडौँ।</strong> अख्तियार दुरुपयोग अनुसन्धान आयोगले मालपोत प्रक्रियासँग जोडिएको भ्रष्टाचार मुद्दा दायर गरेको छ।",
        "सेवाग्राही र सार्वजनिक राजस्वमा असर पार्ने अनियमितताको आरोप लगाइएको छ।",
        "अदालतले पेसी तोक्नेछ; इको माञ्चले पुष्टि प्रक्रियागत अपडेट प्रकाशन गर्नेछ।"
      ),
      coverImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
      caption: "Photo: justice and public accountability",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.STANDARD,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: false,
      isBreaking: false,
      views: 9550,
      metaTitle: "CIAA files land revenue corruption case | Echo Manch",
      metaTitleNp: "अख्तियारको मालपोत भ्रष्टाचार मुद्दा | इको माञ्च",
      metaDescription: "Anti-graft body files Rupandehi land revenue corruption case.",
      metaDescriptionNp: "रुपन्देही मालपोतसम्बन्धी अख्तियारको भ्रष्टाचार मुद्दा।",
      keywords: "CIAA, corruption, land revenue, law",
      keywordsNp: "अख्तियार, भ्रष्टाचार, मालपोत, कानुन",
      categorySlug: "politics",
      province: 5,
      district: "Rupandehi",
      hoursAgo: 36,
    },
    {
      title: "Draft only: Festival tourism outlook (unpublished demo)",
      titleNp: "मस्यौदा: चाडपर्व पर्यटन सम्भावना (अप्रकाशित डेमो)",
      slug: "draft-festival-tourism-outlook-demo",
      excerpt: "Internal draft for editors — not visible on public portals.",
      excerptNp: "सम्पादकका लागि आन्तरिक मस्यौदा — सार्वजनिक पोर्टलमा देखिँदैन।",
      content: p(
        "This draft article exists so the admin dashboard shows Draft status items.",
        "Publish it later after fact-checking festival hotel occupancy numbers."
      ),
      contentNp: p(
        "यो मस्यौदा आर्टिकल एडमिन ड्यासबोर्डमा ड्राफ्ट अवस्था देखाउन राखिएको हो।",
        "चाडपर्व होटेल ओगटसङ्ख्या जाँच गरेपछि मात्र प्रकाशन गर्नुहोस्।"
      ),
      coverImage: "https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=1200&q=80",
      caption: "Draft placeholder",
      status: ArticleStatus.DRAFT,
      type: ArticleType.STANDARD,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: false,
      isBreaking: false,
      views: 12,
      metaTitle: "Draft festival tourism outlook",
      metaTitleNp: "मस्यौदा चाडपर्व पर्यटन",
      metaDescription: "Unpublished draft for CMS demo.",
      metaDescriptionNp: "सीएमएस डेमोका लागि अप्रकाशित मस्यौदा।",
      keywords: "draft, tourism",
      keywordsNp: "मस्यौदा, पर्यटन",
      categorySlug: "lifestyle",
      tagSlugs: ["tourism"],
      hoursAgo: 48,
    },
    {
      title: "Pending review: Valley air quality weekend plan",
      titleNp: "समीक्षामा: उपत्यका वायु गुणस्तर साप्ताहिक योजना",
      slug: "pending-valley-air-quality-weekend-plan",
      excerpt: "Submitted for editor review — watering and roadside greenery schedule.",
      excerptNp: "सम्पादक समीक्षाका लागि पेस — छर्कने र सडक किनारा हरियाली तालिका।",
      content: p(
        "Municipal teams propose weekend watering on ring-road dust hotspots.",
        "This pending article helps populate the Review Queue screen."
      ),
      contentNp: p(
        "नगर टोलीले रिङरोड धुलो क्षेत्रमा साप्ताहिक छर्कने प्रस्ताव गरेका छन्।",
        "यो पेन्डिङ आर्टिकलले समीक्षा कतार स्क्रिन भर्न मद्दत गर्छ।"
      ),
      coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
      caption: "Pending review demo",
      status: ArticleStatus.PENDING,
      type: ArticleType.STANDARD,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: false,
      isBreaking: false,
      views: 40,
      metaTitle: "Pending: valley air quality plan",
      metaTitleNp: "समीक्षामा: उपत्यका वायु गुणस्तर",
      metaDescription: "Pending review demo article for admin queue.",
      metaDescriptionNp: "एडमिन समीक्षा कतारका लागि डेमो आर्टिकल।",
      keywords: "air quality, Kathmandu, pending",
      keywordsNp: "वायु गुणस्तर, काठमाडौँ, समीक्षा",
      categorySlug: "society",
      province: 3,
      district: "Kathmandu",
      hoursAgo: 6,
    },
    {
      title: "5G trial corridors expand in major cities",
      titleNp: "मुख्य सहरमा ५जी परीक्षण कोरिडोर विस्तार",
      slug: "5g-trial-corridors-expand-major-cities",
      excerpt:
        "Regulators say commercial timelines depend on spectrum readiness and tower densification.",
      excerptNp:
        "व्यावसायिक समयतालिका फ्रिक्वेन्सी तयारी र टावर घनत्वमा निर्भर रहने नियामकको भनाइ छ।",
      content: p(
        "<strong>Kathmandu.</strong> Telecom operators widened 5G trial corridors across major urban routes.",
        "Consumers should expect gradual rollout rather than nationwide coverage overnight.",
        "Device compatibility and pricing will shape early adoption."
      ),
      contentNp: p(
        "<strong>काठमाडौँ।</strong> दूरसञ्चार सेवा प्रदायकहरूले मुख्य सहरी रुटमा ५जी परीक्षण कोरिडोर विस्तार गरेका छन्।",
        "रातारात देशव्यापी कभरेजभन्दा क्रमिक विस्तार अपेक्षा गर्नुपर्नेछ।",
        "यन्त्र अनुकूलता र मूल्यले प्रारम्भिक प्रयोग निर्धारण गर्नेछ।"
      ),
      coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      caption: "Photo: network infrastructure",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.STANDARD,
      languageEdition: LanguageEdition.BOTH,
      isFeatured: false,
      isBreaking: false,
      views: 6700,
      metaTitle: "5G trial corridors expand | Echo Manch",
      metaTitleNp: "५जी परीक्षण कोरिडोर विस्तार | इको माञ्च",
      metaDescription: "Urban 5G trial corridors expand ahead of commercial plans.",
      metaDescriptionNp: "व्यावसायिक योजनाअघि सहरी ५जी परीक्षण विस्तार।",
      keywords: "5G, telecom, technology, Nepal",
      keywordsNp: "५जी, दूरसञ्चार, प्रविधि, नेपाल",
      categorySlug: "technology",
      tagSlugs: ["5g"],
      hoursAgo: 40,
    },
  ];

  let articleCount = 0;
  for (const art of articles) {
    const categoryId = categoryMap[art.categorySlug];
    if (!categoryId) continue;

    const publishedAt =
      art.status === ArticleStatus.PUBLISHED
        ? new Date(Date.now() - (art.hoursAgo ?? 12) * 60 * 60 * 1000)
        : null;

    const authorId = art.status === ArticleStatus.PENDING ? editor.id : admin.id;
    const tagConnect =
      art.tagSlugs
        ?.map((s) => tagMap[s])
        .filter(Boolean)
        .map((id) => ({ id })) ?? [];

    await prisma.article.upsert({
      where: { slug: art.slug || slugify(art.title) },
      update: {
        title: art.title,
        titleNp: art.titleNp,
        content: art.content,
        contentNp: art.contentNp,
        excerpt: art.excerpt,
        excerptNp: art.excerptNp,
        coverImage: art.coverImage,
        caption: art.caption,
        status: art.status,
        type: art.type,
        languageEdition: art.languageEdition,
        isFeatured: art.isFeatured,
        isBreaking: art.isBreaking,
        views: art.views,
        metaTitle: art.metaTitle,
        metaTitleNp: art.metaTitleNp,
        metaDescription: art.metaDescription,
        metaDescriptionNp: art.metaDescriptionNp,
        keywords: art.keywords,
        keywordsNp: art.keywordsNp,
        authorId,
        categoryId,
        province: art.province ?? null,
        district: art.district ?? null,
        publishedAt,
        tags: { set: tagConnect },
      },
      create: {
        title: art.title,
        titleNp: art.titleNp,
        slug: art.slug,
        content: art.content,
        contentNp: art.contentNp,
        excerpt: art.excerpt,
        excerptNp: art.excerptNp,
        coverImage: art.coverImage,
        caption: art.caption,
        status: art.status,
        type: art.type,
        languageEdition: art.languageEdition,
        isFeatured: art.isFeatured,
        isBreaking: art.isBreaking,
        views: art.views,
        metaTitle: art.metaTitle,
        metaTitleNp: art.metaTitleNp,
        metaDescription: art.metaDescription,
        metaDescriptionNp: art.metaDescriptionNp,
        keywords: art.keywords,
        keywordsNp: art.keywordsNp,
        authorId,
        categoryId,
        province: art.province ?? null,
        district: art.district ?? null,
        publishedAt,
        ...(tagConnect.length ? { tags: { connect: tagConnect } } : {}),
      },
    });
    articleCount += 1;
  }
  console.log(`✅ Articles upserted: ${articleCount}`);

  const liveArticle = await prisma.article.findUnique({
    where: { slug: "live-cabinet-flood-recovery-briefing" },
  });
  if (liveArticle) {
    await prisma.liveUpdate.deleteMany({ where: { articleId: liveArticle.id } });
    await prisma.liveUpdate.createMany({
      data: [
        {
          articleId: liveArticle.id,
          title: "Briefing opens",
          content: "Ministers arrive; agenda covers bridges, shelters and power restoration.",
        },
        {
          articleId: liveArticle.id,
          title: "ब्रिफिङ सुरु",
          content: "मन्त्रीहरू आइपुगे; पुल, आश्रय र विद्युत् पुनर्स्थापना एजेन्डामा।",
        },
        {
          articleId: liveArticle.id,
          title: "DNA support mentioned",
          content: "Home ministry confirms expanded DNA help desks in affected districts.",
        },
      ],
    });
    console.log("✅ Live updates seeded for live briefing article");
  }

  const ads = [
    {
      title: "Header leaderboard demo",
      slot: AdSlot.HEADER_LEADERBOARD,
      imageUrl: "https://placehold.co/728x90/027081/ffffff?text=Echo+Manch+Ad",
      targetUrl: "https://echomanchs.com",
    },
    {
      title: "Sidebar promo demo",
      slot: AdSlot.SIDEBAR_TOP,
      imageUrl: "https://placehold.co/300x250/0C4EA0/ffffff?text=Sidebar+Ad+1",
      targetUrl: "https://echomanchs.com",
    },
    {
      title: "Sidebar bottom demo",
      slot: AdSlot.SIDEBAR_BOTTOM,
      imageUrl: "https://placehold.co/300x250/C41E3A/ffffff?text=Sidebar+Ad+2",
      targetUrl: "https://echomanchs.com",
    },
    {
      title: "In-article demo",
      slot: AdSlot.IN_ARTICLE,
      imageUrl: "https://placehold.co/600x200/C3272E/ffffff?text=In-Article+Ad",
      targetUrl: "https://en.echomanchs.com",
    },
  ];

  for (const ad of ads) {
    const existing = await prisma.ad.findFirst({ where: { title: ad.title, slot: ad.slot } });
    if (existing) {
      await prisma.ad.update({
        where: { id: existing.id },
        data: { ...ad, isActive: true },
      });
    } else {
      await prisma.ad.create({ data: { ...ad, isActive: true } });
    }
  }
  console.log(`✅ Ads ready: ${ads.length}`);

  const published = await prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } });
  const both = await prisma.article.count({ where: { languageEdition: LanguageEdition.BOTH } });
  console.log(`🎉 Seed complete — published=${published}, bilingual BOTH=${both}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
