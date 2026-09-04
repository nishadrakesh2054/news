/**
 * Accurate Bikram Sambat ↔ Gregorian conversion.
 * Epoch: BS 2000 Baishakh 1 = AD 1943-04-14 (UTC day arithmetic).
 * Range: BS 2000–2090.
 */
import { BS_END_YEAR, BS_MONTH_DAYS, BS_START_YEAR } from "./bs-calendar-data";

export { BS_END_YEAR, BS_START_YEAR };

export interface BSDateParts {
  year: number;
  /** 1–12 (Baishakh–Chaitra) */
  month: number;
  day: number;
}

export interface BSDateInfo {
  year: number;
  month: number;
  day: number;
  yearNp: string;
  monthNp: string;
  monthEn: string;
  dayNp: string;
  dayOfWeekNp: string;
  dayOfWeekEn: string;
  formattedBs: string;
  formattedAd: string;
}

const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export function toNepaliDigits(num: number | string): string {
  return String(num)
    .split("")
    .map((char) => (char >= "0" && char <= "9" ? nepaliDigits[parseInt(char, 10)] : char))
    .join("");
}

export const BS_MONTHS_NP = [
  "वैशाख",
  "जेठ",
  "असार",
  "साउन",
  "भदौ",
  "असोज",
  "कात्तिक",
  "मंसिर",
  "पुस",
  "माघ",
  "फागुन",
  "चैत",
] as const;

export const BS_MONTHS_EN = [
  "Baishakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const;

const WEEKDAYS_NP = [
  "आइतबार",
  "सोमबार",
  "मङ्गलबार",
  "बुधबार",
  "बिहीबार",
  "शुक्रबार",
  "शनिबार",
] as const;

const WEEKDAYS_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** AD epoch day corresponding to BS day-index 0 (day before BS 2000-01-01). */
const AD_EPOCH_UTC = Date.UTC(1943, 3, 13);

function daysInBsYear(yearIndex: number): number {
  return BS_MONTH_DAYS[yearIndex].reduce((a, b) => a + b, 0);
}

const yearOffsets: number[] = (() => {
  const offsets: number[] = [];
  let acc = 0;
  for (let i = 0; i < BS_MONTH_DAYS.length; i++) {
    offsets.push(acc);
    acc += daysInBsYear(i);
  }
  return offsets;
})();

/** Days passed since epoch such that BS 2000-01-01 => 1. */
function bsToDayIndex(year: number, month0: number, day: number): number {
  const yi = year - BS_START_YEAR;
  if (yi < 0 || yi >= BS_MONTH_DAYS.length) {
    throw new Error(`BS year ${year} out of range ${BS_START_YEAR}–${BS_END_YEAR}`);
  }
  if (month0 < 0 || month0 > 11) throw new Error("Invalid BS month");
  const maxDay = BS_MONTH_DAYS[yi][month0];
  if (day < 1 || day > maxDay) {
    throw new Error(`Invalid BS day ${day} for ${year}/${month0 + 1} (max ${maxDay})`);
  }
  let days = yearOffsets[yi];
  for (let i = 0; i < month0; i++) days += BS_MONTH_DAYS[yi][i];
  return days + day;
}

function dayIndexToBs(daysPassed: number): BSDateParts {
  const yi = yearOffsets.findIndex(
    (off, i) => daysPassed > off && daysPassed <= off + daysInBsYear(i)
  );
  if (yi < 0) {
    throw new Error("Date outside supported BS range (2000–2090)");
  }
  let rem = daysPassed - yearOffsets[yi];
  let month0 = 0;
  while (month0 < 12 && rem > BS_MONTH_DAYS[yi][month0]) {
    rem -= BS_MONTH_DAYS[yi][month0];
    month0++;
  }
  return { year: BS_START_YEAR + yi, month: month0 + 1, day: rem };
}

function adYmdToDayIndex(year: number, month0: number, day: number): number {
  const cur = Date.UTC(year, month0, day);
  return Math.round((cur - AD_EPOCH_UTC) / 86_400_000);
}

function dayIndexToAdYmd(daysPassed: number): { year: number; month: number; day: number } {
  const dt = new Date(AD_EPOCH_UTC + daysPassed * 86_400_000);
  return {
    year: dt.getUTCFullYear(),
    month: dt.getUTCMonth() + 1,
    day: dt.getUTCDate(),
  };
}

/** Parse `YYYY-MM-DD` as a local calendar date (avoids UTC shift). */
export function parseLocalDateInput(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) {
    return null;
  }
  return date;
}

export function formatLocalDateInput(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function daysInBsMonth(year: number, month1: number): number {
  const yi = year - BS_START_YEAR;
  if (yi < 0 || yi >= BS_MONTH_DAYS.length || month1 < 1 || month1 > 12) return 30;
  return BS_MONTH_DAYS[yi][month1 - 1];
}

export function adToBsParts(date: Date): BSDateParts {
  const idx = adYmdToDayIndex(date.getFullYear(), date.getMonth(), date.getDate());
  return dayIndexToBs(idx);
}

export function bsToAdParts(year: number, month1: number, day: number): {
  year: number;
  month: number;
  day: number;
} {
  const idx = bsToDayIndex(year, month1 - 1, day);
  return dayIndexToAdYmd(idx);
}

export function bsToAdDate(year: number, month1: number, day: number): Date {
  const ad = bsToAdParts(year, month1, day);
  return new Date(ad.year, ad.month - 1, ad.day);
}

function enrich(parts: BSDateParts, ad: Date): BSDateInfo {
  const dow = ad.getDay();
  const yearNp = toNepaliDigits(parts.year);
  const dayNp = toNepaliDigits(parts.day);
  const monthNp = BS_MONTHS_NP[parts.month - 1];
  const monthEn = BS_MONTHS_EN[parts.month - 1];
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    yearNp,
    monthNp,
    monthEn,
    dayNp,
    dayOfWeekNp: WEEKDAYS_NP[dow],
    dayOfWeekEn: WEEKDAYS_EN[dow],
    formattedBs: `बि.सं. ${yearNp} ${monthNp} ${dayNp}, ${WEEKDAYS_NP[dow]}`,
    formattedAd: `${WEEKDAYS_EN[dow]}, ${ad.getDate()} ${ad.toLocaleString("en", { month: "long" })} ${ad.getFullYear()}`,
  };
}

/** Convert Gregorian Date → Bikram Sambat display info. */
export function getBikramSambatDate(date: Date = new Date()): BSDateInfo {
  const parts = adToBsParts(date);
  return enrich(parts, date);
}

/** Convert BS Y/M/D → display info (+ matching AD). */
export function getBikramSambatFromBs(
  year: number,
  month1: number,
  day: number
): BSDateInfo {
  const ad = bsToAdDate(year, month1, day);
  return enrich({ year, month: month1, day }, ad);
}

export function isBsInRange(year: number): boolean {
  return year >= BS_START_YEAR && year <= BS_END_YEAR;
}
