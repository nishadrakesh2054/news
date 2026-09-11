import { describe, expect, it } from "vitest";
import { validatePassword, PASSWORD_MIN_LENGTH } from "@/lib/password-policy";
import {
  generateResetToken,
  hashResetToken,
} from "@/lib/password-reset";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";

describe("password policy", () => {
  it("rejects short passwords", () => {
    expect(validatePassword("short")).toContain(String(PASSWORD_MIN_LENGTH));
    expect(validatePassword("Longenough1")).toBeNull();
  });

  it("requires a letter and a number", () => {
    expect(validatePassword("longenough")).not.toBeNull();
    expect(validatePassword("1234567890")).not.toBeNull();
  });

  it("requires uppercase or special character", () => {
    expect(validatePassword("longenough1")).not.toBeNull();
    expect(validatePassword("Longenough1")).toBeNull();
    expect(validatePassword("longenough1!")).toBeNull();
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
