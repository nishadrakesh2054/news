import { describe, expect, it } from "vitest";
import { safeJsonLd } from "@/lib/json-ld";
import {
  isValidFbPixelId,
  isValidGa4Id,
  isValidGtmId,
  sanitizeTrackingConfig,
} from "@/lib/tracking-ids";

describe("safeJsonLd", () => {
  it("escapes script breakout sequences", () => {
    const payload = { title: '</script><script>alert(1)</script>' };
    const encoded = safeJsonLd(payload);
    expect(encoded).not.toContain("</script>");
    expect(encoded).toContain("\\u003c");
    expect(JSON.parse(encoded).title).toContain("script");
  });
});

describe("tracking-ids", () => {
  it("validates GA4 / GTM / Meta formats", () => {
    expect(isValidGa4Id("G-ABC123")).toBe(true);
    expect(isValidGa4Id("UA-123")).toBe(false);
    expect(isValidGtmId("GTM-XXXX")).toBe(true);
    expect(isValidGtmId("G-XXXX")).toBe(false);
    expect(isValidFbPixelId("123456789012345")).toBe(true);
    expect(isValidFbPixelId("abc")).toBe(false);
  });

  it("sanitizeTrackingConfig rejects bad ids", () => {
    const bad = sanitizeTrackingConfig({ ga4Id: "bad", gtmId: "", fbPixelId: "" });
    expect(bad.ok).toBe(false);
    const good = sanitizeTrackingConfig({
      ga4Id: "G-TEST1",
      gtmId: "GTM-TEST1",
      fbPixelId: "1234567890",
    });
    expect(good.ok).toBe(true);
  });
});
