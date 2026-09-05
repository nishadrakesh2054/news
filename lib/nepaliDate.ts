/**
 * Helper functions for Nepali Devanagari numbers and B.S. dates
 */
import { getBikramSambatDate, toNepaliDigits } from "@/lib/bs-calendar";
import type { LanguageEditionType } from "@/lib/language";

export function toDevanagariDigits(num: number | string): string {
  return toNepaliDigits(num);
}

export function getFormattedNepaliDate(date: Date = new Date()): string {
  try {
    const bs = getBikramSambatDate(date);
    return `${bs.dayOfWeekNp}, ${bs.dayNp} ${bs.monthNp} ${bs.yearNp}`;
  } catch {
    // Outside BS table range — fall back to AD with Nepali digits
    const nepaliDays = [
      "आइतबार",
      "सोमबार",
      "मङ्गलबार",
      "बुधबार",
      "बिहीबार",
      "शुक्रबार",
      "शनिबार",
    ];
    return `${nepaliDays[date.getDay()]}, ${toDevanagariDigits(date.getDate())}/${toDevanagariDigits(date.getMonth() + 1)}/${toDevanagariDigits(date.getFullYear())}`;
  }
}

function getFormattedEnglishDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Relative time — English on `en`, Nepali (Devanagari) on `ne`. */
export function formatTimeAgo(
  dateInput: Date | string,
  lang: LanguageEditionType = "ne"
): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (lang === "en") {
    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? "1 minute ago" : `${diffInMinutes} minutes ago`;
    }
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
    }
    return getFormattedEnglishDate(date);
  }

  if (diffInSeconds < 60) {
    return "भर्खरै";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${toDevanagariDigits(diffInMinutes)} मिनेट अघि`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${toDevanagariDigits(diffInHours)} घण्टा अघि`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${toDevanagariDigits(diffInDays)} दिन अघि`;
  }

  return getFormattedNepaliDate(date);
}

/** @deprecated Prefer formatTimeAgo(date, lang) */
export function formatTimeAgoNp(dateInput: Date | string): string {
  return formatTimeAgo(dateInput, "ne");
}
