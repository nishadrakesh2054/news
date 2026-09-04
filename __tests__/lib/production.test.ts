import { describe, expect, it } from "vitest";
import { validatePassword, PASSWORD_MIN_LENGTH } from "@/lib/password-policy";
import {
  generateResetToken,
  hashResetToken,
} from "@/lib/password-reset";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";
import { getSentryDsn } from "@/lib/sentry-options";

describe("password policy", () => {
  it("rejects short passwords", () => {
    expect(validatePassword("short")).toContain(String(PASSWORD_MIN_LENGTH));
    expect(validatePassword("longenough1")).toBeNull();
  });

  it("requires a letter and a number", () => {
    expect(validatePassword("longenough")).not.toBeNull();
    expect(validatePassword("1234567890")).not.toBeNull();
  });
});

describe("password reset tokens", () => {
  it("hashes tokens consistently", () => {
    const token = "abc123";
    expect(hashResetToken(token)).toBe(hashResetToken(token));
    expect(hashResetToken(token)).not.toBe(token);
  });

  it("generates unique tokens", () => {
    expect(generateResetToken()).not.toBe(generateResetToken());
  });
});

describe("site url helpers", () => {
  it("builds absolute urls", () => {
    const url = absoluteUrl("/article/test");
    expect(url).toMatch(/^https?:\/\//);
    expect(url).toContain("/article/test");
  });

  it("returns a site url without trailing slash", () => {
    expect(getSiteUrl().endsWith("/")).toBe(false);
  });
});

describe("sentry config", () => {
  it("reads dsn from env when set", () => {
    const original = process.env.SENTRY_DSN;
    process.env.SENTRY_DSN = "https://example@o0.ingest.sentry.io/0";
    expect(getSentryDsn()).toBe("https://example@o0.ingest.sentry.io/0");
    process.env.SENTRY_DSN = original;
  });
});
