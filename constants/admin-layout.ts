/** Shared admin content-area layout tokens — sidebar/header unchanged. */

export const ADMIN_SIDEBAR_WIDTH_EXPANDED = "w-[190px]";
export const ADMIN_SIDEBAR_WIDTH_COLLAPSED = "w-12";

export const ADMIN_BRAND = {
  primary: "#0C4EA0",
  accent: "#C3272E",
  teal: "#027081",
  surface: "#f7f7f8",
} as const;

/* Page shell */
export const adminPageContainer = "w-full space-y-4";

export const adminPageHeader =
  "flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-end sm:justify-between";

export const adminPageTitle =
  "text-[15px] font-semibold tracking-tight text-foreground";

export const adminPageDescription =
  "mt-0.5 text-xs text-muted-foreground";

/* Panels & tables */
export const adminPanel = "border border-border bg-card";

export const adminPanelHeader =
  "flex items-center justify-between border-b border-border px-3 py-2";

export const adminPanelTitle = "text-xs font-semibold text-foreground";

export const adminTableWrap = adminPanel;

export const adminTable = "w-full text-left text-xs";

export const adminTableHead =
  "border-b border-border bg-muted/50 text-[10px] font-medium uppercase tracking-wide text-muted-foreground";

export const adminTableHeadCell = "px-3 py-2 font-medium";

export const adminTableRow =
  "border-b border-border last:border-b-0 hover:bg-muted/30";

export const adminTableCell = "px-3 py-2 align-middle";

/* Stats */
export const adminStatGrid =
  "grid grid-cols-2 border border-border bg-card lg:grid-cols-4 divide-x divide-y divide-border lg:divide-y-0";

export const adminStatCell = "px-4 py-3";

export const adminStatLabel =
  "text-[10px] font-medium uppercase tracking-wide text-muted-foreground";

export const adminStatValue =
  "mt-0.5 text-xl font-semibold tabular-nums text-foreground";

/* Controls */
export const adminBtnPrimary =
  "inline-flex h-7 items-center gap-1.5 rounded-sm bg-[#0C4EA0] px-3 text-xs font-medium text-white hover:bg-[#0a3d82]";

export const adminBtnSecondary =
  "inline-flex h-7 items-center gap-1.5 rounded-sm border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-muted";

export const adminBtnGhost =
  "inline-flex h-7 items-center gap-1 rounded-sm px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground";

export const adminInput =
  "h-8 rounded-sm border border-border bg-card px-2.5 text-xs text-foreground outline-none focus:border-[#0C4EA0]/50";

export const adminSelect =
  "h-8 shrink-0 rounded-sm border border-border bg-card px-2.5 text-xs text-foreground outline-none focus:border-[#0C4EA0]/50";

export const adminFilterTabs =
  "inline-flex h-8 shrink-0 items-center gap-px rounded-sm border border-border bg-card p-px";

export const adminFilterTab =
  "inline-flex h-[30px] items-center rounded-sm px-2 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground";

export const adminFilterTabActive =
  "inline-flex h-[30px] items-center rounded-sm bg-[#0C4EA0] px-2 text-[11px] font-medium text-white";

export const adminToolbarRow =
  "flex flex-nowrap items-center gap-2 overflow-x-auto";

export const adminToolbarSearch =
  "relative min-w-[220px] flex-1 max-w-[480px]";

export const adminToolbarSelectMd = `${adminSelect} w-[132px]`;
export const adminToolbarSelectSm = `${adminSelect} w-[108px]`;
export const adminToolbarSelectStatus = `${adminSelect} w-[124px]`;

/* Badges */
export const adminBadge =
  "inline-flex items-center rounded-sm border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-foreground";

export const adminBadgeSuccess =
  "inline-flex items-center rounded-sm border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";

export const adminBadgeWarning =
  "inline-flex items-center rounded-sm border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";

export const adminBadgeMuted =
  "inline-flex items-center rounded-sm border border-border bg-muted/30 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground";

/* Legacy aliases */
export const adminPageTitleIcon = "hidden";
export const adminCard = adminPanel;
