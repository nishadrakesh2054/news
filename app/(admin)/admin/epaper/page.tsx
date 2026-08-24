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
        setMessage({ type: "success", text: "EPaper published successfully!" });
        setTitle("");
        setPdfUrl("");
        setPublishDate("");
        const resEP = await fetch("/api/admin/epaper");
        const dataEP = await resEP.json();
        if (dataEP.success) setEpapers(dataEP.data || []);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to publish EPaper." });
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-3 px-6 py-2 pb-6">
      <div className="border-b border-border/60 pb-2">
        <h1 className="text-lg font-bold tracking-tight text-foreground font-serif flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-[#027081]" />
          <span>EPaper Edition Publisher</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#027081]" />
            <span>Add New EPaper Edition</span>
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
            <label className="block text-xs font-bold text-foreground mb-1">Edition Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Daily National News - Aug 2026 Edition"
              className="w-full h-9 px-3 rounded-sm border border-border bg-card text-foreground text-xs outline-none focus:border-[#027081]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">PDF File URL *</label>
            <input
              type="url"
              required
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="https://cloudinary... /epaper.pdf"
              className="w-full h-9 px-3 rounded-sm border border-border bg-card text-foreground text-xs font-mono outline-none focus:border-[#027081]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Publication Date</label>
            <input
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              className="w-full h-9 px-3 rounded-sm border border-border bg-card text-foreground text-xs font-mono outline-none focus:border-[#027081]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-1.5 h-8 rounded-lg bg-brand hover:bg-[#0B3F8A] text-white shadow-xs text-[11px] font-bold px-3 py-1 transition-all duration-200 disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>{submitting ? "Publishing..." : "Publish EPaper"}</span>
          </button>
        </form>

        {/* Existing List */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">
            Published EPapers ({epapers.length})
          </h3>

          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Loading...</div>
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
                    View PDF →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
              No EPaper editions published yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
