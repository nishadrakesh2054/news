/**
 * Validate third-party tracking IDs before persisting or emitting scripts.
 */

export function isValidGa4Id(id: string): boolean {
  if (!id) return true;
  return /^G-[A-Z0-9]+$/i.test(id.trim());
}

export function isValidGtmId(id: string): boolean {
  if (!id) return true;
  return /^GTM-[A-Z0-9]+$/i.test(id.trim());
}

/** Meta Pixel IDs are numeric (often 15–16 digits). */
export function isValidFbPixelId(id: string): boolean {
  if (!id) return true;
  return /^\d{5,20}$/.test(id.trim());
}

export function sanitizeTrackingConfig(input: {
  ga4Id?: string;
  gtmId?: string;
  fbPixelId?: string;
}): { ok: true; config: { ga4Id: string; gtmId: string; fbPixelId: string } } | { ok: false; error: string } {
  const ga4Id = typeof input.ga4Id === "string" ? input.ga4Id.trim() : "";
  const gtmId = typeof input.gtmId === "string" ? input.gtmId.trim() : "";
  const fbPixelId = typeof input.fbPixelId === "string" ? input.fbPixelId.trim() : "";

  if (!isValidGa4Id(ga4Id)) {
    return { ok: false, error: "Invalid GA4 ID (expected format G-XXXXXXXX)." };
  }
  if (!isValidGtmId(gtmId)) {
    return { ok: false, error: "Invalid GTM ID (expected format GTM-XXXXXXX)." };
  }
  if (!isValidFbPixelId(fbPixelId)) {
    return { ok: false, error: "Invalid Meta Pixel ID (digits only)." };
  }

  return { ok: true, config: { ga4Id, gtmId, fbPixelId } };
}
