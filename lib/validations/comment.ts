export type CommentInput = {
  content: string;
  authorName?: string | null;
  authorEmail?: string | null;
};

export type CommentValidationResult =
  | { ok: true; data: CommentInput }
  | { ok: false; error: string };

export function validateCommentCreate(body: unknown): CommentValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const input = body as Record<string, unknown>;
  const content = typeof input.content === "string" ? input.content.trim() : "";

  if (!content) {
    return { ok: false, error: "प्रतिक्रिया/टिप्पणी आवश्यक छ (Comment content required)" };
  }

  if (content.length > 5000) {
    return { ok: false, error: "Comment is too long (max 5000 characters)" };
  }

  const authorName =
    typeof input.authorName === "string" ? input.authorName.trim() || null : null;
  const authorEmail =
    typeof input.authorEmail === "string" ? input.authorEmail.trim() || null : null;

  if (authorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) {
    return { ok: false, error: "Invalid email address" };
  }

  return { ok: true, data: { content, authorName, authorEmail } };
}
