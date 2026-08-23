"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Save, Image as ImageIcon, Globe, Tag, ChevronDown, Layers, FolderTree, Zap, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleStatus, ArticleType, LanguageEdition } from "@prisma/client";
import Link from "next/link";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { DualImagePicker } from "@/components/admin/DualImagePicker";
import { NepaliTypingHelper } from "@/components/admin/NepaliTypingHelper";

interface CategoryItem {
  id: string;
  name: string;
  nameNp?: string | null;
  slug: string;
}

interface ArticleFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: Record<string, any>;
  isEditing?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ArticleData = Record<string, any>;

export function ArticleForm({ initialData }: ArticleFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState<string>((initialData?.title as string) || "");
  const [titleNp, setTitleNp] = useState<string>((initialData?.titleNp as string) || "");
  const [slug, setSlug] = useState<string>((initialData?.slug as string) || "");
  const [content, setContent] = useState<string>((initialData?.content as string) || "");
  const [excerpt, setExcerpt] = useState<string>((initialData?.excerpt as string) || "");
  const [coverImage, setCoverImage] = useState<string>((initialData?.coverImage as string) || "");
  const [caption, setCaption] = useState<string>((initialData?.caption as string) || "");
  const [status, setStatus] = useState<ArticleStatus>(initialData?.status || ArticleStatus.DRAFT);
  const [type, setType] = useState<ArticleType>(initialData?.type || ArticleType.STANDARD);
  const [languageEdition, setLanguageEdition] = useState<LanguageEdition>(initialData?.languageEdition || LanguageEdition.NEPALI_ONLY);
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured || false);
  const [isBreaking, setIsBreaking] = useState<boolean>(initialData?.isBreaking || false);
  const [scheduledAt, setScheduledAt] = useState<string>(
    initialData?.scheduledAt ? new Date(initialData.scheduledAt as string).toISOString().slice(0, 16) : ""
  );
  const [categoryId, setCategoryId] = useState<string>((initialData?.categoryId as string) || "");
  const [metaTitle, setMetaTitle] = useState<string>((initialData?.metaTitle as string) || "");
  const [metaDescription, setMetaDescription] = useState<string>((initialData?.metaDescription as string) || "");
  const [keywords, setKeywords] = useState<string>((initialData?.keywords as string) || "");
  const [ogImage, setOgImage] = useState<string>((initialData?.ogImage as string) || "");
  const [showSeo, setShowSeo] = useState(true);
  const [coverGallery, setCoverGallery] = useState<Array<{ id: string; url: string; name: string }>>([]);
  const [province, setProvince] = useState<number | undefined>(initialData?.province ? Number(initialData.province) : undefined);
  const [district, setDistrict] = useState<string>((initialData?.district as string) || "");

  // Fetch categories using TanStack Query
  const { data: categories = [] } = useQuery<CategoryItem[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (!res.ok) throw new Error("Failed to fetch categories");
      return json.data;
    },
  });

  const autoSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialData && !slug) {
      setSlug(autoSlug(val));
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: ArticleData) => {
      const isEdit = Boolean(initialData?.id);
      const url = isEdit ? `/api/admin/articles/${initialData?.id}` : "/api/admin/articles";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save article");
      return json.data;
    },
    onSuccess: () => {
      toast.success(initialData?.id ? "Article updated" : "Article created");
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      router.push("/admin/articles");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !slug || !content || !categoryId) {
      toast.error("Please fill in English Title, Slug, Content, and Category");
      return;
    }

    saveMutation.mutate({
      title,
      titleNp: titleNp || undefined,
      slug: autoSlug(slug),
      content,
      excerpt: excerpt || undefined,
      coverImage: coverImage || undefined,
      caption: caption || undefined,
      status,
      type,
      languageEdition,
      province: province ? Number(province) : undefined,
      district: district || undefined,
      scheduledAt: scheduledAt || undefined,
      isFeatured,
      isBreaking,
      categoryId,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
      keywords: keywords || undefined,
      ogImage: ogImage || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full px-6 py-3 space-y-6">
      {/* Sleek Top Action Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <Link href="/admin/articles">
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" title="Back">
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-foreground">
              {initialData?.id ? "Edit Article" : "New Story"}
            </h1>
            <span className="text-xs text-muted-foreground font-mono">
              • {status}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ArticleStatus)}
              className="appearance-none rounded-lg border bg-background pl-3 pr-8 py-1 text-xs font-semibold outline-none focus:border-[#027081] focus:ring-2 focus:ring-[#027081]/20 transition-all cursor-pointer shadow-2xs"
            >
              <option value="DRAFT">🟡 DRAFT</option>
              <option value="PUBLISHED">🟢 PUBLISHED</option>
              <option value="ARCHIVED">⚪ ARCHIVED</option>
            </select>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <Button
            type="submit"
            size="sm"
            className="bg-[#027081] hover:bg-[#025c6a] text-white font-semibold px-4 h-8 text-xs rounded-lg flex items-center space-x-1.5 shadow-2xs"
            disabled={saveMutation.isPending}
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saveMutation.isPending ? "Saving..." : initialData?.id ? "Update" : "Save Story"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Left Unified Editor Workspace */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-card rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-5">
            {/* Nepali Typing Helper Widget */}
            <NepaliTypingHelper />

            {/* Main Nepali Headline Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#027081]">
                नेपाली मुख्य शीर्षक (Nepali Headline)
              </label>
              <input
                type="text"
                placeholder="नेपाली मुख्य शीर्षक यहाँ लेख्नुहोस्..."
                value={titleNp}
                onChange={(e) => setTitleNp(e.target.value)}
                className="w-full rounded-xl border bg-background px-4 py-3 text-xl font-bold text-foreground outline-none focus:border-[#027081] transition-colors duration-150"
              />
            </div>

            {/* Grid for English Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                  English Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="English story title..."
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-[#027081] transition-colors duration-150"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  placeholder="url-slug"
                  value={slug}
                  onChange={(e) => setSlug(autoSlug(e.target.value))}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-[#027081] transition-colors duration-150"
                />
              </div>
            </div>

            {/* Excerpt / Summary */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                Excerpt / Short Summary (संक्षेप)
              </label>
              <textarea
                rows={4}
                placeholder="Brief summary snippet for homepage cards..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-[#027081] transition-colors duration-150 leading-relaxed"
              />
            </div>

            {/* TipTap Rich Text Article Body Content */}
            <div className="space-y-1 pt-2">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                Full Article Content *
              </label>
              <TipTapEditor value={content} onChange={setContent} />
            </div>
          </div>

          {/* High Impact Professional SEO Metadata Suite Box */}
          <div className="bg-card rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
            <button
              type="button"
              onClick={() => setShowSeo(!showSeo)}
              className="w-full flex items-center justify-between text-left text-xs font-bold text-foreground"
            >
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#027081]" />
                <span>Search Engine Optimization & Google Discovery Suite (High Impact SEO)</span>
              </span>
              <span className="text-[#027081] text-xs underline font-semibold">
                {showSeo ? "Collapse SEO" : "Expand SEO"}
              </span>
            </button>

            {showSeo && (
              <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                      <span>Meta Search Title</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Custom headline for Google Search..."
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-[#027081] transition-colors duration-150"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                      <Tag className="h-3 w-3 text-[#027081]" />
                      <span>Focus Keywords / Tags</span>
                    </label>
                    <input
                      type="text"
                      placeholder="नेपाल, राजनीति, संसद, सरकार..."
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      className="w-full rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:border-[#027081] transition-colors duration-150"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Meta Search Description (Snippet)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Custom meta snippet description for Google Search results..."
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3.5 py-2 text-xs text-foreground outline-none focus:border-[#027081] transition-colors duration-150"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                    Social OpenGraph Preview Image (Facebook / Viber / Twitter Override)
                  </label>
                  <input
                    type="url"
                    placeholder="https://... (Leave empty to use main Cover Image)"
                    value={ogImage}
                    onChange={(e) => setOgImage(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-1.5 text-xs outline-none focus:border-[#027081] transition-colors duration-150"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Control Cards */}
        <div className="space-y-5">
          {/* Category & Format Selector */}
          <div className="bg-card rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-xs text-foreground border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-[#027081]" />
              <span>Category & Format</span>
            </h3>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <FolderTree className="h-3 w-3 text-[#027081]" />
                <span>Category Section *</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full appearance-none rounded-xl border bg-background pl-3.5 pr-9 py-2 text-xs font-semibold text-foreground outline-none focus:border-[#027081] focus:ring-2 focus:ring-[#027081]/20 transition-all cursor-pointer shadow-2xs"
                >
                  <option value="">Select Category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameNp ? `${cat.nameNp} (${cat.name})` : cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="h-4 w-4 text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Article Format Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <Zap className="h-3 w-3 text-[#027081]" />
                <span>Article Format *</span>
              </label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as ArticleType)}
                  className="w-full appearance-none rounded-xl border bg-background pl-3.5 pr-9 py-2 text-xs font-semibold text-foreground outline-none focus:border-[#027081] focus:ring-2 focus:ring-[#027081]/20 transition-all cursor-pointer shadow-2xs"
                >
                  <option value="STANDARD">📰 STANDARD (सामान्य समाचार)</option>
                  <option value="BREAKING">⚡ BREAKING (ताजा समाचार)</option>
                  <option value="LIVE">🔴 LIVE (लाइभ कभरेज)</option>
                  <option value="OPINION">💬 OPINION (विचार / दृष्टिकोण)</option>
                  <option value="FEATURE">✨ FEATURE (विशेष फिचर)</option>
                </select>
                <ChevronDown className="h-4 w-4 text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Target Language Edition Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <Globe className="h-3 w-3 text-[#027081]" />
                <span>Target Language Edition *</span>
              </label>
              <div className="relative">
                <select
                  value={languageEdition}
                  onChange={(e) => setLanguageEdition(e.target.value as LanguageEdition)}
                  className="w-full appearance-none rounded-xl border bg-background pl-3.5 pr-9 py-2 text-xs font-semibold text-foreground outline-none focus:border-[#027081] focus:ring-2 focus:ring-[#027081]/20 transition-all cursor-pointer shadow-2xs"
                >
                  <option value="BOTH">🌐 BOTH EDITIONS (नेपाली + english.nepalkhabar.com)</option>
                  <option value="NEPALI_ONLY">🇳🇵 NEPALI SITE ONLY (nepalkhabar.com)</option>
                  <option value="ENGLISH_ONLY">🇬🇧 ENGLISH SITE ONLY (english.nepalkhabar.com)</option>
                </select>
                <ChevronDown className="h-4 w-4 text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* 7-Province Tagging Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <Tag className="h-3 w-3 text-[#027081]" />
                <span>Province Regional Tagging (प्रदेश समाचार)</span>
              </label>
              <div className="relative">
                <select
                  value={province || ""}
                  onChange={(e) => setProvince(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full appearance-none rounded-xl border bg-background pl-3.5 pr-9 py-2 text-xs font-semibold text-foreground outline-none focus:border-[#027081] focus:ring-2 focus:ring-[#027081]/20 transition-all cursor-pointer shadow-2xs"
                >
                  <option value="">No Province (राष्ट्रिय / राष्ट्रव्यापी)</option>
                  <option value="1">प्रदेश १ (कोशी प्रदेश)</option>
                  <option value="2">प्रदेश २ (मधेश प्रदेश)</option>
                  <option value="3">प्रदेश ३ (बागमती प्रदेश)</option>
                  <option value="4">प्रदेश ४ (गण्डकी प्रदेश)</option>
                  <option value="5">प्रदेश ५ (लुम्बिनी प्रदेश)</option>
                  <option value="6">प्रदेश ६ (कर्णाली प्रदेश)</option>
                  <option value="7">प्रदेश ७ (सुदूरपश्चिम प्रदेश)</option>
                </select>
                <ChevronDown className="h-4 w-4 text-muted-foreground pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* District Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">
                District Name (जिल्ला)
              </label>
              <input
                type="text"
                placeholder="उदा. काठमाडौँ, कास्की, झापा..."
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full rounded-xl border bg-background px-3.5 py-2 text-xs font-semibold text-foreground outline-none focus:border-[#027081] transition-all"
              />
            </div>

            {/* Scheduled Auto-Publishing Date/Time Picker */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <span>Scheduled Publishing (स्वचालित प्रकाशन मिति)</span>
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded-xl border bg-background px-3.5 py-2 text-xs font-mono text-foreground outline-none focus:border-[#027081] transition-all"
              />
            </div>
          </div>

          {/* Homepage Placements Toggles */}
          <div className="bg-card rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs text-foreground border-b border-slate-100 dark:border-slate-800 pb-2">
              Homepage Placements
            </h3>

            <label className="flex items-center space-x-2.5 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#027081] focus:ring-[#027081]"
              />
              <span className="text-xs font-semibold text-foreground">Pin as Lead Story (मुख्य समाचार)</span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-xs font-semibold text-rose-600">Add to Breaking Ticker (ताजा खबर)</span>
            </label>
          </div>

          {/* Cover Media Upload */}
          <div className="bg-card rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs text-foreground border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-[#027081]" />
                <span>Featured Cover Image</span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                Max 500 KB (PNG, JPG, WEBP)
              </span>
            </h3>

            <DualImagePicker
              value={coverImage}
              onChange={setCoverImage}
              folder="articles"
              label="Cover Image"
            />

            {/* Active Cover Image Preview Card with Removal Button */}
            {coverImage && (
              <div className="relative rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden bg-muted/20 group shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage} alt={caption || "Cover preview"} className="w-full h-36 object-cover" />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => setCoverImage("")}
                    className="h-7 px-2.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1 shadow-md"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove Cover</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Small Icon-Based Fetched Thumbnail List */}
            {coverGallery.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    Uploaded Media List ({coverGallery.length}) — Click icon to select cover
                  </span>
                  <button
                    type="button"
                    onClick={() => setCoverGallery([])}
                    className="text-[10px] text-rose-500 hover:underline"
                  >
                    Clear List
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
                  {coverGallery.map((item) => {
                    const isActive = coverImage === item.url;
                    return (
                      <div
                        key={item.id}
                        className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                          isActive
                            ? "border-[#027081] ring-2 ring-[#027081]/30 scale-105"
                            : "border-slate-300 dark:border-slate-700 opacity-70 hover:opacity-100 hover:scale-105"
                        }`}
                        onClick={() => setCoverImage(item.url)}
                        title={`Click to set as active cover: ${item.name}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={item.name} className="h-11 w-11 object-cover" />
                        
                        {isActive && (
                          <div className="absolute top-0 left-0 right-0 bg-[#027081] text-white text-[7px] font-extrabold text-center py-0.5 uppercase tracking-tighter">
                            Active
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoverGallery((prev) => prev.filter((g) => g.id !== item.id));
                            if (coverImage === item.url) setCoverImage("");
                          }}
                          className="absolute top-0.5 right-0.5 bg-black/75 hover:bg-rose-600 text-white rounded-full p-0.5 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove image from gallery"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Photo Caption & Alt Text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">Photo Caption / Credit</label>
                <input
                  type="text"
                  placeholder="तस्बिर: सम्पादकीय मण्डल..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-1.5 text-xs outline-none focus:border-[#027081] transition-colors duration-150"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">SEO Alt Text (वर्णन)</label>
                <input
                  type="text"
                  placeholder="Image alt description for SEO..."
                  value={metaTitle || ""}
                  onChange={(e) => {
                    if (!metaTitle) setMetaTitle(e.target.value);
                  }}
                  className="w-full rounded-lg border bg-background px-3 py-1.5 text-xs outline-none focus:border-[#027081] transition-colors duration-150"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
