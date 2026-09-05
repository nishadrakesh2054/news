import { describe, expect, it } from "vitest";
import { ArticleStatus, Role } from "@prisma/client";
import {
  assertArticleStatusPermission,
  assertBreakingPermission,
  assertFeaturedPermission,
  assertSchedulePermission,
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
  it("allows authors to save drafts", () => {
    expect(assertArticleStatusPermission(Role.AUTHOR, ArticleStatus.DRAFT)).toBeNull();
    expect(assertArticleStatusPermission(Role.AUTHOR, ArticleStatus.PENDING)).toBeNull();
  });

  it("blocks authors from publishing", () => {
    expect(assertArticleStatusPermission(Role.AUTHOR, ArticleStatus.PUBLISHED)).not.toBeNull();
  });

  it("blocks authors from marking breaking", () => {
    expect(assertBreakingPermission(Role.AUTHOR, true)).not.toBeNull();
    expect(assertBreakingPermission(Role.EDITOR, true)).toBeNull();
  });

  it("blocks authors from featuring", () => {
    expect(assertFeaturedPermission(Role.AUTHOR, true)).not.toBeNull();
  });

  it("blocks authors from scheduling future publish", () => {
    const future = new Date(Date.now() + 60 * 60 * 1000);
    expect(assertSchedulePermission(Role.AUTHOR, future)).not.toBeNull();
    expect(assertSchedulePermission(Role.EDITOR, future)).toBeNull();
    expect(assertSchedulePermission(Role.AUTHOR, null)).toBeNull();
    expect(assertSchedulePermission(Role.AUTHOR, future, future)).toBeNull();
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

  it("blocks after limit exceeded", () => {
    const key = `test-block-${Date.now()}`;
    checkRateLimit(key, 1, 60_000);
    expect(checkRateLimit(key, 1, 60_000).allowed).toBe(false);
  });
});
