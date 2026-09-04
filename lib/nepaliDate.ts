/**
 * Helper functions for Nepali Devanagari numbers and B.S. dates
 */
import { getBikramSambatDate, toNepaliDigits } from "@/lib/bs-calendar";

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

export function formatTimeAgoNp(dateInput: Date | string): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

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
