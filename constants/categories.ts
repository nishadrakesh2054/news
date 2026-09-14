/**
 * Canonical public categories for Echo Manch (exactly 12).
 * Used by merge script + seed-dev.
 */
export type CanonicalCategory = {
  name: string;
  nameNp: string;
  slug: string;
  order: number;
  description: string;
  descriptionNp: string;
  /** Existing DB slugs whose articles should move here before those categories are removed. */
  mergeFromSlugs: string[];
};

export const CANONICAL_CATEGORIES: CanonicalCategory[] = [
  {
    name: "Politics",
    nameNp: "राजनीति",
    slug: "politics",
    order: 1,
    description: "National and international politics",
    descriptionNp: "राष्ट्रिय तथा अन्तर्राष्ट्रिय राजनीति",
    mergeFromSlugs: ["politics"],
  },
  {
    name: "Economy & Business",
    nameNp: "अर्थ–व्यापार",
    slug: "economy-business",
    order: 2,
    description: "Markets, banking, trade and business",
    descriptionNp: "बजार, बैंकिङ, व्यापार र उद्यम",
    mergeFromSlugs: ["economy-business", "economy", "business", "arthatantra"],
  },
  {
    name: "Society",
    nameNp: "समाज",
    order: 3,
    slug: "society",
    description: "Social affairs and public interest",
    descriptionNp: "सामाजिक सरोकार र जनहितका विषय",
    mergeFromSlugs: ["society", "environment"],
  },
  {
    name: "National",
    nameNp: "राष्ट्रिय",
    slug: "national",
    order: 4,
    description: "General national news",
    descriptionNp: "अन्यत्र नमिलेका राष्ट्रिय समाचार",
    mergeFromSlugs: ["national"],
  },
  {
    name: "World",
    nameNp: "विश्व",
    slug: "world",
    order: 5,
    description: "World and international affairs",
    descriptionNp: "विश्व र अन्तर्राष्ट्रिय मामिला",
    mergeFromSlugs: ["world", "international"],
  },
  {
    name: "Sports",
    nameNp: "खेलकुद",
    slug: "sports",
    order: 6,
    description: "Cricket, football and sports",
    descriptionNp: "क्रिकेट, फुटबल र खेलकुद",
    mergeFromSlugs: ["sports", "khelkud"],
  },
  {
    name: "Entertainment",
    nameNp: "मनोरञ्जन",
    slug: "entertainment",
    order: 7,
    description: "Film, music and culture",
    descriptionNp: "चलचित्र, संगीत र संस्कृति",
    mergeFromSlugs: ["entertainment", "manoranjan"],
  },
  {
    name: "Technology & Science",
    nameNp: "प्रविधि–विज्ञान",
    slug: "technology-science",
    order: 8,
    description: "Technology, digital innovation and science",
    descriptionNp: "प्रविधि, डिजिटल नवप्रवर्तन र विज्ञान",
    mergeFromSlugs: ["technology-science", "technology", "science"],
  },
  {
    name: "Health & Lifestyle",
    nameNp: "स्वास्थ्य–जीवनशैली",
    slug: "health-lifestyle",
    order: 9,
    description: "Health, wellness and lifestyle",
    descriptionNp: "स्वास्थ्य, कल्याण र जीवनशैली",
    mergeFromSlugs: ["health-lifestyle", "health", "lifestyle"],
  },
  {
    name: "Education",
    nameNp: "शिक्षा",
    slug: "education",
    order: 10,
    description: "Schools, universities and learning",
    descriptionNp: "विद्यालय, विश्वविद्यालय र सिकाइ",
    mergeFromSlugs: ["education"],
  },
  {
    name: "Tourism & Agriculture",
    nameNp: "पर्यटन–कृषि",
    slug: "tourism-agriculture",
    order: 11,
    description: "Travel, hospitality, farming and food systems",
    descriptionNp: "यात्रा, आतिथ्य, कृषि र खाद्य प्रणाली",
    mergeFromSlugs: ["tourism-agriculture", "tourism", "agriculture"],
  },
  {
    name: "Opinion",
    nameNp: "विचार",
    slug: "opinion",
    order: 12,
    description: "Editorials and analysis",
    descriptionNp: "सम्पादकीय र विश्लेषण",
    mergeFromSlugs: ["opinion", "vichar"],
  },
];

/** Old category path → new path (for Redirect table / legacy links). */
export const CATEGORY_SLUG_REDIRECTS: Record<string, string> = {
  economy: "economy-business",
  business: "economy-business",
  arthatantra: "economy-business",
  technology: "technology-science",
  science: "technology-science",
  health: "health-lifestyle",
  lifestyle: "health-lifestyle",
  tourism: "tourism-agriculture",
  agriculture: "tourism-agriculture",
  international: "world",
  environment: "society",
};

export function resolveCanonicalCategorySlug(slug: string): string {
  return CATEGORY_SLUG_REDIRECTS[slug] || slug;
}
