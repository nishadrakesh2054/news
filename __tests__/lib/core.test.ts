import { describe, expect, it, vi } from "vitest";
import { ArticleStatus, Role } from "@prisma/client";
import { DEFAULT_ROLE_PERMISSIONS } from "@/constants/permissions";

vi.mock("@/lib/permissions", () => ({
  canRole: async (role: Role, permission: string) => {
    if (role === Role.SUPER_ADMIN) return true;
    if (role === Role.ADMIN || role === Role.EDITOR || role === Role.AUTHOR) {
      const list = DEFAULT_ROLE_PERMISSIONS[role] ?? [];
      return list.includes(permission as never);
    }
    return false;
  },
  isSuperAdmin: (role: Role | null | undefined) => role === Role.SUPER_ADMIN,
}));

import {
  assertArticleStatusPermission,
  assertBreakingPermission,
  assertFeaturedPermission,
  assertArticleOwnershipForDelete,
} from "@/lib/article-permissions";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";
import { buildArticleSearchOr, parseSearchPagination } from "@/lib/search";
import { checkRateLimit } from "@/lib/rate-limit";

describe("sanitizeArticleHtml", () => {
  it("removes script tags", () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>';
    expect(sanitizeArticleHtml(dirty)).not.toContain("<script");
    expect(sanitizeArticleHtml(dirty)).toContain("Hello");
  });

  it("strips protocol-relative and javascript URLs", () => {
    const dirty = '<a href="//evil.com">x</a><a href="javascript:alert(1)">y</a>';
    const clean = sanitizeArticleHtml(dirty);
    expect(clean).not.toContain("//evil.com");
    expect(clean).not.toContain("javascript:");
  });

  it("returns empty string for blank input", () => {
    expect(sanitizeArticleHtml("")).toBe("");
    expect(sanitizeArticleHtml(null)).toBe("");
  });
});

describe("article permissions", () => {
  it("allows authors to save drafts", async () => {
    expect(await assertArticleStatusPermission(Role.AUTHOR, ArticleStatus.DRAFT)).toBeNull();
    expect(await assertArticleStatusPermission(Role.AUTHOR, ArticleStatus.PENDING)).toBeNull();
  });

  it("blocks authors from publishing", async () => {
    expect(
      await assertArticleStatusPermission(Role.AUTHOR, ArticleStatus.PUBLISHED)
    ).not.toBeNull();
  });

  it("blocks authors from marking breaking", async () => {
    expect(await assertBreakingPermission(Role.AUTHOR, true)).not.toBeNull();
    expect(await assertBreakingPermission(Role.EDITOR, true)).toBeNull();
  });

  it("blocks authors from featuring", async () => {
    expect(await assertFeaturedPermission(Role.AUTHOR, true)).not.toBeNull();
  });

  it("scopes author deletes to own articles", () => {
    expect(
      assertArticleOwnershipForDelete(Role.AUTHOR, "a1", "a2")
    ).not.toBeNull();
    expect(assertArticleOwnershipForDelete(Role.AUTHOR, "a1", "a1")).toBeNull();
    expect(assertArticleOwnershipForDelete(Role.EDITOR, "e1", "a2")).toBeNull();
  });
});

describe("search helpers", () => {
  it("builds title-focused OR clauses by default", () => {
    const clauses = buildArticleSearchOr("nepal", false);
    expect(clauses.length).toBeGreaterThan(3);
    expect(JSON.stringify(clauses)).not.toContain("content");
  });

  it("includes content when deep search enabled", () => {
    const clauses = buildArticleSearchOr("nepal", true);
    expect(JSON.stringify(clauses)).toContain("content");
  });

  it("parses pagination safely", () => {
    const params = new URLSearchParams("page=2&limit=99&sort=views&deep=true");
    const parsed = parseSearchPagination(params);
    expect(parsed.page).toBe(2);
    expect(parsed.limit).toBe(50);
    expect(parsed.sort).toBe("views");
    expect(parsed.deep).toBe(true);
  });
});

describe("rate limit", () => {
  it("allows requests under the limit", () => {
    const key = `test-${Date.now()}`;
    expect(checkRateLimit(key, 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit(key, 3, 60_000).allowed).toBe(true);
  });
});
