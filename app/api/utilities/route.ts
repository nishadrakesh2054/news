import { prisma } from "@/lib/prisma";
import { apiSuccess } from "@/lib/api-response";
import { normalizeRashifalList } from "@/lib/rashifal";

/** Avoid DB access during `next build` static generation. */
export const dynamic = "force-dynamic";

interface NRBRateItem {
  currency?: { iso3?: string; code?: string; unit?: number; name?: string };
  iso3?: string;
  code?: string;
  unit?: number;
  name?: string;
  buy: string | number;
  sell: string | number;
}

const CURRENCY_NAME_MAP: Record<string, string> = {
  USD: "अमेरिकी डलर (USD)",
  INR: "भारतीय रुपैयाँ (INR)",
  EUR: "युरो (EUR)",
  GBP: "पाउन्ड स्टर्लिङ (GBP)",
  CHF: "स्विस फ्र्याङ्क (CHF)",
  AUD: "अस्ट्रेलियन डलर (AUD)",
  CAD: "क्यानेडियन डलर (CAD)",
  SGD: "सिङ्गापुर डलर (SGD)",
  JPY: "जापानी येन (JPY 10)",
  CNY: "चिनियाँ युआन (CNY)",
  SAR: "साउदी रियाल (SAR)",
  QAR: "कतारी रियाल (QAR)",
  AED: "युएई दिराम (AED)",
  MYR: "मलेसियन रिङ्गिट (MYR)",
  KRW: "दक्षिण कोरियाली वन (KRW 100)",
  KWD: "कुवेती दिनार (KWD)",
  BHD: "बहराइन दिनार (BHD)",
};

export async function GET() {
  const forexSummary = {
    usd: "१३४.८०",
    inr: "१६०.००",
    eur: "१४६.२०",
    gbp: "१७२.५०",
    updatedAt: new Date().toISOString(),
  };

  let allForexRates: Array<{
    code: string;
    nameNp: string;
    unit: number;
    buy: string;
    sell: string;
  }> = [
    { code: "USD", nameNp: "अमेरिकी डलर (USD)", unit: 1, buy: "134.80", sell: "135.40" },
    { code: "INR", nameNp: "भारतीय रुपैयाँ (INR)", unit: 100, buy: "160.00", sell: "160.15" },
    { code: "EUR", nameNp: "युरो (EUR)", unit: 1, buy: "146.20", sell: "146.85" },
    { code: "GBP", nameNp: "पाउन्ड स्टर्लिङ (GBP)", unit: 1, buy: "172.50", sell: "173.20" },
    { code: "AUD", nameNp: "अस्ट्रेलियन डलर (AUD)", unit: 1, buy: "88.40", sell: "88.80" },
    { code: "CAD", nameNp: "क्यानेडियन डलर (CAD)", unit: 1, buy: "98.20", sell: "98.60" },
    { code: "JPY", nameNp: "जापानी येन (JPY 10)", unit: 10, buy: "8.90", sell: "8.94" },
    { code: "QAR", nameNp: "कतारी रियाल (QAR)", unit: 1, buy: "36.95", sell: "37.12" },
    { code: "AED", nameNp: "युएई दिराम (AED)", unit: 1, buy: "36.70", sell: "36.86" },
    { code: "SAR", nameNp: "साउदी रियाल (SAR)", unit: 1, buy: "35.90", sell: "36.06" },
    { code: "MYR", nameNp: "मलेसियन रिङ्गिट (MYR)", unit: 1, buy: "30.40", sell: "30.55" },
    { code: "KRW", nameNp: "दक्षिण कोरियाली वन (KRW 100)", unit: 100, buy: "10.15", sell: "10.20" },
    { code: "KWD", nameNp: "कुवेती दिनार (KWD)", unit: 1, buy: "440.50", sell: "442.40" },
    { code: "BHD", nameNp: "बहराइन दिनार (BHD)", unit: 1, buy: "357.20", sell: "358.80" },
  ];

  // 1. Fetch Live NRB Forex API
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const nrbRes = await fetch(
      `https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=1&from=${todayStr}&to=${todayStr}`,
      { next: { revalidate: 3600 } }
    );
    if (nrbRes.ok) {
      const nrbJson = await nrbRes.json();
      const payload = nrbJson?.data?.payload?.[0];
      if (payload?.rates && Array.isArray(payload.rates)) {
        const parsedAll = payload.rates.map((r: NRBRateItem) => {
          const code = (r.currency?.iso3 || r.currency?.code || r.iso3 || r.code || "").toUpperCase();
          const name = r.currency?.name || r.name || "";
          const nameNp = CURRENCY_NAME_MAP[code] || (name ? `${name} (${code})` : code);
          return {
            code: code || "FOREX",
            nameNp,
            unit: r.currency?.unit || r.unit || 1,
            buy: String(r.buy),
            sell: String(r.sell),
          };
        }).filter((r: { code: string }) => r.code !== "FOREX");

        if (parsedAll.length > 0) {
          allForexRates = parsedAll;
        }

        const usdRate = payload.rates.find((r: NRBRateItem) => (r.currency?.iso3 || r.currency?.code) === "USD");
        const inrRate = payload.rates.find((r: NRBRateItem) => (r.currency?.iso3 || r.currency?.code) === "INR");
        const eurRate = payload.rates.find((r: NRBRateItem) => (r.currency?.iso3 || r.currency?.code) === "EUR");
        const gbpRate = payload.rates.find((r: NRBRateItem) => (r.currency?.iso3 || r.currency?.code) === "GBP");

        if (usdRate) forexSummary.usd = String(usdRate.buy);
        if (inrRate) forexSummary.inr = String(inrRate.buy);
        if (eurRate) forexSummary.eur = String(eurRate.buy);
        if (gbpRate) forexSummary.gbp = String(gbpRate.buy);
      }
    }
  } catch {
    // Fall back to standard rates when NRB is unreachable.
  }

  // 2. Fetch Admin Managed Gold/Silver & Rashifal from Database
  let goldFine = "१,६०,५००"; // छापावाल सुन (24K)
  let goldTejabi = "१,५९,८००"; // तेजाबी सुन (22K)
  let silver = "१,९५०"; // चाँदी
  let rashifalRaw: unknown = null;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    if (db?.setting) {
      const settings = await db.setting.findMany({
        where: {
          key: { in: ["gold_fine", "gold_tejabi", "silver", "rashifal_json"] },
        },
      });

      for (const s of settings) {
        if (s.key === "gold_fine") goldFine = s.value;
        if (s.key === "gold_tejabi") goldTejabi = s.value;
        if (s.key === "silver") silver = s.value;
        if (s.key === "rashifal_json") {
          try {
            rashifalRaw = JSON.parse(s.value);
          } catch {}
        }
      }
    }
  } catch {
    // Fall back to defaults when DB is unavailable (e.g. offline build).
  }

  const rashifal = normalizeRashifalList(rashifalRaw);

  return apiSuccess({
    forex: forexSummary,
    allForexRates,
    gold: {
      fine: goldFine,
      tejabi: goldTejabi,
      silver: silver,
    },
    rashifal,
  });
}
