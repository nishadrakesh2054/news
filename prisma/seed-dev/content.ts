/** HTML paragraph helpers and bilingual body builders for demo articles. */

export function p(...paragraphs: string[]) {
  return paragraphs.map((text) => `<p>${text}</p>`).join("\n");
}

export type TopicPack = {
  categorySlug: string;
  imageQuery: string;
  tagSlugs: string[];
  topics: Array<{
    title: string;
    titleNp: string;
    focusEn: string[];
    focusNp: string[];
  }>;
};

function joinSentences(parts: string[]): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Build ~300–450 word EN + NP article bodies with news structure.
 */
export function buildBodies(opts: {
  placeEn: string;
  placeNp: string;
  title: string;
  titleNp: string;
  focusEn: string[];
  focusNp: string[];
  index: number;
}): { content: string; contentNp: string; excerpt: string; excerptNp: string } {
  const { placeEn, placeNp, focusEn, focusNp, index } = opts;
  const variant = index % 3;

  const leadEn = joinSentences([
    `<strong>${placeEn}.</strong>`,
    focusEn[0] ||
      "A development-style briefing examines how communities, institutions and readers can follow this topic with clearer context.",
    "Echo Manch is publishing this as realistic demo coverage for portal testing — not as a verified breaking alert.",
  ]);

  const mainEn = joinSentences([
    focusEn[1] ||
      "Stakeholders say planning, communication and measured follow-up remain essential when similar themes appear in public debate.",
    focusEn[2] ||
      "Analysts note that readers benefit from background, timelines and practical checkpoints rather than speculative claims.",
    variant === 0
      ? "Local desks have compiled open-source reference points, historical patterns and frequently asked questions so editors can validate presentation in category pages, search and bilingual layouts."
      : variant === 1
        ? "The briefing highlights how newsrooms can balance speed with accuracy by separating confirmed facts from unfolding speculation and by linking related explainers."
        : "Editors emphasise service journalism: clarifying what is known, what remains uncertain, and which official channels readers should monitor for updates.",
  ]);

  const supportEn = joinSentences([
    focusEn[3] ||
      "Supporting detail includes sector context, regional comparisons and notes on how similar stories have been framed in previous reporting cycles.",
    "Training materials for reporters underline attribution standards, avoidance of fabricated quotes, and careful handling of finance or emergency claims in demo content.",
    "Design and product teams can use these pieces to verify card layouts, featured slots, related-article modules and Nepali/English switching without relying on thin placeholder copy.",
    "Each section is written so category archives, search snippets and Open Graph previews receive coherent bilingual text rather than empty or single-line stubs.",
  ]);

  const contextEn = joinSentences([
    focusEn[4] ||
      "Background sections summarise why the theme matters for households, students, businesses or civic institutions depending on the beat.",
    "Where Australia or Nepal–Australia links appear, the copy stays general and community-oriented, focusing on education, culture, work and city life rather than invented policy announcements.",
    "Publication timestamps are staggered so homepage feeds, archives and dashboard filters exercise realistic sorting behaviour.",
    "Province and district fields are filled only when the beat benefits from geographic filtering in the existing schema.",
  ]);

  const factsEn = joinSentences([
    "Checklist for readers of this demo article: treat figures as illustrative, confirm any operational guidance from official sources, and use the piece primarily to evaluate site UX.",
    "SEO fields, tags and category placement are populated so search and taxonomy pages receive meaningful bilingual strings.",
    "Image credits rely on free stock photography licensed for demonstration; captions remain generic and non-defamatory.",
    "Draft versus published mixtures help editors rehearse moderation queues, while featured and home flags exercise spotlight components.",
  ]);

  const closeEn = joinSentences([
    focusEn[5] ||
      "Echo Manch will continue expanding development datasets so engineers and editors can stress-test pagination, drafts and published queues.",
    "This article concludes with a reminder that demo content should never be forwarded as verified live reporting.",
    "Questions about the seed system belong in the engineering handbook, not in public comment threads framed as news tips.",
  ]);

  const leadNp = joinSentences([
    `<strong>${placeNp}।</strong>`,
    focusNp[0] ||
      "यो डेमो शैलीको समाचारले पाठक, संस्था र समुदायले विषयलाई कसरी स्पष्ट सन्दर्भसहित बुझ्न सकिन्छ भन्ने उदाहरण दिन्छ।",
    "इको माञ्चले यसलाई पोर्टल परीक्षणका लागि यथार्थपरक डेमो सामग्रीका रूपमा प्रकाशन गरेको हो — प्रमाणित ब्रेकिङ अलर्ट होइन।",
  ]);

  const mainNp = joinSentences([
    focusNp[1] ||
      "सरोकारवालाहरूका अनुसार योजना, सञ्चार र मापनयोग्य फलोअप सार्वजनिक बहसका लागि महत्त्वपूर्ण रहन्छ।",
    focusNp[2] ||
      "विश्लेषकहरू भन्छन् कि पाठकलाई अनुमानभन्दा पृष्ठभूमि, समयरेखा र व्यावहारिक बुँदा बढी उपयोगी हुन्छ।",
    variant === 0
      ? "स्थानीय डेस्कले श्रेणी पृष्ठ, खोज र द्विभाषी लेआउट परीक्षण गर्न खुला स्रोत सन्दर्भ र सामान्य प्रश्नहरू संकलन गरेको छ।"
      : variant === 1
        ? "यो ब्रिफिङले पुष्टि भएका तथ्य र अनुमान छुट्याएर समाचार कक्षले गति र शुद्धता सन्तुलन गर्न सक्ने तरिका देखाउँछ।"
        : "सम्पादकहरूले सेवा पत्रकारितामा जोड दिएका छन्: के थाहा छ, के अनिश्चित छ र पाठकले कहाँ अपडेट हेर्ने भन्ने स्पष्ट पार्नु।",
  ]);

  const supportNp = joinSentences([
    focusNp[3] ||
      "सहायक विवरणमा क्षेत्रीय सन्दर्भ, तुलनात्मक टिप्पणी र अघिल्ला रिपोर्टिङ चक्रका पाठ समावेश छन्।",
    "डेमो सामग्रीमा नक्कली उद्धरण, बनावटी सरकारी घोषणा वा आपतकालीन दाबी प्रयोग नगर्न प्रशिक्षित गरिएको छ।",
    "डिजाइन र प्रोडक्ट टोलीले कार्ड लेआउट, फिचर्ड स्लट र सम्बन्धित समाचार मोड्युल जाँच गर्न यी लेख प्रयोग गर्न सक्छन्।",
    "श्रेणी अभिलेख, खोज स्निपेट र ओपन ग्राफ पूर्वावलोकनका लागि खाली वा एकहरफीय पाठ नभई सुसंगत द्विभाषी अनुच्छेद राखिएको छ।",
  ]);

  const contextNp = joinSentences([
    focusNp[4] ||
      "पृष्ठभूमि खण्डले विषय घरपरिवार, विद्यार्थी, व्यवसाय वा नागरिक संस्थालाई किन महत्त्वपूर्ण छ भन्ने संक्षेपमा बताउँछ।",
    "अष्ट्रेलिया वा नेपाल–अष्ट्रेलिया सम्बन्ध उल्लेख हुँदा सामग्री सामान्य र समुदायकेन्द्रित राखिएको छ।",
    "प्रकाशन समय फरक–फरक राखिएको छ ताकि होमपेज, अभिलेख र ड्यासबोर्ड फिल्टरले वास्तविक क्रमबद्धता परीक्षण गर्न सकून्।",
    "प्रदेश र जिल्ला क्षेत्र विद्यमान स्किमाको भौगोलिक फिल्टर उपयोगी हुने बीटमा मात्र भरिन्छन्।",
  ]);

  const factsNp = joinSentences([
    "पाठक चेकलिस्ट: अंकहरू उदाहरण मात्र हुन्, कुनै पनि सञ्चालन निर्देशन आधिकारिक स्रोतबाट पुष्टि गर्नुहोस्।",
    "एसईओ, ट्याग र श्रेणी क्षेत्र भरिएका छन् जसले खोज र वर्गीकरण पृष्ठमा अर्थपूर्ण द्विभाषी पाठ पुर्‍याउँछ।",
    "तस्बिरहरू निःशुल्क स्टक फोटोबाट लिइएका डेमो सामग्री हुन्।",
    "ड्राफ्ट र प्रकाशित मिश्रणले मोडरेशन कतार अभ्यास गराउँछ भने फिचर्ड/होम फ्ल्यागले स्पॉटलाइट कम्पोनेन्ट परीक्षण गर्छ।",
  ]);

  const closeNp = joinSentences([
    focusNp[5] ||
      "इको माञ्चले पेजिनेसन, ड्राफ्ट र प्रकाशित सूची परीक्षण गर्न विकास डेटासेट विस्तार गर्नेछ।",
    "यो लेखको निष्कर्ष: डेमो सामग्रीलाई प्रमाणित लाइभ रिपोर्टका रूपमा अग्रेषण नगर्नुहोस्।",
    "सिड प्रणालीसम्बन्धी प्रश्न इन्जिनियरिङ हातेपुस्तिकामा राख्नुहोस्, सार्वजनिक कमेन्ट थ्रेडमा समाचार टिप जस्तो नबनाउनुहोस्।",
  ]);

  const content = p(leadEn, mainEn, supportEn, contextEn, factsEn, closeEn);
  const contentNp = p(leadNp, mainNp, supportNp, contextNp, factsNp, closeNp);

  const excerpt = joinSentences([
    focusEn[0]?.replace(/<[^>]+>/g, "") ||
      "A development briefing for Echo Manch portal testing.",
    "Demo coverage — not a verified breaking alert.",
  ]).slice(0, 280);

  const excerptNp = joinSentences([
    focusNp[0]?.replace(/<[^>]+>/g, "") ||
      "इको माञ्च पोर्टल परीक्षणका लागि डेमो शैलीको ब्रिफिङ।",
    "यो प्रमाणित ब्रेकिङ अलर्ट होइन।",
  ]).slice(0, 280);

  return { content, contentNp, excerpt, excerptNp };
}

export function approxWordCount(html: string): number {
  return html
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}
