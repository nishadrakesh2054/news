/** Shared admin content-area layout tokens — sidebar/header unchanged. */

export const ADMIN_SIDEBAR_WIDTH_EXPANDED = "w-[190px]";
export const ADMIN_SIDEBAR_WIDTH_COLLAPSED = "w-12";

/** Sidebar typography — Inter UI stack for crisp Latin nav labels */
export const adminSidebarShell =
  "antialiased [font-family:var(--font-admin-ui),ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]";

export const adminSidebarSectionLabel =
  "text-[10px] font-semibold uppercase tracking-[0.1em] text-white/60";

export const adminSidebarNavLink =
  "text-[12px] leading-5 tracking-[0.01em]";

export const adminSidebarNavLinkActive =
  "bg-[#C3272E] font-semibold text-white";

export const adminSidebarNavLinkInactive =
  "font-medium text-white/85 hover:bg-white/10 hover:text-white";

export const adminSidebarNavIcon =
  "h-4 w-4 shrink-0 stroke-[1.75]";

export const ADMIN_BRAND = {
  primary: "#0C4EA0",
  accent: "#C3272E",
  teal: "#027081",
  surface: "#F8FAFC",
} as const;

/* Page shell */
export const adminPageContainer = "w-full space-y-4";

export const adminPageTitle =
  "text-[15px] font-semibold tracking-tight text-foreground";

export const adminPageDescription =
  "mt-0.5 text-xs text-muted-foreground";

export const adminPageHeader =
  "flex flex-col gap-2 border-b border-border/70 pb-3 sm:flex-row sm:items-end sm:justify-between";

/* Panels & tables */
export const adminPanel = "rounded-sm border border-border/70 bg-card shadow-xs";

export const adminPanelHeader =
  "flex items-center justify-between border-b border-border/70 px-3 py-2";

export const adminPanelTitle = "text-xs font-semibold text-foreground";

export const adminTableWrap = adminPanel;

export const adminTable = "w-full text-left text-xs";

export const adminTableHead =
  "border-b border-border/70 bg-muted/30 text-[10px] font-medium uppercase tracking-wide text-muted-foreground";

export const adminTableHeadCell = "px-3 py-2 font-medium";

export const adminTableRow =
  "border-b border-border/70 last:border-b-0 hover:bg-muted/25";

export const adminTableCell = "px-3 py-2.5 align-middle";

/** Truncate without clipping Devanagari matras (overflow + tight leading). */
export const adminTextTruncate =
  "block max-w-full overflow-hidden text-ellipsis whitespace-nowrap py-0.5 leading-[1.55]";

/* Stats */
export const adminStatGrid =
  "grid grid-cols-2 rounded-sm border border-border/70 bg-card shadow-xs lg:grid-cols-4 divide-x divide-y divide-border/70 lg:divide-y-0";

export const adminStatCell = "px-4 py-3";

export const adminStatLabel =
  "text-[10px] font-medium uppercase tracking-wide text-muted-foreground";

export const adminStatValue =
  "mt-0.5 text-xl font-semibold tabular-nums text-foreground";

export const adminStatHint =
  "mt-0.5 text-[10px] text-muted-foreground";

export const adminStatCard =
  "rounded-sm border border-border/70 bg-card px-3 py-2.5 shadow-xs";

export const adminStatCardsGrid =
  "grid grid-cols-2 gap-2 lg:grid-cols-4";

/* Controls */
export const adminBtnPrimary =
  "inline-flex h-7 items-center gap-1.5 rounded-sm bg-[#0C4EA0] px-3 text-xs font-medium text-white shadow-xs hover:bg-[#0a3d82]";

export const adminBtnAccent =
  "inline-flex h-7 items-center gap-1.5 rounded-sm border border-[#C3272E]/50 bg-[#C3272E] px-3 text-xs font-medium text-white shadow-xs hover:bg-[#a82026]";

export const adminBtnDanger =
  "inline-flex h-7 items-center gap-1.5 rounded-sm border border-[#C3272E]/40 bg-[#C3272E]/5 px-3 text-xs font-medium text-[#C3272E] hover:bg-[#C3272E]/10";

export const adminBtnSecondary =
  "inline-flex h-7 items-center gap-1.5 rounded-sm border border-border/70 bg-card px-3 text-xs font-medium text-foreground shadow-xs hover:bg-muted";

export const adminBtnGhost =
  "inline-flex h-7 items-center gap-1 rounded-sm px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground";

export const adminInput =
  "h-8 rounded-sm border border-border/70 bg-card px-2.5 text-xs text-foreground shadow-xs outline-none focus:border-[#0C4EA0]/40";

export const adminSelect =
  "h-8 shrink-0 rounded-sm border border-border/70 bg-card px-2.5 text-xs text-foreground shadow-xs outline-none focus:border-[#0C4EA0]/40";

export const adminFilterTabs =
  "inline-flex h-8 shrink-0 items-center gap-px rounded-sm border border-border/70 bg-card p-px shadow-xs";

export const adminFilterTab =
  "inline-flex h-[30px] items-center rounded-sm px-2 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground";

export const adminFilterTabActive =
  "inline-flex h-[30px] items-center rounded-sm bg-[#0C4EA0] px-2 text-[11px] font-medium text-white";

export const adminToolbarRow =
  "flex flex-wrap items-center gap-2";

export const adminToolbarPanel =
  "space-y-2 rounded-sm border border-border/70 bg-card p-2.5 shadow-xs";

export const adminToolbarFilters =
  "flex flex-wrap items-center gap-2";

export const adminToolbarSearch =
  "relative min-w-0 w-full flex-1 sm:max-w-md lg:max-w-lg";

export const adminToolbarSelectMd = `${adminSelect} w-full min-w-[7.5rem] sm:w-[132px]`;
export const adminToolbarSelectSm = `${adminSelect} w-[72px] sm:w-[108px]`;
export const adminToolbarSelectStatus = `${adminSelect} w-full min-w-[7.5rem] sm:w-[124px]`;

/* Badges */
export const adminBadge =
  "inline-flex items-center rounded-sm border border-border/70 bg-muted/40 px-1.5 py-1 text-[10px] font-medium leading-relaxed text-foreground";

export const adminBadgeSuccess =
  "inline-flex items-center rounded-sm border border-emerald-200 bg-emerald-50 px-1.5 py-1 text-[10px] font-medium leading-relaxed text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300";

export const adminBadgeWarning =
  "inline-flex items-center rounded-sm border border-amber-200 bg-amber-50 px-1.5 py-1 text-[10px] font-medium leading-relaxed text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300";

export const adminBadgeMuted =
  "inline-flex items-center rounded-sm border border-border/70 bg-muted/25 px-1.5 py-1 text-[10px] font-medium leading-relaxed text-muted-foreground";

/* Official / govt-style form tables */
export const adminFormSection = `${adminPanel} overflow-hidden`;

export const adminFormSectionHeader =
  "border-b border-[#0C4EA0]/20 bg-[#0C4EA0] px-3 py-2 text-xs font-semibold tracking-wide text-white";

export const adminFormTable = "w-full border-collapse text-xs";

export const adminFormRow = "border-b border-border/70 last:border-b-0";

export const adminFormSerial =
  "w-9 border-r border-border/70 bg-muted/40 px-1.5 py-2.5 text-center text-[10px] font-semibold text-muted-foreground align-top";

export const adminFormLabel =
  "w-[26%] min-w-[132px] max-w-[200px] border-r border-border/70 bg-muted/20 px-3 py-2.5 text-left text-[11px] font-medium leading-snug text-foreground align-top";

export const adminFormValue = "px-3 py-2.5 align-top";

/* Legacy soft aliases (same as defaults) */
export const adminBorderSoft = "border-border/70";
export const adminDivideSoft = "divide-border/70";
export const adminSurfaceSoft = adminPanel;
export const adminPanelSoft = adminPanel;
export const adminPageHeaderSoft = adminPageHeader;
export const adminTableHeadSoft = adminTableHead;
export const adminTableRowSoft = adminTableRow;
export const adminStatGridSoft = adminStatGrid;
export const adminStatCardSoft = adminStatCard;
export const adminStatCardsGridSoft = adminStatCardsGrid;
export const adminBtnSecondarySoft = adminBtnSecondary;
export const adminInputSoft = adminInput;
export const adminSelectSoft = adminSelect;
export const adminToolbarSelectMdSoft = adminToolbarSelectMd;
export const adminToolbarSelectSmSoft = adminToolbarSelectSm;
export const adminToolbarSelectStatusSoft = adminToolbarSelectStatus;
export const adminBadgeMutedSoft = adminBadgeMuted;

/* Legacy aliases */
export const adminPageTitleIcon = "hidden";
export const adminCard = adminPanel;
