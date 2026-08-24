// Bikram Sambat (B.S.) Date & Tithi Helper Library

export interface BSDateInfo {
  yearNp: string;
  monthNp: string;
  dayNp: string;
  dayOfWeekNp: string;
  formattedBs: string;
  tithiNp: string;
}

const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export function toNepaliDigits(num: number | string): string {
  return String(num)
    .split("")
    .map((char) => (char >= "0" && char <= "9" ? nepaliDigits[parseInt(char, 10)] : char))
    .join("");
}

const bsMonths = [
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

const weekDaysNp = [
  "आइतबार",
  "सोमबार",
  "मङ्गलबार",
  "बुधबार",
  "बिहीबार",
  "शुक्रबार",
  "शनिबार",
];

const tithis = [
  "प्रतिपदा",
  "द्वितीया",
  "तृतीया",
  "चतुर्थी",
  "पञ्चमी",
  "षष्ठी",
  "सप्तमी",
  "अष्टमी",
  "नवमी",
  "दशमी",
  "एकादशी",
  "द्वादशी",
  "त्रयोदशी",
  "चतुर्दशी",
  "पूर्णिमा",
  "अमावस्या",
];

/**
 * Converts a Gregorian Date object to Bikram Sambat date details
 */
export function getBikramSambatDate(date: Date = new Date()): BSDateInfo {
  // Anchor date: 2026-08-24 is B.S. 2083 Bhadra 8
  const baseAd = new Date(2026, 7, 24).getTime();
  const diffDays = Math.floor((date.getTime() - baseAd) / (1000 * 60 * 60 * 24));

  let bsYear = 2083;
  let bsMonthIndex = 4; // Bhadra
  let bsDay = 8 + diffDays;

  // Normalize day across months (approx 30-32 days per BS month)
  while (bsDay > 30) {
    bsDay -= 30;
    bsMonthIndex++;
    if (bsMonthIndex >= 12) {
      bsMonthIndex = 0;
      bsYear++;
    }
  }

  while (bsDay < 1) {
    bsMonthIndex--;
    if (bsMonthIndex < 0) {
      bsMonthIndex = 11;
      bsYear--;
    }
    bsDay += 30;
  }

  const dayOfWeekIndex = date.getDay();
  const yearNp = toNepaliDigits(bsYear);
  const monthNp = bsMonths[bsMonthIndex] || "भदौ";
  const dayNp = toNepaliDigits(bsDay);
  const dayOfWeekNp = weekDaysNp[dayOfWeekIndex];
  const tithiNp = tithis[bsDay % tithis.length];

  return {
    yearNp,
    monthNp,
    dayNp,
    dayOfWeekNp,
    formattedBs: `बि.सं. ${yearNp} ${monthNp} ${dayNp}, ${dayOfWeekNp}`,
    tithiNp: `शुक्ल पक्ष - ${tithiNp}`,
  };
}
