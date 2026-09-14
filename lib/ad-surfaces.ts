import { AdSlot } from "@prisma/client";

export type AdSurface = "home" | "article" | "category";

export type AdWithSurfaces = {
  slot: AdSlot | string;
  showOnHome?: boolean | null;
  showOnArticle?: boolean | null;
  showOnCategory?: boolean | null;
};

/** Slots that can target specific page types (not sitewide chrome). */
export function slotUsesPageSurfaces(slot: AdSlot | string): boolean {
  return (
    slot === AdSlot.SIDEBAR_TOP ||
    slot === AdSlot.SIDEBAR_BOTTOM ||
    slot === AdSlot.IN_ARTICLE ||
    slot === "SIDEBAR_TOP" ||
    slot === "SIDEBAR_BOTTOM" ||
    slot === "IN_ARTICLE"
  );
}

/** Filter ads for a page surface. Header / sticky / home spotlight ignore surface flags. */
export function adMatchesSurface(ad: AdWithSurfaces, surface: AdSurface): boolean {
  const slot = ad.slot;

  if (slot === AdSlot.HEADER_LEADERBOARD || slot === "HEADER_LEADERBOARD") return true;
  if (slot === AdSlot.STICKY_FOOTER || slot === "STICKY_FOOTER") return true;
  if (slot === AdSlot.HOME_SPOTLIGHT || slot === "HOME_SPOTLIGHT") {
    return surface === "home";
  }

  if (slot === AdSlot.IN_ARTICLE || slot === "IN_ARTICLE") {
    return surface === "article" && ad.showOnArticle !== false;
  }

  // Sidebars
  if (surface === "home") return ad.showOnHome !== false;
  if (surface === "article") return ad.showOnArticle !== false;
  return ad.showOnCategory !== false;
}

export function defaultSurfacesForSlot(slot: AdSlot | string): {
  showOnHome: boolean;
  showOnArticle: boolean;
  showOnCategory: boolean;
} {
  if (slot === AdSlot.HOME_SPOTLIGHT || slot === "HOME_SPOTLIGHT") {
    return { showOnHome: true, showOnArticle: false, showOnCategory: false };
  }
  if (slot === AdSlot.IN_ARTICLE || slot === "IN_ARTICLE") {
    return { showOnHome: false, showOnArticle: true, showOnCategory: false };
  }
  if (
    slot === AdSlot.HEADER_LEADERBOARD ||
    slot === "HEADER_LEADERBOARD" ||
    slot === AdSlot.STICKY_FOOTER ||
    slot === "STICKY_FOOTER"
  ) {
    return { showOnHome: true, showOnArticle: true, showOnCategory: true };
  }
  // Sidebars — all pages by default
  return { showOnHome: true, showOnArticle: true, showOnCategory: true };
}

export const SLOT_WHERE: Record<AdSlot, string> = {
  HEADER_LEADERBOARD: "Every page (top banner)",
  SIDEBAR_TOP: "Sidebar · choose pages below",
  SIDEBAR_BOTTOM: "Sidebar · choose pages below",
  IN_ARTICLE: "Article detail page only",
  STICKY_FOOTER: "Every page (bottom bar)",
  HOME_SPOTLIGHT: "Home page only (under spotlight)",
};
