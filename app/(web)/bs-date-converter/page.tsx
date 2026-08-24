"use client";

import { useState } from "react";
import { Calendar, ArrowRightLeft, CheckCircle2 } from "lucide-react";
import { getBikramSambatDate } from "@/lib/bs-calendar";

export default function BSDateConverterPage() {
  const [adDate, setAdDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [convertedBs, setConvertedBs] = useState(() =>
    getBikramSambatDate(new Date()),
  );

  const handleConvertAdToBs = (inputDate: string) => {
    setAdDate(inputDate);
    if (inputDate) {
      const d = new Date(inputDate);
      if (!isNaN(d.getTime())) {
        setConvertedBs(getBikramSambatDate(d));
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 select-none">
      {/* Header Title */}
      <div className="border-b border-border pb-4 space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground font-serif flex items-center gap-2.5">
          <Calendar className="h-6 w-6 text-[#027081]" />
          <span>Bikram Sambat (B.S.) Date Converter | मिति रूपान्तरण</span>
        </h1>
        <p className="text-xs text-muted-foreground">
          Convert Gregorian Calendar (A.D.) dates to Bikram Sambat (B.S. पात्रो)
          and view Tithi / Panchanga details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Card */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-foreground font-serif flex items-center gap-2 border-b border-border/60 pb-2">
            <ArrowRightLeft className="h-4 w-4 text-[#027081]" />
            <span>Select English Date (A.D.)</span>
          </h2>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">
              Gregorian Date (A.D.)
            </label>
            <input
              type="date"
              value={adDate}
              onChange={(e) => handleConvertAdToBs(e.target.value)}
              className="w-full h-10 px-3 rounded-sm border border-border bg-background text-sm text-foreground font-mono outline-none focus:border-[#027081] shadow-2xs"
            />
          </div>

          <div className="pt-2 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">
              Selected Gregorian Date:
            </p>
            <p className="font-mono bg-muted/40 p-2 rounded border border-border/50">
              {adDate ? new Date(adDate).toDateString() : "No date selected"}
            </p>
          </div>
        </div>

        {/* Output Card */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-foreground font-serif flex items-center gap-2 border-b border-border/60 pb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Converted Bikram Sambat (B.S.) Date</span>
          </h2>

          <div className="space-y-3 bg-[#027081]/5 border border-[#027081]/20 p-4 rounded-lg">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#027081] tracking-wider block">
                B.S. Date (नेपाली मिति)
              </span>
              <span className="text-2xl font-extrabold text-[#027081] font-serif">
                {convertedBs.formattedBs}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#027081]/15">
              <div>
                <span className="text-muted-foreground font-semibold block">
                  नेपाली वर्ष:
                </span>
                <span className="font-bold text-foreground">
                  {convertedBs.yearNp} B.S.
                </span>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold block">
                  महिना र गते:
                </span>
                <span className="font-bold text-foreground">
                  {convertedBs.monthNp} {convertedBs.dayNp}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold block">
                  बार:
                </span>
                <span className="font-bold text-foreground">
                  {convertedBs.dayOfWeekNp}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold block">
                  तिथि (Tithi):
                </span>
                <span className="font-bold text-emerald-700">
                  {convertedBs.tithiNp}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
