export const SITE_CONFIG = {
  name: "Echo Manch",
  title: "Echo Manch | Nepali News, Breaking, Politics & More",
  description:
    "Echo Manch delivers breaking news, politics, economy, sports, culture, and in-depth reporting from Nepal.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://nepalkhabar.com").replace(/\/$/, ""),
} as const;
