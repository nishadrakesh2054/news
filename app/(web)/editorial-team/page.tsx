import Link from "next/link";
import { Users, ShieldCheck, FileCheck, ArrowLeft, Mail, Phone } from "lucide-react";
import { SITE_CONFIG } from "@/constants/site";

export default function EditorialTeamPage() {
  return (
    <main className="w-full bg-background min-h-screen pb-20 pt-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-[#027081] hover:underline gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>गृहपृष्ठमा फर्कनुहोस्</span>
        </Link>

        {/* Header Title */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center space-x-3 text-[#027081]">
            <Users className="h-8 w-8" />
            <h1 className="text-3xl font-extrabold text-foreground font-serif">
              सम्पादकीय टोली तथा कानुनी विवरण (Editorial & Compliance)
            </h1>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            नेपाल सरकार, सूचना तथा प्रसारण विभाग र प्रेस काउन्सिल नेपालको नियमानुसार प्रकाशित आधिकारिक सम्पादकीय तथा सञ्चालक टोली विवरण।
          </p>
        </div>

        {/* Press Council & Department Registration Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl border border-border bg-card space-y-2 flex items-start space-x-3">
            <FileCheck className="h-6 w-6 text-[#027081] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase">सूचना विभाग दर्ता नं.</h4>
              <p className="text-base font-extrabold text-foreground font-mono pt-1">
                १४३२ / ०७९-८०
              </p>
              <span className="text-[11px] text-muted-foreground">सूचना तथा प्रसारण विभाग, काठमाडौँ</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card space-y-2 flex items-start space-x-3">
            <ShieldCheck className="h-6 w-6 text-[#027081] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-muted-foreground uppercase">प्रेस काउन्सिल सूचीकरण</h4>
              <p className="text-base font-extrabold text-foreground font-mono pt-1">
                ९८४ / ०७९-८०
              </p>
              <span className="text-[11px] text-muted-foreground">प्रेस काउन्सिल नेपाल, काठमाडौँ</span>
            </div>
          </div>
        </div>

        {/* Editorial Hierarchy Grid */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-foreground border-b border-border pb-3">
            सञ्चालक तथा सम्पादकीय मण्डल
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-1">
              <span className="text-[11px] font-bold text-[#027081] uppercase">अध्यक्ष / प्रबन्ध निर्देशक</span>
              <h3 className="text-base font-extrabold text-foreground font-serif">राकेश कुमार श्रेष्ठ</h3>
              <p className="text-xs text-muted-foreground">संस्थापक तथा प्रमुख सञ्चालक</p>
            </div>

            <div className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-1">
              <span className="text-[11px] font-bold text-[#027081] uppercase">प्रधान सम्पादक (Editor-in-Chief)</span>
              <h3 className="text-base font-extrabold text-foreground font-serif">विशाल नेपाल</h3>
              <p className="text-xs text-muted-foreground">प्रधान सम्पादक</p>
            </div>

            <div className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-1">
              <span className="text-[11px] font-bold text-[#027081] uppercase">समाचार सम्पादक</span>
              <h3 className="text-base font-extrabold text-foreground font-serif">सुजन क्षेत्री</h3>
              <p className="text-xs text-muted-foreground">प्रमुख समाचार टोली</p>
            </div>

            <div className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-1">
              <span className="text-[11px] font-bold text-[#027081] uppercase">मल्टिमिडिया तथा प्राविधिक प्रमुख</span>
              <h3 className="text-base font-extrabold text-foreground font-serif">अनिल अधिकारी</h3>
              <p className="text-xs text-muted-foreground">डिजिटल तथा प्राविधिक सञ्चालन</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
            <h4 className="font-bold text-foreground">सम्पर्क ठेगाना:</h4>
            <p>काठमाडौँ महानगरपालिका, बागमती प्रदेश, नेपाल</p>
            <div className="flex flex-wrap gap-4 pt-1 font-mono">
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-[#027081]" /> +९७७-०१-४XXXXXX
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-[#027081]" /> {SITE_CONFIG.email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
