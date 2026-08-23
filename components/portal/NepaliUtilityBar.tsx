"use client";

import { useState, useEffect } from "react";
import { Coins, DollarSign, Sparkles, X, ChevronDown } from "lucide-react";

interface RashiItem {
  name: string;
  symbol: string;
  prediction: string;
}

const DEFAULT_RASHIFAL: RashiItem[] = [
  { name: "मेष (Aries)", symbol: "♈", prediction: "आजको दिन कार्यक्षेत्रमा सफलता र नयाँ अवसर मिल्नेछ। आर्थिक लाभको योग छ।" },
  { name: "वृष (Taurus)", symbol: "♉", prediction: "सामाजिक प्रतिष्ठा वृद्धि हुनेछ। परिवारसँग रमाइलो समय बित्नेछ।" },
  { name: "मिथुन (Gemini)", symbol: "♊", prediction: "यात्राको अवसर प्राप्त हुनसक्छ। स्वास्थ्यमा ध्यान दिनुहोला।" },
  { name: "कर्कट (Cancer)", symbol: "♋", prediction: "अधुरा कामहरू पूरा हुनेछन्। नयाँ लगानीको लागि उपयुक्त समय छ।" },
  { name: "सिंह (Leo)", symbol: "<ctrl42>", prediction: "आत्मविश्वासमा वृद्धि हुनेछ। साथीभाइको पूर्ण सहयोग मिल्नेछ।" },
  { name: "कन्या (Virgo)", symbol: "♍", prediction: "सोचेभन्दा बढी आम्दानी हुनसक्छ। बौद्धिक कार्यमा सफलता मिल्नेछ।" },
  { name: "तुला (Libra)", symbol: "♎", prediction: "व्यापार व्यवसायमा प्रगति हुनेछ। नयाँ मित्रहरूसँग भेटघाट हुनेछ।" },
  { name: "वृश्चिक (Scorpio)", symbol: "♏", prediction: "पारिवारिक सुख प्राप्त हुनेछ। मेहनतको उचित फल मिल्ने समय छ।" },
  { name: "धनु (Sagittarius)", symbol: "♐", prediction: "धार्मिक तथा आध्यात्मिक कार्यमा रुचि बढ्नेछ। काममा उत्साह रहनेछ।" },
  { name: "मकर (Capricorn)", symbol: "♑", prediction: "सकारात्मक विचारले अघि बढ्नुहोला। अचानक धन लाभको सम्भावना छ।" },
  { name: "कुम्भ (Aquarius)", symbol: "♒", prediction: "रोकिएका कामहरू बन्नेछन्। प्रेम सम्बन्ध सुमधुर रहनेछ।" },
  { name: "मीन (Pisces)", symbol: "♓", prediction: "पढाइ र रचनात्मक काममा राम्रो नतिजा मिल्नेछ। स्वास्थ्य राम्रो रहनेछ।" },
];

export function NepaliUtilityBar() {
  const [showRashifalModal, setShowRashifalModal] = useState(false);
  const [selectedRashi, setSelectedRashi] = useState<RashiItem | null>(null);

  const [goldPrice, setGoldPrice] = useState("१,६०,५००");
  const [silverPrice, setSilverPrice] = useState("१,९५०");
  const [usdRate, setUsdRate] = useState("१३४.८०");
  const [inrRate, setInrRate] = useState("१६०.००");
  const [rashifalData, setRashifalData] = useState<RashiItem[]>(DEFAULT_RASHIFAL);

  useEffect(() => {
    fetch("/api/utilities")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          const { forex, gold, rashifal } = json.data;
          if (gold?.fine) setGoldPrice(gold.fine);
          if (gold?.silver) setSilverPrice(gold.silver);
          if (forex?.usd) setUsdRate(forex.usd);
          if (forex?.inr) setInrRate(forex.inr);
          if (rashifal && Array.isArray(rashifal)) {
            setRashifalData(rashifal);
          }
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="w-full bg-[#01515e] text-white/90 text-xs py-1.5 px-4 border-b border-[#027081]/30 select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Forex & Gold Rates Ticker */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-medium">
            {/* Gold & Silver */}
            <div className="flex items-center space-x-1.5">
              <Coins className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              <span className="text-amber-200 font-bold">सुन:</span>
              <span>रु. {goldPrice}</span>
              <span className="text-white/40">|</span>
              <span className="text-amber-200 font-bold">चाँदी:</span>
              <span>रु. {silverPrice}</span>
            </div>

            {/* Live NRB Forex Exchange Rates */}
            <div className="hidden md:flex items-center space-x-2">
              <DollarSign className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
              <span className="text-emerald-200 font-bold">राष्ट्र बैंक मुद्रा दर:</span>
              <span>USD $१ = रु. {usdRate}</span>
              <span className="text-white/40">•</span>
              <span>INR ₹१०० = रु. {inrRate}</span>
            </div>
          </div>

          {/* Daily Horoscope (राशिफल) Trigger */}
          <div className="flex items-center space-x-3 ml-auto">
            <button
              onClick={() => setShowRashifalModal(true)}
              className="inline-flex items-center space-x-1.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer"
            >
              <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" />
              <span>आजको राशिफल (Horoscope)</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Rashifal Modal Overlay */}
      {showRashifalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-background text-foreground border border-border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center space-x-2 text-[#027081]">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-lg font-extrabold font-serif">आजको राशिफल (Daily Horoscope)</h3>
              </div>
              <button
                onClick={() => {
                  setShowRashifalModal(false);
                  setSelectedRashi(null);
                }}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              तपाईंको राशिको आजको राशिफल हेर्न तल दिइएका राशिहरूमा थिच्नुहोस्:
            </p>

            {/* Grid of 12 Rashis */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {rashifalData.map((rashi) => {
                const isSelected = selectedRashi?.name === rashi.name;
                return (
                  <button
                    key={rashi.name}
                    onClick={() => setSelectedRashi(rashi)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#027081] text-white border-[#027081] shadow-md scale-105"
                        : "bg-card border-border/70 hover:border-[#027081]/60 hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <span className="text-2xl mb-1">{rashi.symbol}</span>
                    <span className="text-xs font-bold leading-tight">{rashi.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Rashi Detail View */}
            {selectedRashi ? (
              <div className="p-4 rounded-xl bg-[#027081]/10 border border-[#027081]/30 space-y-1">
                <h4 className="text-sm font-extrabold text-[#027081] flex items-center gap-1.5 font-serif">
                  <span>{selectedRashi.symbol}</span>
                  <span>{selectedRashi.name} - आजको फल</span>
                </h4>
                <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                  {selectedRashi.prediction}
                </p>
              </div>
            ) : (
              <div className="p-3 text-center text-xs text-muted-foreground border border-dashed rounded-xl">
                राशि रोज्नुहोस्...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
