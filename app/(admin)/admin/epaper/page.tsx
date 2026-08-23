"use client";

import { useState, useEffect } from "react";
import { Newspaper, Upload, Plus, Calendar, CheckCircle2 } from "lucide-react";

interface EPaperItem {
  id: string;
  title: string;
  pdfUrl: string;
  publishDate: string;
  createdAt: string;
}

export default function AdminEPaperPage() {
  const [epapers, setEpapers] = useState<EPaperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/epaper");
        const data = await res.json();
        if (!ignore && data.success) {
          setEpapers(data.data || []);
        }
      } catch (err) {
        console.error("Failed to load EPapers", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !pdfUrl) return;

    try {
      setSubmitting(true);
      setMessage(null);

      const res = await fetch("/api/admin/epaper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, pdfUrl, publishDate }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "इ-पत्रिका सफलतापूर्वक प्रकाशन गरियो!" });
        setTitle("");
        setPdfUrl("");
        setPublishDate("");
        const resEP = await fetch("/api/admin/epaper");
        const dataEP = await resEP.json();
        if (dataEP.success) setEpapers(dataEP.data || []);
      } else {
        setMessage({ type: "error", text: data.message || "प्रकाशन गर्न सकिएन।" });
      }
    } catch {
      setMessage({ type: "error", text: "समस्या आयो।" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2.5">
          <Newspaper className="h-6 w-6 text-[#027081]" />
          <span>इ-पत्रिका व्यवस्थापन (EPaper Edition Publisher)</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          दैनिक छापा संस्करणको PDF फाइल अपलोड तथा प्रकाशन गर्नुहोस्।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#027081]" />
            <span>नयाँ छापा संस्करण थप्नुहोस्</span>
          </h3>

          {message && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
              }`}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{message.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">संस्करण शीर्षक *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="उदा. नेपाल खबर - वि.सं. २०८२ भदौ ६"
              className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-[#027081]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">PDF फाइल URL *</label>
            <input
              type="url"
              required
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="https://cloudinary... /epaper.pdf"
              className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-foreground text-xs font-mono focus:ring-2 focus:ring-[#027081]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">प्रकाशन मिति</label>
            <input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-foreground text-xs font-mono focus:ring-2 focus:ring-[#027081]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center space-x-2 py-2.5 bg-[#027081] hover:bg-[#025a68] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            <span>{submitting ? "प्रकाशन हुँदैछ..." : "इ-पत्रिका प्रकाशन गर्नुहोस्"}</span>
          </button>
        </form>

        {/* Existing List */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">
            प्रकाशित इ-पत्रिकाहरू ({epapers.length})
          </h3>

          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">लोड हुँदैछ...</div>
          ) : epapers.length > 0 ? (
            <div className="space-y-3">
              {epapers.map((ep) => (
                <div key={ep.id} className="p-4 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-foreground">{ep.title}</h4>
                    <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(ep.publishDate).toLocaleDateString()}
                    </span>
                  </div>

                  <a
                    href={ep.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#027081] hover:underline"
                  >
                    PDF हेर्नुहोस् →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
              कुनै इ-पत्रिका प्रकाशित भएको छैन।
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
