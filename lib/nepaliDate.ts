/**
 * Helper functions for Nepali Devanagari numbers and B.S. dates
 */

export function toDevanagariDigits(num: number | string): string {
  const devanagariDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return String(num).replace(/\d/g, (d) => devanagariDigits[parseInt(d, 10)]);
}

export function getFormattedNepaliDate(date: Date = new Date()): string {
  const nepaliDays = [
    "आइतबार",
    "सोमबार",
    "मङ्गलबार",
    "बुधबार",
    "बिहीबार",
    "शुक्रबार",
    "शनिबार",
  ];

  const nepaliMonths = [
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
  ];

  const dayOfWeek = nepaliDays[date.getDay()];

  // Approximate BS year conversion for display (2026 AD -> 2083 BS)
  const bsYear = date.getFullYear() + 57;
  const bsMonth = nepaliMonths[date.getMonth()];
  const bsDate = date.getDate();

  return `${dayOfWeek}, ${toDevanagariDigits(bsDate)} ${bsMonth} ${toDevanagariDigits(bsYear)}`;
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
