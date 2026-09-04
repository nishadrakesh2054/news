"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFormattedNepaliDate } from "@/lib/nepaliDate";
import { PortalContainer } from "@/components/portal/SectionHeader";
import { PORTAL } from "@/constants/portal";

type RateRow = {
  key: string;
  nameNp: string;
  purity: string;
  rate: string;
};

export default function GoldRatePage() {
  const [goldFine, setGoldFine] = useState("१,६०,५००");
  const [goldTejabi, setGoldTejabi] = useState("१,५९,८००");
  const [silver, setSilver] = useState("१,९५०");
  const [nepaliDateStr] = useState(() => getFormattedNepaliDate());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/utilities")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.gold) {
          if (json.data.gold.fine) setGoldFine(json.data.gold.fine);
          if (json.data.gold.tejabi) setGoldTejabi(json.data.gold.tejabi);
          if (json.data.gold.silver) setSilver(json.data.gold.silver);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const rows: RateRow[] = [
    {
      key: "fine",
      nameNp: "छापावाल सुन",
      purity: "२४ क्यारेट",
      rate: goldFine,
    },
    {
      key: "tejabi",
      nameNp: "तेजाबी सुन",
      purity: "२२ क्यारेट",
      rate: goldTejabi,
    },
    {
      key: "silver",
      nameNp: "चाँदी",
      purity: "शुद्ध",
      rate: silver,
    },
  ];

  return (
    <main className="w-full bg-white pb-16 text-gray-900">
      <PortalContainer className="py-8 sm:py-10">
        <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-[12px] text-gray-400">
          <Link href="/" className="hover:underline" style={{ color: PORTAL.brand }}>
            गृह
          </Link>
          <span aria-hidden className="text-gray-300">
            /
          </span>
          <span className="font-medium" style={{ color: PORTAL.ink }}>
            सुन चाँदी दर
          </span>
        </nav>

        <header className="mb-8 max-w-2xl">
          <h1
            className="text-2xl font-extrabold tracking-tight sm:text-3xl"
            style={{ color: PORTAL.brand }}
          >
            सुन चाँदी दर
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            आजको प्रति तोला बजार भाउ · {nepaliDateStr}
          </p>
        </header>

        <div className="max-w-2xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${PORTAL.rule}` }}>
                <th
                  className="pb-3 pr-4 text-[11px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: PORTAL.accent }}
                >
                  धातु
                </th>
                <th
                  className="pb-3 pr-4 text-[11px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: PORTAL.accent }}
                >
                  गुणस्तर
                </th>
                <th
                  className="pb-3 text-right text-[11px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: PORTAL.accent }}
                >
                  दर (रु. / तोला)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className="py-4 pr-4 align-top">
                    <p className="font-bold" style={{ color: PORTAL.ink }}>
                      {row.nameNp}
                    </p>
                  </td>
                  <td className="py-4 pr-4 align-top text-gray-600">{row.purity}</td>
                  <td
                    className="py-4 text-right align-top text-lg font-extrabold tabular-nums sm:text-xl"
                    style={{ color: PORTAL.brand }}
                  >
                    {loaded || row.rate ? row.rate : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-8 max-w-2xl text-[12px] leading-relaxed text-gray-400">
          दररेट प्रति तोला (लगभग ११.६६४ ग्राम) मा प्रकाशित छ। बजार अनुसार दर फेरबदल हुन
          सक्छ।
        </p>

        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link href="/forex" className="font-medium hover:underline" style={{ color: PORTAL.brand }}>
            विदेशी विनिमय दर →
          </Link>
          <Link
            href="/bs-date-converter"
            className="font-medium hover:underline"
            style={{ color: PORTAL.brand }}
          >
            मिति रूपान्तरण →
          </Link>
        </div>
      </PortalContainer>
    </main>
  );
}
