export type DeviceCategory = "mobile" | "desktop" | "tablet" | "unknown";

const MOBILE_RE = /mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i;
const TABLET_RE = /ipad|tablet|playbook|silk/i;

export function getDeviceTypeFromUserAgent(userAgent: string | null | undefined): DeviceCategory {
  if (!userAgent) return "unknown";
  if (TABLET_RE.test(userAgent)) return "tablet";
  if (MOBILE_RE.test(userAgent)) return "mobile";
  return "desktop";
}

export const DEVICE_LABELS: Record<DeviceCategory, string> = {
  mobile: "Mobile Web (Smartphones)",
  desktop: "Desktop & Laptops",
  tablet: "Tablets & iPad",
  unknown: "Unknown",
};
