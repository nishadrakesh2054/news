import {
  ArticleStatus,
  ArticleType,
  LanguageEdition,
} from "@prisma/client";
import {
  normalizeStatusForSchedule,
} from "@/lib/article-scheduling";

export type ArticleInput = {
  title?: string;
  titleNp?: string | null;
  slug?: string;
  content?: string;
  contentNp?: string | null;
  excerpt?: string | null;
  excerptNp?: string | null;
  coverImage?: string | null;
  caption?: string | null;
  status?: ArticleStatus;
  type?: ArticleType;
  languageEdition?: LanguageEdition;
  isFeatured?: boolean;
  isBreaking?: boolean;
  categoryId?: string;
  metaTitle?: string | null;
  metaTitleNp?: string | null;
  metaDescription?: string | null;
  metaDescriptionNp?: string | null;
  keywords?: string | null;
  keywordsNp?: string | null;
  ogImage?: string | null;
  province?: number | null;
  district?: string | null;
  scheduledAt?: Date | null;
  tagIds?: string[];
};

export type ArticleValidationResult =
  | { ok: true; data: ArticleInput }
  | { ok: false; error: string };

function parseOptionalString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function hasTextContent(html: string | null | undefined): boolean {
  if (!html) return false;
  const text = html.replace(/<[^>]*>/g, "").trim();
  return text.length > 0;
}

function parseScheduledAt(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

function parseTagIds(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return undefined;
  return value.filter((id): id is string => typeof id === "string" && id.length > 0);
}

function validateBilingualFields(
  languageEdition: LanguageEdition,
  fields: {
    title?: string;
    titleNp?: string | null;
    content?: string;
    contentNp?: string | null;
  },
  isCreate: boolean
): ArticleValidationResult {
  const title = fields.title?.trim() ?? "";
  const titleNp = fields.titleNp?.trim() ?? "";
  const content = fields.content ?? "";
  const contentNp = fields.contentNp ?? "";

  if (languageEdition === LanguageEdition.NEPALI_ONLY) {
    if (!titleNp) {
      return { ok: false, error: "Nepali headline (शीर्षक) is required for Nepali-only articles" };
    }
    if (!hasTextContent(contentNp)) {
      return { ok: false, error: "Nepali article body is required for Nepali-only articles" };
    }
    return {
      ok: true,
      data: {
        title: title || titleNp,
        titleNp,
        content: hasTextContent(content) ? content : contentNp,
        contentNp,
      },
    };
  }

  if (languageEdition === LanguageEdition.ENGLISH_ONLY) {
    if (!title) {
      return { ok: false, error: "English title is required for English-only articles" };
    }
    if (!hasTextContent(content)) {
      return { ok: false, error: "English article body is required for English-only articles" };
    }
    return { ok: true, data: { title, titleNp: titleNp || null, content, contentNp: contentNp || null } };
  }

  if (languageEdition === LanguageEdition.BOTH) {
    if (!titleNp) {
      return { ok: false, error: "Nepali headline is required for bilingual articles" };
    }
    if (!hasTextContent(contentNp)) {
      return { ok: false, error: "Nepali article body is required for bilingual articles" };
    }
    if (!title) {
      return { ok: false, error: "English title is required for bilingual articles" };
    }
    if (!hasTextContent(content)) {
      return { ok: false, error: "English article body is required for bilingual articles" };
    }
    return { ok: true, data: { title, titleNp, content, contentNp } };
  }

  if (isCreate && (!title || !hasTextContent(content))) {
    return { ok: false, error: "English title and body are required" };
  }

  if (!isCreate && fields.title !== undefined && !title) {
    return { ok: false, error: "Title cannot be empty" };
  }

  if (!isCreate && fields.content !== undefined && !hasTextContent(content)) {
    return { ok: false, error: "Content cannot be empty" };
  }

  return { ok: true, data: { title, titleNp: titleNp || null, content, contentNp: contentNp || null } };
}

export function validateArticleCreate(body: unknown): ArticleValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const input = body as Record<string, unknown>;
  const slug = typeof input.slug === "string" ? input.slug.trim().toLowerCase() : "";
  const categoryId = typeof input.categoryId === "string" ? input.categoryId : "";

  if (!slug || !categoryId) {
    return { ok: false, error: "Slug and category are required" };
  }

  const languageEdition =
    typeof input.languageEdition === "string" &&
    Object.values(LanguageEdition).includes(input.languageEdition as LanguageEdition)
      ? (input.languageEdition as LanguageEdition)
      : LanguageEdition.BOTH;

  const bilingual = validateBilingualFields(
    languageEdition,
    {
      title: typeof input.title === "string" ? input.title : "",
      titleNp: parseOptionalString(input.titleNp) ?? null,
      content: typeof input.content === "string" ? input.content : "",
      contentNp: parseOptionalString(input.contentNp) ?? null,
    },
    true
  );

  if (!bilingual.ok) return bilingual;

  const status =
    typeof input.status === "string" && Object.values(ArticleStatus).includes(input.status as ArticleStatus)
      ? (input.status as ArticleStatus)
      : ArticleStatus.DRAFT;

  const type =
    typeof input.type === "string" && Object.values(ArticleType).includes(input.type as ArticleType)
      ? (input.type as ArticleType)
      : ArticleType.STANDARD;

  const province =
    input.province === undefined
      ? undefined
      : input.province === null || input.province === ""
        ? null
        : Number(input.province);

  if (province !== undefined && province !== null && Number.isNaN(province)) {
    return { ok: false, error: "Province must be a valid number" };
  }

  const scheduledAt = parseScheduledAt(input.scheduledAt);
  if (input.scheduledAt !== undefined && input.scheduledAt !== null && input.scheduledAt !== "" && scheduledAt === undefined) {
    return { ok: false, error: "scheduledAt must be a valid date" };
  }

  const tagIds = parseTagIds(input.tagIds);
  if (input.tagIds !== undefined && tagIds === undefined) {
    return { ok: false, error: "tagIds must be an array of tag IDs" };
  }

  const normalizedStatus = normalizeStatusForSchedule(status, scheduledAt ?? null);

  return {
    ok: true,
    data: {
      ...bilingual.data,
      slug,
      excerpt: parseOptionalString(input.excerpt),
      excerptNp: parseOptionalString(input.excerptNp),
      coverImage: parseOptionalString(input.coverImage),
      caption: parseOptionalString(input.caption),
      status: normalizedStatus,
      type,
      languageEdition,
      isFeatured: Boolean(input.isFeatured),
      isBreaking: Boolean(input.isBreaking),
      categoryId,
      metaTitle: parseOptionalString(input.metaTitle),
      metaTitleNp: parseOptionalString(input.metaTitleNp),
      metaDescription: parseOptionalString(input.metaDescription),
      metaDescriptionNp: parseOptionalString(input.metaDescriptionNp),
      keywords: parseOptionalString(input.keywords),
      keywordsNp: parseOptionalString(input.keywordsNp),
      ogImage: parseOptionalString(input.ogImage),
      province,
      district: parseOptionalString(input.district),
      scheduledAt,
      tagIds,
    },
  };
}

export function validateArticleUpdate(body: unknown): ArticleValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const input = body as Record<string, unknown>;
  const data: ArticleInput = {};

  if (input.slug !== undefined) {
    if (typeof input.slug !== "string" || !input.slug.trim()) {
      return { ok: false, error: "Slug cannot be empty" };
    }
    data.slug = input.slug.trim().toLowerCase();
  }

  if (input.categoryId !== undefined) {
    if (typeof input.categoryId !== "string" || !input.categoryId) {
      return { ok: false, error: "categoryId must be a valid string" };
    }
    data.categoryId = input.categoryId;
  }

  if (input.status !== undefined) {
    if (
      typeof input.status !== "string" ||
      !Object.values(ArticleStatus).includes(input.status as ArticleStatus)
    ) {
      return { ok: false, error: "Invalid article status" };
    }
    data.status = input.status as ArticleStatus;
  }

  if (input.type !== undefined) {
    if (typeof input.type !== "string" || !Object.values(ArticleType).includes(input.type as ArticleType)) {
      return { ok: false, error: "Invalid article type" };
    }
    data.type = input.type as ArticleType;
  }

  if (input.languageEdition !== undefined) {
    if (
      typeof input.languageEdition !== "string" ||
      !Object.values(LanguageEdition).includes(input.languageEdition as LanguageEdition)
    ) {
      return { ok: false, error: "Invalid language edition" };
    }
    data.languageEdition = input.languageEdition as LanguageEdition;
  }

  const optionalStringFields = [
    "titleNp",
    "contentNp",
    "excerpt",
    "excerptNp",
    "coverImage",
    "caption",
    "metaTitle",
    "metaTitleNp",
    "metaDescription",
    "metaDescriptionNp",
    "keywords",
    "keywordsNp",
    "ogImage",
    "district",
  ] as const;

  for (const field of optionalStringFields) {
    if (input[field] !== undefined) {
      data[field] = parseOptionalString(input[field]) ?? null;
    }
  }

  if (input.title !== undefined) {
    data.title = typeof input.title === "string" ? input.title.trim() : "";
  }

  if (input.content !== undefined) {
    data.content = typeof input.content === "string" ? input.content : "";
  }

  if (input.isFeatured !== undefined) data.isFeatured = Boolean(input.isFeatured);
  if (input.isBreaking !== undefined) data.isBreaking = Boolean(input.isBreaking);

  if (input.province !== undefined) {
    if (input.province === null || input.province === "") {
      data.province = null;
    } else {
      const province = Number(input.province);
      if (Number.isNaN(province)) {
        return { ok: false, error: "Province must be a valid number" };
      }
      data.province = province;
    }
  }

  const scheduledAt = parseScheduledAt(input.scheduledAt);
  if (input.scheduledAt !== undefined && input.scheduledAt !== null && input.scheduledAt !== "" && scheduledAt === undefined) {
    return { ok: false, error: "scheduledAt must be a valid date" };
  }
  if (input.scheduledAt !== undefined) {
    data.scheduledAt = scheduledAt ?? null;
  }

  const tagIds = parseTagIds(input.tagIds);
  if (input.tagIds !== undefined) {
    if (tagIds === undefined) {
      return { ok: false, error: "tagIds must be an array of tag IDs" };
    }
    data.tagIds = tagIds;
  }

  if (data.status && data.scheduledAt) {
    data.status = normalizeStatusForSchedule(data.status, data.scheduledAt);
  }

  return { ok: true, data };
}
