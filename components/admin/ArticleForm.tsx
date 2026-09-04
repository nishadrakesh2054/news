"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Save, X, Trash2 } from "lucide-react";
import { ArticleStatus, ArticleType, LanguageEdition } from "@prisma/client";
import Link from "next/link";
import { TipTapEditor } from "@/components/admin/TipTapEditor";
import { DualImagePicker } from "@/components/admin/DualImagePicker";
import { NepaliTypingHelper } from "@/components/admin/NepaliTypingHelper";
import { AdminFormBodySection, AdminFormRow, AdminFormSection } from "@/components/admin/content";
import { NEPAL_PROVINCES } from "@/constants/provinces";
import {
  ADMIN_BRAND,
  adminBtnDanger,
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminPageContainer,
  adminPanel,
  adminSelect,
} from "@/constants/admin-layout";

interface TagItem {
  id: string;
  name: string;
  slug: string;
}

interface CategoryItem {
  id: string;
  name: string;
  nameNp?: string | null;
  slug: string;
}

interface ArticleFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: Record<string, any>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ArticleData = Record<string, any>;

const FORM_ID = "article-form";

const STATUS_OPTIONS: { value: ArticleStatus; label: string }[] = [
  { value: ArticleStatus.DRAFT, label: "Draft" },
  { value: ArticleStatus.PENDING, label: "Submit for review" },
  { value: ArticleStatus.PUBLISHED, label: "Published" },
  { value: ArticleStatus.ARCHIVED, label: "Archived" },
];

const FORMAT_OPTIONS: { value: ArticleType; label: string }[] = [
  { value: ArticleType.STANDARD, label: "Standard" },
  { value: ArticleType.BREAKING, label: "Breaking" },
  { value: ArticleType.LIVE, label: "Live" },
  { value: ArticleType.OPINION, label: "Opinion" },
  { value: ArticleType.FEATURE, label: "Feature" },
];

const LANGUAGE_OPTIONS: { value: LanguageEdition; label: string }[] = [
  {
    value: LanguageEdition.NEPALI_ONLY,
    label: "Nepali only → echomanchs.com",
  },
  {
    value: LanguageEdition.ENGLISH_ONLY,
    label: "English only → en.echomanchs.com",
  },
  {
    value: LanguageEdition.BOTH,
    label: "Both editions (Nepali + English)",
  },
];

const STATUS_BADGE: Record<ArticleStatus, string> = {
  [ArticleStatus.DRAFT]: "bg-muted text-muted-foreground",
  [ArticleStatus.PENDING]: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  [ArticleStatus.PUBLISHED]: "bg-[#0C4EA0]/10 text-[#0C4EA0]",
  [ArticleStatus.ARCHIVED]: "bg-muted/80 text-muted-foreground",
};

export function ArticleForm({ initialData }: ArticleFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = Boolean(initialData?.id);

  const [title, setTitle] = useState<string>((initialData?.title as string) || "");
  const [titleNp, setTitleNp] = useState<string>((initialData?.titleNp as string) || "");
  const [slug, setSlug] = useState<string>((initialData?.slug as string) || "");
  const [content, setContent] = useState<string>((initialData?.content as string) || "");
  const [contentNp, setContentNp] = useState<string>((initialData?.contentNp as string) || "");
  const [excerpt, setExcerpt] = useState<string>((initialData?.excerpt as string) || "");
  const [excerptNp, setExcerptNp] = useState<string>((initialData?.excerptNp as string) || "");
  const [coverImage, setCoverImage] = useState<string>((initialData?.coverImage as string) || "");
  const [caption, setCaption] = useState<string>((initialData?.caption as string) || "");
  const [status, setStatus] = useState<ArticleStatus>(initialData?.status || ArticleStatus.DRAFT);
  const [type, setType] = useState<ArticleType>(initialData?.type || ArticleType.STANDARD);
  const [languageEdition, setLanguageEdition] = useState<LanguageEdition>(
    initialData?.languageEdition || LanguageEdition.NEPALI_ONLY
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured || false);
  const [isBreaking, setIsBreaking] = useState<boolean>(initialData?.isBreaking || false);
  const [scheduledAt, setScheduledAt] = useState<string>(
    initialData?.scheduledAt
      ? new Date(initialData.scheduledAt as string).toISOString().slice(0, 16)
      : ""
  );
  const [categoryId, setCategoryId] = useState<string>((initialData?.categoryId as string) || "");
  const [metaTitle, setMetaTitle] = useState<string>((initialData?.metaTitle as string) || "");
  const [metaTitleNp, setMetaTitleNp] = useState<string>(
    (initialData?.metaTitleNp as string) || ""
  );
  const [metaDescription, setMetaDescription] = useState<string>(
    (initialData?.metaDescription as string) || ""
  );
  const [metaDescriptionNp, setMetaDescriptionNp] = useState<string>(
    (initialData?.metaDescriptionNp as string) || ""
  );
  const [keywords, setKeywords] = useState<string>((initialData?.keywords as string) || "");
  const [keywordsNp, setKeywordsNp] = useState<string>((initialData?.keywordsNp as string) || "");
  const [ogImage, setOgImage] = useState<string>((initialData?.ogImage as string) || "");
  const [coverGallery, setCoverGallery] = useState<Array<{ id: string; url: string; name: string }>>(
    []
  );
  const [province, setProvince] = useState<number | undefined>(
    initialData?.province ? Number(initialData.province) : undefined
  );
  const [district, setDistrict] = useState<string>((initialData?.district as string) || "");
  const [tagIds, setTagIds] = useState<string[]>(
    Array.isArray(initialData?.tags)
      ? (initialData.tags as Array<{ id: string }>).map((tag) => tag.id)
      : []
  );
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const formSnapshot = useMemo(
    () =>
      JSON.stringify({
        title,
        titleNp,
        slug,
        content,
        contentNp,
        excerpt,
        excerptNp,
        coverImage,
        caption,
        status,
        type,
        languageEdition,
        isFeatured,
        isBreaking,
        scheduledAt,
        categoryId,
        metaTitle,
        metaTitleNp,
        metaDescription,
        metaDescriptionNp,
        keywords,
        keywordsNp,
        ogImage,
        province,
        district,
        tagIds,
      }),
    [
      title,
      titleNp,
      slug,
      content,
      contentNp,
      excerpt,
      excerptNp,
      coverImage,
      caption,
      status,
      type,
      languageEdition,
      isFeatured,
      isBreaking,
      scheduledAt,
      categoryId,
      metaTitle,
      metaTitleNp,
      metaDescription,
      metaDescriptionNp,
      keywords,
      keywordsNp,
      ogImage,
      province,
      district,
      tagIds,
    ]
  );

  const [savedSnapshot, setSavedSnapshot] = useState(formSnapshot);
  const formSnapshotRef = useRef(formSnapshot);
  useEffect(() => {
    formSnapshotRef.current = formSnapshot;
  }, [formSnapshot]);
  const isDirty = formSnapshot !== savedSnapshot;

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const { data: categories = [] } = useQuery<CategoryItem[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories?light=1");
      const json = await res.json();
      if (!res.ok) throw new Error("Failed to fetch categories");
      return json.data;
    },
  });

  const { data: tags = [] } = useQuery<TagItem[]>({
    queryKey: ["admin-tags"],
    queryFn: async () => {
      const res = await fetch("/api/admin/tags?light=1");
      const json = await res.json();
      if (!res.ok) throw new Error("Failed to fetch tags");
      return json.data;
    },
  });

  const autoSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialData && !slug) {
      setSlug(autoSlug(val));
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: ArticleData) => {
      setSaveState("saving");
      const url = isEditing ? `/api/admin/articles/${initialData?.id}` : "/api/admin/articles";
      const method = isEditing ? "PATCH" : "POST";

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
      setSaveState("saved");
      setSavedSnapshot(formSnapshotRef.current);
      toast.success(isEditing ? "Article saved" : "Article created");
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ["admin-article", initialData?.id] });
      } else {
        router.push("/admin/articles");
      }
    },
    onError: (err: Error) => {
      setSaveState("error");
      toast.error(err.message || "Failed to save");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hasEnglishBody = content.replace(/<[^>]*>/g, "").trim().length > 0;
    const hasNepaliBody = contentNp.replace(/<[^>]*>/g, "").trim().length > 0;

    if (!slug || !categoryId) {
      toast.error("Please fill in slug and category");
      return;
    }

    if (languageEdition === LanguageEdition.NEPALI_ONLY) {
      if (!titleNp.trim() || !hasNepaliBody) {
        toast.error("Nepali headline and body are required for Nepali-only articles");
        return;
      }
    } else if (languageEdition === LanguageEdition.ENGLISH_ONLY) {
      if (!title.trim() || !hasEnglishBody) {
        toast.error("English title and body are required for English-only articles");
        return;
      }
    } else if (
      !title.trim() ||
      !hasEnglishBody ||
      !titleNp.trim() ||
      !hasNepaliBody
    ) {
      toast.error("Both English and Nepali title and body are required for bilingual articles");
      return;
    }

    if (scheduledAt && new Date(scheduledAt).getTime() > Date.now() && status === ArticleStatus.PUBLISHED) {
      toast.info("Future schedule detected — article will be queued for review until publish time");
    }

    saveMutation.mutate({
      title: title.trim() || titleNp.trim(),
      titleNp: titleNp || undefined,
      slug: autoSlug(slug),
      content: hasEnglishBody ? content : contentNp,
      contentNp: contentNp || undefined,
      excerpt: excerpt || undefined,
      excerptNp: excerptNp || undefined,
      coverImage: coverImage || undefined,
      caption: caption || undefined,
      status,
      type,
      languageEdition,
      province: province ? Number(province) : undefined,
      district: district || undefined,
      scheduledAt: scheduledAt || undefined,
      tagIds,
      isFeatured,
      isBreaking,
      categoryId,
      metaTitle: metaTitle || undefined,
      metaTitleNp: metaTitleNp || undefined,
      metaDescription: metaDescription || undefined,
      metaDescriptionNp: metaDescriptionNp || undefined,
      keywords: keywords || undefined,
      keywordsNp: keywordsNp || undefined,
      ogImage: ogImage || undefined,
    });
  };

  const statusLabel =
    STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;

  return (
    <div className={adminPageContainer}>
      <div
        className="sticky top-0 z-20 -mx-1 flex flex-wrap items-center justify-between gap-2 rounded-sm border border-border/70 px-3 py-2 shadow-xs backdrop-blur-sm"
        style={{ backgroundColor: `${ADMIN_BRAND.surface}f2` }}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/admin/articles" className={adminBtnGhost} title="Back to articles">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {isEditing ? "Edit article" : "New article"}
            </p>
            {title || titleNp ? (
              <p className="truncate text-[10px] text-muted-foreground">{titleNp || title}</p>
            ) : null}
          </div>
          <span
            className={`hidden shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase sm:inline ${STATUS_BADGE[status]}`}
          >
            {statusLabel}
          </span>
          {saveState === "saving" ? (
            <span className="text-[10px] font-medium text-muted-foreground">Saving…</span>
          ) : saveState === "saved" && !isDirty ? (
            <span className="text-[10px] font-medium text-emerald-600">Saved</span>
          ) : isDirty ? (
            <span className="text-[10px] font-medium text-amber-600">Unsaved changes</span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/articles" className={adminBtnSecondary}>
            Cancel
          </Link>
          <button
            type="submit"
            form={FORM_ID}
            className={adminBtnPrimary}
            disabled={saveMutation.isPending}
          >
            <Save className="h-3 w-3" />
            {saveMutation.isPending ? "Saving…" : isEditing ? "Save changes" : "Submit"}
          </button>
        </div>
      </div>

      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
        <AdminFormSection
          number={1}
          title="Article information"
          hint={
            languageEdition === LanguageEdition.BOTH
              ? "Both editions selected — fill Nepali + English title, body, and excerpt. One save publishes to echomanchs.com and en.echomanchs.com."
              : languageEdition === LanguageEdition.ENGLISH_ONLY
                ? "English only — this article appears on en.echomanchs.com only."
                : "Nepali only — this article appears on echomanchs.com only. Change Language edition below to publish in both languages."
          }
        >
          <AdminFormRow
            serial={1}
            label="Language edition"
            required
            hint="Choose first. Both = one article, two languages (same slug on both sites)."
          >
            <select
              id="language"
              value={languageEdition}
              onChange={(e) => setLanguageEdition(e.target.value as LanguageEdition)}
              className={`${adminSelect} w-full max-w-sm`}
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </AdminFormRow>

          <AdminFormRow
            serial={2}
            label="Nepali headline (शीर्षक)"
            required={languageEdition !== LanguageEdition.ENGLISH_ONLY}
          >
            <div className="w-full max-w-2xl space-y-2">
              <input
                id="title-np"
                type="text"
                required={languageEdition !== LanguageEdition.ENGLISH_ONLY}
                placeholder="नेपाली मुख्य शीर्षक…"
                value={titleNp}
                onChange={(e) => setTitleNp(e.target.value)}
                className={`${adminInput} w-full text-sm font-semibold`}
              />
              <NepaliTypingHelper />
            </div>
          </AdminFormRow>

          <AdminFormRow
            serial={3}
            label="English title"
            required={languageEdition !== LanguageEdition.NEPALI_ONLY}
          >
            <input
              id="title-en"
              type="text"
              required={languageEdition !== LanguageEdition.NEPALI_ONLY}
              placeholder="English story title…"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={`${adminInput} w-full max-w-2xl`}
            />
          </AdminFormRow>

          <AdminFormRow
            serial={4}
            label="URL slug (shared)"
            required
            hint="One latin slug for both sites — same path on echomanchs.com and en.echomanchs.com"
          >
            <input
              id="slug"
              type="text"
              required
              placeholder="url-slug-in-english-letters"
              value={slug}
              onChange={(e) => setSlug(autoSlug(e.target.value))}
              className={`${adminInput} w-full max-w-md font-mono`}
            />
          </AdminFormRow>

          {(languageEdition === LanguageEdition.ENGLISH_ONLY ||
            languageEdition === LanguageEdition.BOTH) && (
            <AdminFormRow
              serial={5}
              label="Excerpt (English)"
              hint="Short summary on English cards and listings"
            >
              <textarea
                id="excerpt"
                rows={2}
                placeholder="Brief English summary…"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className={`${adminInput} min-h-14 w-full max-w-2xl resize-y py-2`}
              />
            </AdminFormRow>
          )}

          {(languageEdition === LanguageEdition.NEPALI_ONLY ||
            languageEdition === LanguageEdition.BOTH) && (
            <AdminFormRow
              serial={languageEdition === LanguageEdition.BOTH ? 6 : 5}
              label="Excerpt (Nepali / सारांश)"
              hint="Short summary on Nepali cards and listings"
            >
              <textarea
                id="excerpt-np"
                rows={2}
                placeholder="छोटो नेपाली सारांश…"
                value={excerptNp}
                onChange={(e) => setExcerptNp(e.target.value)}
                className={`${adminInput} min-h-14 w-full max-w-2xl resize-y py-2`}
              />
            </AdminFormRow>
          )}
        </AdminFormSection>

        <AdminFormBodySection
          number={2}
          title="Article body (English)"
          required={languageEdition !== LanguageEdition.NEPALI_ONLY}
          hint={
            languageEdition === LanguageEdition.NEPALI_ONLY
              ? "Optional for Nepali-only articles."
              : "Write the full English story. Required for English-only and Both editions."
          }
        >
          <TipTapEditor
            value={content}
            onChange={setContent}
            variant="longform"
            placeholder="Start writing the full article…"
          />
        </AdminFormBodySection>

        <AdminFormBodySection
          number={3}
          title="Article body (Nepali / नेपाली)"
          required={languageEdition !== LanguageEdition.ENGLISH_ONLY}
          hint={
            languageEdition === LanguageEdition.ENGLISH_ONLY
              ? "Optional for English-only articles."
              : "Write the full Nepali story. Required for Nepali-only and Both editions."
          }
        >
          <TipTapEditor
            value={contentNp}
            onChange={setContentNp}
            variant="longform"
            placeholder="पूरा समाचार यहाँ लेख्नुहोस्…"
          />
        </AdminFormBodySection>

        <AdminFormSection number={4} title="Category & classification">
          <AdminFormRow serial={1} label="Category" required>
            <select
              id="category"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`${adminSelect} w-full max-w-sm`}
            >
              <option value="">— Select category —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameNp ? `${cat.nameNp} (${cat.name})` : cat.name}
                </option>
              ))}
            </select>
          </AdminFormRow>

          <AdminFormRow serial={2} label="Article format">
            <select
              id="format"
              value={type}
              onChange={(e) => setType(e.target.value as ArticleType)}
              className={`${adminSelect} w-full max-w-sm`}
            >
              {FORMAT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </AdminFormRow>

          <AdminFormRow serial={3} label="Province">
            <select
              id="province"
              value={province || ""}
              onChange={(e) => setProvince(e.target.value ? Number(e.target.value) : undefined)}
              className={`${adminSelect} w-full max-w-sm`}
            >
              <option value="">National / not applicable</option>
              {NEPAL_PROVINCES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </AdminFormRow>

          <AdminFormRow serial={4} label="District">
            <input
              id="district"
              type="text"
              placeholder="e.g. Kathmandu, Kaski…"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className={`${adminInput} w-full max-w-sm`}
            />
          </AdminFormRow>

          <AdminFormRow serial={5} label="Tags">
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-w-2xl">
                {tags.map((tag) => {
                  const checked = tagIds.includes(tag.id);
                  return (
                    <label
                      key={tag.id}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-sm border px-2 py-1 text-xs ${
                        checked
                          ? "border-[#0C4EA0] bg-[#0C4EA0]/10 text-[#0C4EA0]"
                          : "border-border/70 text-muted-foreground"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => {
                          setTagIds((current) =>
                            checked
                              ? current.filter((id) => id !== tag.id)
                              : [...current, tag.id]
                          );
                        }}
                      />
                      {tag.name}
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No tags yet. Create tags under Content → Tags.
              </p>
            )}
          </AdminFormRow>
        </AdminFormSection>

        <AdminFormSection number={5} title="Publishing & placement">
          <AdminFormRow serial={1} label="Publication status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ArticleStatus)}
              className={`${adminSelect} w-full max-w-sm`}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </AdminFormRow>

          <AdminFormRow
            serial={2}
            label="Scheduled publish date"
            hint="Future dates queue the article for automatic publishing via cron"
          >
            <input
              id="scheduled-at"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className={`${adminInput} w-full max-w-xs font-mono text-[11px]`}
            />
          </AdminFormRow>

          <AdminFormRow serial={3} label="Homepage placement">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-6">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-border accent-[#0C4EA0]"
                />
                Pin as lead story
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-[#C3272E]">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-border accent-[#C3272E]"
                />
                Add to breaking ticker
              </label>
            </div>
          </AdminFormRow>
        </AdminFormSection>

        <AdminFormSection number={6} title="Media & cover image">
          <AdminFormRow
            serial={1}
            label="Cover image"
            hint="PNG, JPG, WEBP or GIF — maximum 500 KB"
          >
            <div className="max-w-lg space-y-3">
              <DualImagePicker
                value={coverImage}
                onChange={setCoverImage}
                folder="articles"
                label=""
              />

              {coverImage ? (
                <div className={`${adminPanel} relative max-w-sm overflow-hidden`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt={caption || "Cover preview"}
                    className="h-36 w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                    <button type="button" onClick={() => setCoverImage("")} className={adminBtnDanger}>
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : null}

              {coverGallery.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Uploaded media ({coverGallery.length})
                    </span>
                    <button type="button" onClick={() => setCoverGallery([])} className={adminBtnGhost}>
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 rounded-sm border border-border/70 bg-muted/20 p-2">
                    {coverGallery.map((item) => {
                      const isActive = coverImage === item.url;
                      return (
                        <div
                          key={item.id}
                          className={`group relative cursor-pointer overflow-hidden rounded-sm border-2 ${
                            isActive ? "border-[#0C4EA0]" : "border-border/70 opacity-80"
                          }`}
                          onClick={() => setCoverImage(item.url)}
                          title={item.name}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.url} alt={item.name} className="h-11 w-11 object-cover" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCoverGallery((prev) => prev.filter((g) => g.id !== item.id));
                              if (coverImage === item.url) setCoverImage("");
                            }}
                            className="absolute right-0.5 top-0.5 rounded-full bg-black/75 p-0.5 text-white opacity-0 hover:bg-[#C3272E] group-hover:opacity-100"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </AdminFormRow>

          <AdminFormRow serial={2} label="Photo caption / credit">
            <input
              id="caption"
              type="text"
              placeholder="Photo credit or caption text…"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className={`${adminInput} w-full max-w-lg`}
            />
          </AdminFormRow>
        </AdminFormSection>

        <AdminFormSection
          number={7}
          title="SEO & social metadata"
          hint="Fill SEO for each edition you publish. Leave blank to fall back to the headline / excerpt for that language. OG image is shared."
        >
          {(languageEdition === LanguageEdition.ENGLISH_ONLY ||
            languageEdition === LanguageEdition.BOTH) && (
            <AdminFormRow
              serial={1}
              label="Meta title (English)"
              hint="Leave blank to use the English headline"
            >
              <input
                id="meta-title"
                type="text"
                placeholder="Custom English search title…"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className={`${adminInput} w-full max-w-2xl`}
              />
            </AdminFormRow>
          )}

          {(languageEdition === LanguageEdition.ENGLISH_ONLY ||
            languageEdition === LanguageEdition.BOTH) && (
            <AdminFormRow serial={2} label="Meta description (English)">
              <textarea
                id="meta-description"
                rows={2}
                placeholder="English search result snippet…"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className={`${adminInput} min-h-14 w-full max-w-2xl resize-y py-2`}
              />
            </AdminFormRow>
          )}

          {(languageEdition === LanguageEdition.ENGLISH_ONLY ||
            languageEdition === LanguageEdition.BOTH) && (
            <AdminFormRow serial={3} label="Keywords (English)">
              <input
                id="keywords"
                type="text"
                placeholder="nepal, politics, parliament…"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className={`${adminInput} w-full max-w-2xl`}
              />
            </AdminFormRow>
          )}

          {(languageEdition === LanguageEdition.NEPALI_ONLY ||
            languageEdition === LanguageEdition.BOTH) && (
            <AdminFormRow
              serial={languageEdition === LanguageEdition.BOTH ? 4 : 1}
              label="Meta title (Nepali)"
              hint="Leave blank to use the Nepali headline"
            >
              <input
                id="meta-title-np"
                type="text"
                placeholder="नेपाली खोज शीर्षक…"
                value={metaTitleNp}
                onChange={(e) => setMetaTitleNp(e.target.value)}
                className={`${adminInput} w-full max-w-2xl`}
              />
            </AdminFormRow>
          )}

          {(languageEdition === LanguageEdition.NEPALI_ONLY ||
            languageEdition === LanguageEdition.BOTH) && (
            <AdminFormRow
              serial={languageEdition === LanguageEdition.BOTH ? 5 : 2}
              label="Meta description (Nepali)"
            >
              <textarea
                id="meta-description-np"
                rows={2}
                placeholder="नेपाली खोज परिणाम विवरण…"
                value={metaDescriptionNp}
                onChange={(e) => setMetaDescriptionNp(e.target.value)}
                className={`${adminInput} min-h-14 w-full max-w-2xl resize-y py-2`}
              />
            </AdminFormRow>
          )}

          {(languageEdition === LanguageEdition.NEPALI_ONLY ||
            languageEdition === LanguageEdition.BOTH) && (
            <AdminFormRow
              serial={languageEdition === LanguageEdition.BOTH ? 6 : 3}
              label="Keywords (Nepali)"
            >
              <input
                id="keywords-np"
                type="text"
                placeholder="नेपाल, राजनीति, संसद…"
                value={keywordsNp}
                onChange={(e) => setKeywordsNp(e.target.value)}
                className={`${adminInput} w-full max-w-2xl`}
              />
            </AdminFormRow>
          )}

          <AdminFormRow
            serial={
              languageEdition === LanguageEdition.BOTH
                ? 7
                : languageEdition === LanguageEdition.ENGLISH_ONLY
                  ? 4
                  : 4
            }
            label="Open Graph image URL (shared)"
            hint="Social share image for both editions — leave empty to use cover image"
          >
            <input
              id="og-image"
              type="url"
              placeholder="https://example.com/og-image.jpg"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              className={`${adminInput} w-full max-w-2xl font-mono`}
            />
          </AdminFormRow>
        </AdminFormSection>

        <div className="flex flex-wrap items-center justify-end gap-2 rounded-sm border border-border/70 bg-card px-4 py-3 shadow-xs">
          <Link href="/admin/articles" className={adminBtnSecondary}>
            Cancel
          </Link>
          <button type="submit" className={adminBtnPrimary} disabled={saveMutation.isPending}>
            <Save className="h-3 w-3" />
            {saveMutation.isPending ? "Saving…" : isEditing ? "Save changes" : "Submit article"}
          </button>
        </div>
      </form>
    </div>
  );
}
