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
