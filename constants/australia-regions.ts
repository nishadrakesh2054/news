/** Fixed Australia catalog — 6 states + 2 territories (not CMS-editable). */

export type AuRegionCode =
  | "NSW"
  | "VIC"
  | "QLD"
  | "SA"
  | "WA"
  | "TAS"
  | "ACT"
  | "NT";

export type AuRegionKind = "state" | "territory";

export type AuRegionDef = {
  code: AuRegionCode;
  slug: string;
  name: string;
  nameNp: string;
  short: string;
  kind: AuRegionKind;
};

export const AU_REGIONS: readonly AuRegionDef[] = [
  { code: "NSW", slug: "nsw", name: "New South Wales", nameNp: "न्यु साउथ वेल्स", short: "NSW", kind: "state" },
  { code: "VIC", slug: "victoria", name: "Victoria", nameNp: "भिक्टोरिया", short: "VIC", kind: "state" },
  { code: "QLD", slug: "queensland", name: "Queensland", nameNp: "क्विन्सल्यान्ड", short: "QLD", kind: "state" },
  { code: "SA", slug: "south-australia", name: "South Australia", nameNp: "साउथ अष्ट्रेलिया", short: "SA", kind: "state" },
  { code: "WA", slug: "western-australia", name: "Western Australia", nameNp: "वेस्टर्न अष्ट्रेलिया", short: "WA", kind: "state" },
  { code: "TAS", slug: "tasmania", name: "Tasmania", nameNp: "तास्मानिया", short: "TAS", kind: "state" },
  { code: "ACT", slug: "act", name: "Australian Capital Territory", nameNp: "एसीटी", short: "ACT", kind: "territory" },
  { code: "NT", slug: "northern-territory", name: "Northern Territory", nameNp: "नर्दर्न टेरिटोरी", short: "NT", kind: "territory" },
] as const;

export const AU_STATE_CODES = AU_REGIONS.filter((r) => r.kind === "state").map((r) => r.code);
export const AU_TERRITORY_CODES = AU_REGIONS.filter((r) => r.kind === "territory").map((r) => r.code);

export const AU_REGION_CODES = AU_REGIONS.map((r) => r.code);

export function isAuRegionCode(value: unknown): value is AuRegionCode {
  return typeof value === "string" && (AU_REGION_CODES as readonly string[]).includes(value);
}

export function getAuRegion(code: string | null | undefined): AuRegionDef | null {
  if (!code) return null;
  return AU_REGIONS.find((r) => r.code === code) ?? null;
}

export function getAuRegionBySlug(slug: string): AuRegionDef | null {
  return AU_REGIONS.find((r) => r.slug === slug) ?? null;
}

export function resolveAuRegionName(
  region: AuRegionDef,
  lang: "ne" | "en"
): string {
  return lang === "en" ? region.name : region.nameNp;
}
