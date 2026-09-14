/** Nepal's seven provinces — public archives, widgets, sitemap. */
export const PROVINCES = [
  { id: 1, name: "कोशी", nameEn: "Koshi", slug: "koshi" },
  { id: 2, name: "मधेश", nameEn: "Madhesh", slug: "madhesh" },
  { id: 3, name: "बागमती", nameEn: "Bagmati", slug: "bagmati" },
  { id: 4, name: "गण्डकी", nameEn: "Gandaki", slug: "gandaki" },
  { id: 5, name: "लुम्बिनी", nameEn: "Lumbini", slug: "lumbini" },
  { id: 6, name: "कर्णाली", nameEn: "Karnali", slug: "karnali" },
  { id: 7, name: "सुदूरपश्चिम", nameEn: "Sudurpashchim", slug: "sudurpashchim" },
] as const;

export type ProvinceDef = (typeof PROVINCES)[number];

/** Admin article form / filters — numeric province codes. */
export const NEPAL_PROVINCES = [
  { value: 1, label: "Province 1 — Koshi", labelNp: "प्रदेश १ — कोशी" },
  { value: 2, label: "Province 2 — Madhesh", labelNp: "प्रदेश २ — मधेश" },
  { value: 3, label: "Province 3 — Bagmati", labelNp: "प्रदेश ३ — बागमती" },
  { value: 4, label: "Province 4 — Gandaki", labelNp: "प्रदेश ४ — गण्डकी" },
  { value: 5, label: "Province 5 — Lumbini", labelNp: "प्रदेश ५ — लुम्बिनी" },
  { value: 6, label: "Province 6 — Karnali", labelNp: "प्रदेश ६ — कर्णाली" },
  { value: 7, label: "Province 7 — Sudurpashchim", labelNp: "प्रदेश ७ — सुदूरपश्चिम" },
] as const;

export function getProvinceLabel(province: number | null | undefined): string | null {
  if (!province) return null;
  return NEPAL_PROVINCES.find((p) => p.value === province)?.label ?? `Province ${province}`;
}
