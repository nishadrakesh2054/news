import { PrismaClient, Role, ArticleStatus, ArticleType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting complete news portal database seeding...");

  // 1. Provision Admin Account
  const adminEmail = "nishadrakesh2054@gmail.com";
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: Role.ADMIN,
    },
    create: {
      name: "निषाद राकेश (प्रधान सम्पादक)",
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log(`✅ Admin account ready: ${admin.name} (${admin.email})`);

  // 2. Seed All Standard Nepali News Categories
  const categoriesData = [
    { name: "Politics", nameNp: "राजनीति", slug: "politics", order: 1, desc: "राष्ट्रिय तथा अन्तर्राष्ट्रिय राजनीतिक गतिविधिहरू" },
    { name: "Economy", nameNp: "अर्थतन्त्र", slug: "economy", order: 2, desc: "शेयर बजार, बैंक, बजेट र व्यापारिक समाचार" },
    { name: "Society", nameNp: "समाज", slug: "society", order: 3, desc: "सामाजिक घटना, विकास निर्माण र जनसरोकार" },
    { name: "Sports", nameNp: "खेलकुद", slug: "sports", order: 4, desc: "क्रिकेट, फुटबल र राष्ट्रिय खेलकुद अपडेट" },
    { name: "Entertainment", nameNp: "मनोरञ्जन", slug: "entertainment", order: 5, desc: "चलचित्र, कला, सङ्गीत र सेलिब्रेटी गसिप" },
    { name: "Opinion", nameNp: "विचार", slug: "opinion", order: 6, desc: "सम्पादकीय, दृष्टिकोण र विश्लेषणात्मक लेख" },
    { name: "Technology", nameNp: "प्रविधि", slug: "technology", order: 7, desc: "डिजिटल प्रविधि, ग्याजेट्स र नवप्रवर्तन" },
    { name: "World", nameNp: "विश्व", slug: "world", order: 8, desc: "अन्तर्राष्ट्रिय खबर र विश्व घटनाक्रम" },
    { name: "Lifestyle", nameNp: "जीवनशैली", slug: "lifestyle", order: 9, desc: "स्वास्थ्य, पर्यटन, खाना र संस्कृति" },
  ];

  const categoryMap: Record<string, string> = {};

  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        nameNp: cat.nameNp,
        order: cat.order,
      },
      create: {
        name: cat.name,
        nameNp: cat.nameNp,
        slug: cat.slug,
        description: cat.desc,
        order: cat.order,
      },
    });
    categoryMap[cat.slug] = createdCat.id;
  }

  console.log(`✅ Seeded ${Object.keys(categoryMap).length} categories`);

  // 3. Seed Comprehensive Sample Articles Across Categories & Formats
  const sampleArticles = [
    {
      title: "Parliament Winter Session Summoned by President",
      titleNp: "संसद्‌को हिउँदे अधिवेशन आह्वान, नयाँ महत्त्वपूर्ण विधेयकहरू पेस हुने",
      slug: "parliament-winter-session-summoned-2026",
      excerpt: "राष्ट्रपति कार्यालयद्वारा संसद्‌को नयाँ अधिवेशन आह्वान गरिएको छ। यस अधिवेशनमा अर्थ, शिक्षा र निजामती सम्बन्धी विधेयक मुख्य कार्यसूचीमा रहनेछन्।",
      content: `<p><strong>काठमाडौँ।</strong> राष्ट्रपति भवन शीतल निवासबाट जारी विज्ञप्ति अनुसार सङ्घीय संसद्‌को हिउँदे अधिवेशन आगामी सातादेखि सुरु हुने भएको छ।</p><p>सभामुख तथा राष्ट्रिय सभा अध्यक्षसँगको परामर्शपछि सरकारको सिफारिसमा यो निर्णय गरिएको हो। यस पटकको अधिवेशनमा लामो समयदेखि अड्किएका निजामती सेवा विधेयक र शिक्षा सुधार विधेयकलाई उच्च प्राथमिकताका साथ टेबल गरिने कार्यसूची तय गरिएको छ।</p><h2>मुख्य कार्यसूचीहरू:</h2><ul><li>निजामती सेवा विधेयक पारित गर्ने</li><li>शिक्षा क्षेत्र सुधार सम्बन्धी संशोधन</li><li>आगामी आर्थिक वर्षको पूर्व बजेट छलफल</li></ul><p>विपक्षी दलहरूले पनि सदनमा प्रभावकारी उपस्थिति जनाउने र जनजीविकाका सवालहरू जोडदार रूपमा उठाउने तयारी गरेका छन्।</p>`,
      coverImage: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
      caption: "तस्बिर: संसद् भवन नयाँ बानेश्वर",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.BREAKING,
      isFeatured: true,
      isBreaking: true,
      views: 12450,
      metaTitle: "संसद्‌को हिउँदे अधिवेशन आह्वान | नेपाल खबर",
      metaDescription: "संसद्‌को हिउँदे अधिवेशन आह्वान गरिएको छ। नयाँ विधेयकहरू पेस हुने तयारी।",
      keywords: "संसद्, अधिवेशन, राजनीति, नेपाल",
      categorySlug: "politics",
    },
    {
      title: "Nepal Rastra Bank Announces New Monetary Policy Reforms",
      titleNp: "नेपाल राष्ट्र बैंकद्वारा नयाँ मौद्रिक नीति समीक्षा सार्वजनिक, बैंकिङ क्षेत्रमा उत्साह",
      slug: "nrb-monetary-policy-reforms-2026",
      excerpt: "केन्द्रीय बैंकले ब्याजदर नियन्त्रण र साना तथा मझौला उद्योग (SMEs) का लागि सहुलियतपूर्ण कर्जा सीमा बढाएको छ।",
      content: `<p><strong>काठमाडौँ।</strong> नेपाल राष्ट्र बैंकका गभर्नरद्वारा चालू आर्थिक वर्षको तेस्रो त्रैमासिक मौद्रिक नीति समीक्षा सार्वजनिक गरिएको छ।</p><p>नयाँ व्यवस्था अनुसार बैंकहरूले साना व्यवसायीहरूलाई दिने पुनर्कर्जा प्रक्रियालाई सरल बनाइएको छ। यसले बजारमा तरलता वृद्धि भई उद्योग व्यवसायमा सकारात्मक असर पर्ने विश्वास गरिएको छ।</p><blockquote>"उद्योग र उत्पादनशील क्षेत्रमा लगानी बढाउन नीतिगत खुकुलोपना अपनाइएको छ।" — राष्ट्र बैंक प्रवक्ता</blockquote>`,
      coverImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80",
      caption: "तस्बिर: केन्द्रीय बैंक भवन बालुवाटार",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.FEATURE,
      isFeatured: true,
      isBreaking: false,
      views: 8930,
      metaTitle: "राष्ट्र बैंकको नयाँ मौद्रिक नीति समीक्षा | नेपाल खबर",
      metaDescription: "नेपाल राष्ट्र बैंकद्वारा नयाँ मौद्रिक नीति समीक्षा सार्वजनिक।",
      keywords: "मौद्रिक नीति, बैंक, अर्थतन्त्र, शेयर बजार",
      categorySlug: "economy",
    },
    {
      title: "Nepal National Cricket Team Secures Historic Series Victory",
      titleNp: "नेपाली राष्ट्रिय क्रिकेट टोलीद्वारा अन्तर्राष्ट्रिय शृङ्खलामा कीर्तिमानी जित हासिल",
      slug: "nepal-cricket-historic-series-win-2026",
      excerpt: "अन्तिम ओभरमा रोमाञ्चक जित दर्ता गर्दै नेपाली टोलीले त्रिकोणात्मक टि-२० शृङ्खलाको उपाधि आफ्नो नाममा गरेको छ।",
      content: `<p><strong>काठमाडौँ (कीर्तिपुर)।</strong> त्रिभुवन विश्वविद्यालय अन्तर्राष्ट्रिय क्रिकेट मैदानमा सम्पन्न फाइनल खेलमा नेपालले पाहुना टोलीलाई ५ विकेटले पराजित गरेको छ।</p><p>नेपालका लागि अलराउन्डर खेलाडीले उत्कृष्ट अर्धशतकीय पारी खेल्दै टोलीलाई जिताउन महत्त्वपूर्ण भूमिका खेले। हजारौँ दर्शकको उपस्थितिमा नेपाली क्रिकेट समर्थकहरूले जितको भव्य उत्सव मनाएका छन्।</p>`,
      coverImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80",
      caption: "तस्बिर: टियु क्रिकेट मैदानमा विजय उत्सव",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.STANDARD,
      isFeatured: false,
      isBreaking: true,
      views: 18200,
      metaTitle: "नेपाली क्रिकेट टोलीको कीर्तिमानी जित | नेपाल खबर",
      metaDescription: "नेपाली राष्ट्रिय क्रिकेट टोलीद्वारा अन्तर्राष्ट्रिय शृङ्खलामा कीर्तिमानी जित।",
      keywords: "क्रिकेट, नेपाल, खेलकुद, टियु मैदान",
      categorySlug: "sports",
    },
    {
      title: "Digital Transformation in Nepal: Potential and Future Ahead",
      titleNp: "नेपालको डिजिटल रूपान्तरण र भविष्यका सम्भावनाहरू: एक विशेष विश्लेषण",
      slug: "digital-transformation-in-nepal-analysis",
      excerpt: "सूचना प्रविधिको द्रुत विकाससँगै नेपाल कसरी डिजिटल अर्थतन्त्रतर्फ उन्मुख हुँदैछ भन्नेबारे विषयगत विश्लेषण।",
      content: `<p>विगत केही वर्षयता नेपालमा क्युआर कोड भुक्तानी, डिजिटल वालेट र अनलाइन सरकारी सेवाहरूको प्रयोग तीव्र रूपमा बढेको छ।</p><p>गाउँगाउँसम्म इन्टरनेटको पहुँच पुगेसँगै डिजिटल साक्षरता र ई-कमर्स बजारमा उल्लेखनीय सुधार आएको छ। तर, साइबर सुरक्षाका चुनौतीहरूलाई सम्बोधन गर्न थप बलियो पूर्वाधारको आवश्यकता रहेको छ।</p>`,
      coverImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
      caption: "लेखक: इन्जिनियर रमेश शर्मा",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.OPINION,
      isFeatured: false,
      isBreaking: false,
      views: 5410,
      metaTitle: "नेपालको डिजिटल रूपान्तरण र सम्भावनाहरू | नेपाल खबर",
      metaDescription: "डिजिटल प्रविधि र नेपालको आर्थिक सम्भावनाबारे विशेष स्तम्भ।",
      keywords: "डिजिटल, IT, विचार, प्रविधि",
      categorySlug: "opinion",
    },
    {
      title: "Live Coverage: National Assembly Special Discussion Session",
      titleNp: "लाइभ: राष्ट्रिय सभाको विशेष बैठक र समसामयिक प्रस्तावमाथि छलफल",
      slug: "live-national-assembly-special-discussion",
      excerpt: "राष्ट्रिय सभामा जारी प्रत्यक्ष छलफल र सांसदहरूको सम्बोधनको पलपलको अपडेट।",
      content: `<p>राष्ट्रिय सभाको बैठक सुरु भएको छ। वातावरण संरक्षण र विकास निर्माणका आयोजनाहरू समयमै सम्पन्न गर्ने विषयमा सांसदहरूले आ-आफ्नो धारणा राखिरहेका छन्।</p>`,
      coverImage: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
      caption: "प्रत्यक्ष प्रसारण: राष्ट्रिय सभा",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.LIVE,
      isFeatured: false,
      isBreaking: true,
      views: 7320,
      metaTitle: "लाइभ: राष्ट्रिय सभा बैठक | नेपाल खबर",
      metaDescription: "राष्ट्रिय सभाको विशेष बैठक र पलपलको लाइभ अपडेट।",
      keywords: "लाइभ, राष्ट्रिय सभा, संसद्",
      categorySlug: "politics",
    },
    {
      title: "Kathmandu Valley Environmental Cleanliness and Air Quality Drive",
      titleNp: "काठमाडौँ उपत्यकामा प्रदूषण नियन्त्रण र हरित वातावरणका लागि अभियान सञ्चालन",
      slug: "kathmandu-air-quality-drive-2026",
      excerpt: "उपत्यकाका सडकहरूमा हरियाली प्रवर्धन र धुलो नियन्त्रणका लागि उच्चस्तरीय संयन्त्र परिचालन।",
      content: `<p><strong>काठमाडौँ।</strong> उपत्यका विकास प्राधिकरण र काठमाडौँ महानगरपालिकाको संयुक्त आयोजनामा नयाँ सफाइ अभियान सुरु गरिएको छ।</p><p>सडक पेटीहरूमा रुख रोप्ने तथा मुख्य चोकहरूमा आधुनिक वाटर स्प्रिङ्क्लर प्रयोग गरी वायु प्रदूषण घटाइनेछ।</p>`,
      coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
      caption: "तस्बिर: काठमाडौँ रिङरोड हरियाली",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.STANDARD,
      isFeatured: false,
      isBreaking: false,
      views: 4120,
      metaTitle: "काठमाडौँ प्रदूषण नियन्त्रण अभियान | नेपाल खबर",
      metaDescription: "काठमाडौँ उपत्यकामा वातावरण सुधार र हरियाली अभियान।",
      keywords: "समाज, काठमाडौँ, वातावरण",
      categorySlug: "society",
    },
    {
      title: "5G Technology Commercial Rollout Expansion Progress in Nepal",
      titleNp: "नेपालमा ५जी प्रविधिको परीक्षण सफल, छिट्टै व्यावसायिक विस्तार सुरु हुने",
      slug: "nepal-5g-technology-commercial-expansion",
      excerpt: "दूरसञ्चार प्राधिकरणद्वारा ५जी सेवा सञ्चालन अनुमति र रेडियो फ्रिक्वेन्सी बाँडफाँडको तयारी पूरा।",
      content: `<p><strong>काठमाडौँ।</strong> मुख्य सहरहरूमा ५जी प्रविधिको नमुना परीक्षण सफलतापुर्वक सम्पन्न भएसँगै सेवा प्रदायकहरूले व्यावसायिक सुरुवात गर्ने भएका छन्।</p><p>यस प्रविधिले उच्च गतिको इन्टरनेट र आधुनिक डिजिटल सेवा सञ्चालनमा ठूलो सहयोग पुर्‍याउनेछ।</p>`,
      coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      caption: "तस्बिर: ५जी दूरसञ्चार टावर",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.STANDARD,
      isFeatured: false,
      isBreaking: false,
      views: 6540,
      metaTitle: "नेपालमा ५जी प्रविधि विस्तार | नेपाल खबर",
      metaDescription: "५जी प्रविधिको सफल परीक्षण र व्यावसायिक विस्तार।",
      keywords: "प्रविधि, 5G, इन्टरनेट, ग्याजेट",
      categorySlug: "technology",
    },
    {
      title: "Global Climate Summit Announces Special Aid Package for Developing Nations",
      titleNp: "अन्तर्राष्ट्रिय जलवायु सम्मेलन: विकासोन्मुख राष्ट्रहरूका लागि विशेष अनुदान घोषणा",
      slug: "global-climate-summit-aid-package",
      excerpt: "जलवायु परिवर्तनको असर न्यूनीकरणका लागि हिमाली राष्ट्र नेपालसहित विकासोन्मुख देशहरूलाई कोष उपलब्ध गराइने।",
      content: `<p><strong>जेनेभा।</strong> संयुक्त राष्ट्रसंघको तत्वावधानमा आयोजित जलवायु शिखर सम्मेलनमा ऐतिहासिक सहमति जुटेको छ।</p><p>ग्लेशियर पग्लिने समस्या झेल्दै आएका नेपाल जस्ता हिमाली देशहरूलाई विशेष क्षतिपूर्ति कोषमार्फत अनुदान प्रदान गरिने सम्झौता भएको छ।</p>`,
      coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
      caption: "तस्बिर: हिमाली हिमशृङ्खला",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.STANDARD,
      isFeatured: false,
      isBreaking: false,
      views: 3890,
      metaTitle: "विश्व जलवायु सम्मेलन निर्णय | नेपाल खबर",
      metaDescription: "जलवायु शिखर सम्मेलनमा विकासोन्मुख राष्ट्रहरूका लागि अनुदान घोषणा।",
      keywords: "विश्व, वातावरण, जलवायु, UN",
      categorySlug: "world",
    },
    {
      title: "Nepal International Film Festival Preparations Complete",
      titleNp: "अन्तर्राष्ट्रिय नेपाली चलचित्र महोत्सवको तयारी पूरा, ३० भन्दा बढी देशका सिनेमा प्रदर्शन हुने",
      slug: "nepal-international-film-festival-preparations",
      excerpt: "राजधानीमा आगामी सातादेखि आयोजना हुने अन्तर्राष्ट्रिय चलचित्र महोत्सवमा मौलिक नेपाली तथा विदेशी चलचित्रहरू देखाइने।",
      content: `<p><strong>काठमाडौँ।</strong> नेपाल फिल्म सोसाइटीको आयोजनामा वार्षिक रूपमा सञ्चालन हुने अन्तर्राष्ट्रिय चलचित्र महोत्सवको सम्पूर्ण तयारी पूरा भएको छ।</p><p>समारोहमा उत्कृष्ट कथानक, वृत्तचित्र र सर्ट फिल्महरूलाई विभिन्न विधामा पुरस्कृत गरिनेछ।</p>`,
      coverImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
      caption: "तस्बिर: चलचित्र महोत्सव रेड कार्पेट",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.STANDARD,
      isFeatured: false,
      isBreaking: false,
      views: 4980,
      metaTitle: "नेपाली चलचित्र महोत्सव | नेपाल खबर",
      metaDescription: "अन्तर्राष्ट्रिय नेपाली चलचित्र महोत्सवको तयारी पूरा।",
      keywords: "मनोरञ्जन, चलचित्र, कला, सिनेमा",
      categorySlug: "entertainment",
    },
    {
      title: "Mountain Tourism and Trekking Season Reaches Peak in Nepal",
      titleNp: "नेपालमा पदयात्रा र पर्यटन याम उत्कर्षमा, स्वदेशी तथा विदेशी पर्यटकको घुइँचो",
      slug: "nepal-mountain-tourism-trekking-peak-season",
      excerpt: "मनाङ, मुस्ताङ र अन्नपूर्ण पदमार्गमा पर्यटकको बाक्लो उपस्थिति। स्थानीय होटेल तथा पर्यटन व्यवसायीहरू उत्साहित।",
      content: `<p><strong>पोखरा।</strong> अनुकूल मौसमसँगै अन्नपूर्ण चक्रपथ र सगरमाथा क्षेत्रमा पदयात्रा गर्ने पर्यटकहरूको सङ्ख्यामा उल्लेख्य वृद्धि भएको छ।</p><p>नेपाल पर्यटन बोर्डका अनुसार यस वर्ष गत वर्षको तुलनामा २५ प्रतिशत बढी पर्यटक नेपाल भित्रिएका छन्।</p>`,
      coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      caption: "तस्बिर: अन्नपूर्ण हिमशृङ्खला पदमार्ग",
      status: ArticleStatus.PUBLISHED,
      type: ArticleType.STANDARD,
      isFeatured: false,
      isBreaking: false,
      views: 5780,
      metaTitle: "नेपालमा पदयात्रा पर्यटन उत्कर्षमा | नेपाल खबर",
      metaDescription: "नेपालमा पर्यटन र पदयात्रा याम सुरु, मनाङ-मुस्ताङमा पर्यटकको घुइँचो।",
      keywords: "पर्यटन, जीवनशैली, अन्नपूर्ण, पदयात्रा",
      categorySlug: "lifestyle",
    },
  ];

  for (const art of sampleArticles) {
    const categoryId = categoryMap[art.categorySlug];
    if (!categoryId) continue;

    await prisma.article.upsert({
      where: { slug: art.slug },
      update: {
        title: art.title,
        titleNp: art.titleNp,
        content: art.content,
        excerpt: art.excerpt,
        coverImage: art.coverImage,
        caption: art.caption,
        status: art.status,
        type: art.type,
        isFeatured: art.isFeatured,
        isBreaking: art.isBreaking,
        views: art.views,
        metaTitle: art.metaTitle,
        metaDescription: art.metaDescription,
        keywords: art.keywords,
        authorId: admin.id,
        categoryId,
        publishedAt: new Date(),
      },
      create: {
        title: art.title,
        titleNp: art.titleNp,
        slug: art.slug,
        content: art.content,
        excerpt: art.excerpt,
        coverImage: art.coverImage,
        caption: art.caption,
        status: art.status,
        type: art.type,
        isFeatured: art.isFeatured,
        isBreaking: art.isBreaking,
        views: art.views,
        metaTitle: art.metaTitle,
        metaDescription: art.metaDescription,
        keywords: art.keywords,
        authorId: admin.id,
        categoryId,
        publishedAt: new Date(),
      },
    });
  }

  console.log(`✅ Seeded ${sampleArticles.length} rich articles across all categories & formats!`);
  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
