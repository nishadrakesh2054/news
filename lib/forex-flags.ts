/** Currency code → ISO 3166-1 alpha-2 country for flag assets. */
const CURRENCY_COUNTRY: Record<string, string> = {
  USD: "us",
  INR: "in",
  EUR: "eu",
  GBP: "gb",
  AUD: "au",
  CAD: "ca",
  JPY: "jp",
  QAR: "qa",
  AED: "ae",
  SAR: "sa",
  MYR: "my",
  KRW: "kr",
  KWD: "kw",
  BHD: "bh",
  CHF: "ch",
  CNY: "cn",
  SGD: "sg",
  SEK: "se",
  DKK: "dk",
  HKD: "hk",
  THB: "th",
  PKR: "pk",
};

/** Fallback emoji (optional UI); prefer {@link getForexFlagUrl}. */
export const FOREX_FLAG_EMOJI: Record<string, string> = {
  USD: "🇺🇸",
  INR: "🇮🇳",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  AUD: "🇦🇺",
  CAD: "🇨🇦",
  JPY: "🇯🇵",
  QAR: "🇶🇦",
  AED: "🇦🇪",
  SAR: "🇸🇦",
  MYR: "🇲🇾",
  KRW: "🇰🇷",
  KWD: "🇰🇼",
  BHD: "🇧🇭",
  CHF: "🇨🇭",
  CNY: "🇨🇳",
  SGD: "🇸🇬",
};

/** Flag image URL (flagcdn) — works on Linux where emoji flags often fail. */
export function getForexFlagUrl(currencyCode: string, width = 40): string | null {
  const country = CURRENCY_COUNTRY[currencyCode.toUpperCase()];
  if (!country) return null;
  return `https://flagcdn.com/w${width}/${country}.png`;
}
