import { describe, expect, it } from "vitest";
import { LanguageEdition } from "@prisma/client";
import {
  articleMatchesLang,
  isEnglishHostname,
  languageEditionWhere,
  parseLangParam,
  resolveArticleContent,
  resolveArticleExcerpt,
  resolveArticleTitle,
  resolveCategoryName,
  resolveKeywords,
  resolveLanguageEdition,
  resolveMetaDescription,
  resolveMetaTitle,
} from "@/lib/language";

describe("language edition detection", () => {
  it("parses lang query values", () => {
    expect(parseLangParam("en")).toBe("en");
    expect(parseLangParam("english")).toBe("en");
    expect(parseLangParam("ne")).toBe("ne");
    expect(parseLangParam("np")).toBe("ne");
    expect(parseLangParam("other")).toBeNull();
  });

  it("detects English hosts", () => {
    expect(isEnglishHostname("en.echomanch.com")).toBe(true);
    expect(isEnglishHostname("english.echomanch.com")).toBe(true);
    expect(isEnglishHostname("echomanch.com")).toBe(false);
    expect(isEnglishHostname("www.echomanch.com")).toBe(false);
  });

  it("prefers query over host", () => {
    expect(resolveLanguageEdition("ne", "en.echomanch.com")).toBe("ne");
    expect(resolveLanguageEdition("en", "echomanch.com")).toBe("en");
  });

  it("falls back to host then Nepali", () => {
    expect(resolveLanguageEdition(null, "en.echomanch.com")).toBe("en");
    expect(resolveLanguageEdition(null, "echomanch.com")).toBe("ne");
  });
});

describe("localized fields", () => {
  it("resolves titles by edition", () => {
    const article = { title: "English", titleNp: "नेपाली" };
    expect(resolveArticleTitle(article, "en")).toBe("English");
    expect(resolveArticleTitle(article, "ne")).toBe("नेपाली");
  });

  it("resolves content by edition", () => {
    const article = { content: "<p>EN</p>", contentNp: "<p>NE</p>" };
    expect(resolveArticleContent(article, "en")).toBe("<p>EN</p>");
    expect(resolveArticleContent(article, "ne")).toBe("<p>NE</p>");
  });

  it("resolves category names by edition", () => {
    const category = { name: "Politics", nameNp: "राजनीति" };
    expect(resolveCategoryName(category, "en")).toBe("Politics");
    expect(resolveCategoryName(category, "ne")).toBe("राजनीति");
  });

  it("resolves excerpts by edition", () => {
    const article = {
      title: "English",
      titleNp: "नेपाली",
      excerpt: "EN summary",
      excerptNp: "NE सारांश",
    };
    expect(resolveArticleExcerpt(article, "en")).toBe("EN summary");
    expect(resolveArticleExcerpt(article, "ne")).toBe("NE सारांश");
  });

  it("resolves SEO meta by edition", () => {
    const article = {
      title: "English",
      titleNp: "नेपाली",
      metaTitle: "EN SEO",
      metaTitleNp: "NE SEO",
      metaDescription: "EN desc",
      metaDescriptionNp: "NE desc",
      keywords: "en,news",
      keywordsNp: "ने,समाचार",
    };
    expect(resolveMetaTitle(article, "en")).toBe("EN SEO");
    expect(resolveMetaTitle(article, "ne")).toBe("NE SEO");
    expect(resolveMetaDescription(article, "en")).toBe("EN desc");
    expect(resolveMetaDescription(article, "ne")).toBe("NE desc");
    expect(resolveKeywords(article, "en")).toBe("en,news");
    expect(resolveKeywords(article, "ne")).toBe("ने,समाचार");
  });
});

describe("edition filters", () => {
  it("builds prisma where for each edition", () => {
    expect(languageEditionWhere("en")).toEqual({
      languageEdition: {
        in: [LanguageEdition.ENGLISH_ONLY, LanguageEdition.BOTH],
      },
    });
    expect(languageEditionWhere("ne")).toEqual({
      languageEdition: {
        in: [LanguageEdition.NEPALI_ONLY, LanguageEdition.BOTH],
      },
    });
  });

  it("matches article editions correctly", () => {
    expect(articleMatchesLang(LanguageEdition.BOTH, "en")).toBe(true);
    expect(articleMatchesLang(LanguageEdition.NEPALI_ONLY, "en")).toBe(false);
    expect(articleMatchesLang(LanguageEdition.ENGLISH_ONLY, "ne")).toBe(false);
  });
});
