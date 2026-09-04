"use client";

import { Fragment, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, RotateCcw, Save, Search, X } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminStatsStrip } from "@/components/admin/content";
import {
  DEFAULT_DETAILED_RASHIFAL,
  normalizeRashifalList,
  RASHIFAL_PERIODS,
  type DetailedRashi,
  type PeriodForecast,
  type RashifalPeriodKey,
} from "@/lib/rashifal";
import {
  adminBadgeMuted,
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminPanel,
  adminPanelHeader,
  adminPanelTitle,
  adminTable,
  adminTableCell,
  adminTableHead,
  adminTableHeadCell,
  adminTableRow,
  adminToolbarRow,
  adminToolbarSearch,
} from "@/constants/admin-layout";

interface ForexItem {
  code: string;
  nameNp: string;
  unit: number;
  buy: string;
  sell: string;
}

type UtilitySection = "gold" | "rashifal" | "forex";

const SECTION_OPTIONS: { value: UtilitySection; label: string }[] = [
  { value: "gold", label: "Gold & silver" },
  { value: "rashifal", label: "Horoscope" },
  { value: "forex", label: "Forex (NRB)" },
];

const GOLD_ROWS = [
  { key: "fine" as const, label: "Fine gold (24K)" },
  { key: "tejabi" as const, label: "Tejabi gold (22K)" },
  { key: "silver" as const, label: "Silver" },
];

export default function AdminUtilitiesPage() {
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["admin-utilities-data"],
    queryFn: async () => {
      const res = await fetch("/api/utilities");
      const json = await res.json();
      if (!json.success || !json.data) throw new Error("Failed to load utilities");
      return json.data as {
        gold?: { fine?: string; tejabi?: string; silver?: string };
        rashifal?: DetailedRashi[];
        allForexRates?: ForexItem[];
      };
    },
    staleTime: 60_000,
  });

  if (!data) {
    return (
      <AdminPageShell title="Market & Horoscope" description="Gold, forex, and rashifal rates">
        <p className="text-xs text-muted-foreground">Loading utilities…</p>
      </AdminPageShell>
    );
  }

  const dataKey = `${data.gold?.fine ?? ""}-${data.gold?.tejabi ?? ""}-${data.rashifal?.length ?? 0}-${data.allForexRates?.length ?? 0}`;

  return (
    <UtilitiesEditor
      key={dataKey}
      data={data}
      isFetching={isFetching}
      refetch={refetch}
    />
  );
}

function UtilitiesEditor({
  data,
  isFetching,
  refetch,
}: {
  data: {
    gold?: { fine?: string; tejabi?: string; silver?: string };
    rashifal?: DetailedRashi[];
    allForexRates?: ForexItem[];
  };
  isFetching: boolean;
  refetch: () => void;
}) {
  const [section, setSection] = useState<UtilitySection>("gold");
  const [search, setSearch] = useState("");
  const [expandedRashi, setExpandedRashi] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [goldFine, setGoldFine] = useState(data.gold?.fine ?? "1,60,500");
  const [goldTejabi, setGoldTejabi] = useState(data.gold?.tejabi ?? "1,59,800");
  const [silver, setSilver] = useState(data.gold?.silver ?? "1,950");
  const [rashifal, setRashifal] = useState<DetailedRashi[]>(() =>
    normalizeRashifalList(data.rashifal)
  );
  const [editPeriod, setEditPeriod] = useState<RashifalPeriodKey>("today");
  const forexData = useMemo(() => data.allForexRates ?? [], [data.allForexRates]);

  const goldValues = { fine: goldFine, tejabi: goldTejabi, silver };

  const setGoldValue = (key: "fine" | "tejabi" | "silver", value: string) => {
    if (key === "fine") setGoldFine(value);
    if (key === "tejabi") setGoldTejabi(value);
    if (key === "silver") setSilver(value);
  };

  const handleRashiChange = (index: number, field: keyof DetailedRashi, val: string | number) => {
    setRashifal((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handlePeriodFieldChange = (
    index: number,
    period: RashifalPeriodKey,
    field: keyof PeriodForecast,
    val: string
  ) => {
    setRashifal((prev) => {
      const updated = [...prev];
      const current = updated[index];
      const nextPeriod = {
        ...(current.periods?.[period] || {
          overview: "",
          health: "",
          business: "",
          love: "",
          remedy: "",
        }),
        [field]: val,
      };
      const periods = {
        ...current.periods,
        [period]: nextPeriod,
      };
      updated[index] = {
        ...current,
        periods,
        ...(period === "today"
          ? {
              overview: nextPeriod.overview,
              health: nextPeriod.health,
              business: nextPeriod.business,
              love: nextPeriod.love,
              remedy: nextPeriod.remedy,
            }
          : {}),
      };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/utilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goldFine, goldTejabi, silver, rashifal }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to save");
      toast.success(json.message || "Saved successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const filteredRashifal = useMemo(() => {
    if (!search.trim()) return rashifal.map((r, index) => ({ r, index }));
    const term = search.toLowerCase();
    return rashifal
      .map((r, index) => ({ r, index }))
      .filter(
        ({ r }) =>
          r.name.toLowerCase().includes(term) ||
          r.enName.toLowerCase().includes(term)
      );
  }, [rashifal, search]);

  const filteredForex = useMemo(() => {
    if (!search.trim()) return forexData;
    const term = search.toLowerCase();
    return forexData.filter(
      (f) => f.code.toLowerCase().includes(term) || f.nameNp.toLowerCase().includes(term)
    );
  }, [forexData, search]);

  const searchPlaceholder =
    section === "rashifal"
      ? "Search rashi…"
      : section === "forex"
        ? "Search currency…"
        : "Search metal…";

  const showSearch = section !== "gold";
  const canSave = section !== "forex";

  return (
    <AdminPageShell
      title="Market & horoscope"
      description="Manage gold rates, period rashifal (today / week / month / year), and NRB forex"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        canSave ? (
          <button type="button" onClick={handleSave} disabled={saving} className={adminBtnPrimary}>
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save changes"}
          </button>
        ) : undefined
      }
    >
      <AdminStatsStrip
        stats={[
          { label: "Fine gold", value: goldFine },
          { label: "Tejabi gold", value: goldTejabi },
          { label: "Rashis", value: rashifal.length },
          { label: "Forex pairs", value: forexData.length || "—" },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        {SECTION_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              setSection(option.value);
              setSearch("");
              setExpandedRashi(null);
            }}
            className={
              section === option.value
                ? adminBtnPrimary
                : adminBtnSecondary
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      {section !== "gold" ? (
        <div className={adminToolbarRow}>
          {showSearch ? (
            <div className={adminToolbarSearch}>
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${adminInput} w-full pl-7 pr-7`}
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          ) : null}

          {section === "rashifal" ? (
            <button
              type="button"
              onClick={() => setRashifal(DEFAULT_DETAILED_RASHIFAL)}
              className={`${adminBtnSecondary} ${showSearch ? "" : "ml-auto"} shrink-0`}
            >
              <RotateCcw className="h-3 w-3" />
              Reset all
            </button>
          ) : null}

          {section === "forex" ? (
            <span className={`${adminBadgeMuted} ml-auto shrink-0`}>Read-only · NRB sync</span>
          ) : null}
        </div>
      ) : null}

      {section === "gold" && (
        <section className={adminPanel}>
          <div className={adminPanelHeader}>
            <h2 className={adminPanelTitle}>Metal rates (per tola, Rs.)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className={adminTable}>
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTableHeadCell}>Metal</th>
                  <th className={adminTableHeadCell}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {GOLD_ROWS.map((row) => (
                  <tr key={row.key} className={adminTableRow}>
                    <td className={`${adminTableCell} font-medium text-foreground`}>{row.label}</td>
                    <td className={adminTableCell}>
                      <input
                        type="text"
                        value={goldValues[row.key]}
                        onChange={(e) => setGoldValue(row.key, e.target.value)}
                        className={`${adminInput} max-w-xs`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {section === "rashifal" && (
        <section className={adminPanel}>
          <div className={adminPanelHeader}>
            <h2 className={adminPanelTitle}>Horoscope — 12 rashis × 4 periods</h2>
            <span className="text-[11px] text-muted-foreground">
              Expand a row · switch Today / Weekly / Monthly / Yearly
            </span>
          </div>

          {filteredRashifal.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">No rashis match search.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className={adminTable}>
                <thead className={adminTableHead}>
                  <tr>
                    <th className={adminTableHeadCell}>#</th>
                    <th className={adminTableHeadCell}>Rashi</th>
                    <th className={adminTableHeadCell}>Luck %</th>
                    <th className={adminTableHeadCell}>Lucky no.</th>
                    <th className={adminTableHeadCell}>Overview</th>
                    <th className={`${adminTableHeadCell} text-right`}>Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRashifal.map(({ r, index }) => {
                    const isExpanded = expandedRashi === index;
                    return (
                      <Fragment key={`${r.name}-${index}`}>
                        <tr className={adminTableRow}>
                          <td className={`${adminTableCell} font-mono text-muted-foreground`}>
                            {index + 1}
                          </td>
                          <td className={adminTableCell}>
                            <span className="font-medium text-foreground">
                              {r.symbol} {r.name}
                            </span>
                            <span className="ml-1 text-[11px] text-muted-foreground">({r.enName})</span>
                          </td>
                          <td className={`${adminTableCell} font-mono`}>{r.luckyPercent ?? "—"}</td>
                          <td className={`${adminTableCell} font-mono text-muted-foreground`}>
                            {r.luckyNumber || "—"}
                          </td>
                          <td className={`${adminTableCell} max-w-xs truncate text-muted-foreground`}>
                            {r.periods?.today?.overview || r.overview}
                          </td>
                          <td className={`${adminTableCell} text-right`}>
                            <button
                              type="button"
                              onClick={() => setExpandedRashi(isExpanded ? null : index)}
                              className={adminBtnGhost}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </td>
                        </tr>
                        {isExpanded ? (
                          <tr className="bg-muted/20">
                            <td colSpan={6} className="px-3 py-3">
                              <div className="grid max-w-3xl gap-3">
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-medium text-muted-foreground">
                                      Lucky number
                                    </label>
                                    <input
                                      type="text"
                                      value={r.luckyNumber || ""}
                                      onChange={(e) =>
                                        handleRashiChange(index, "luckyNumber", e.target.value)
                                      }
                                      className={adminInput}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-medium text-muted-foreground">
                                      Lucky color
                                    </label>
                                    <input
                                      type="text"
                                      value={r.luckyColor || ""}
                                      onChange={(e) =>
                                        handleRashiChange(index, "luckyColor", e.target.value)
                                      }
                                      className={adminInput}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-medium text-muted-foreground">
                                      Direction
                                    </label>
                                    <input
                                      type="text"
                                      value={r.luckyDirection || ""}
                                      onChange={(e) =>
                                        handleRashiChange(index, "luckyDirection", e.target.value)
                                      }
                                      className={adminInput}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-medium text-muted-foreground">
                                      Luck %
                                    </label>
                                    <input
                                      type="number"
                                      value={r.luckyPercent ?? 0}
                                      onChange={(e) =>
                                        handleRashiChange(
                                          index,
                                          "luckyPercent",
                                          Number(e.target.value)
                                        )
                                      }
                                      className={adminInput}
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                  {RASHIFAL_PERIODS.map((p) => (
                                    <button
                                      key={p.key}
                                      type="button"
                                      onClick={() => setEditPeriod(p.key)}
                                      className={
                                        editPeriod === p.key ? adminBtnPrimary : adminBtnSecondary
                                      }
                                    >
                                      {p.labelEn}
                                    </button>
                                  ))}
                                </div>

                                {(
                                  [
                                    ["overview", "Overview", 3],
                                    ["health", "Health", 2],
                                    ["business", "Business", 2],
                                    ["love", "Love", 2],
                                    ["remedy", "Remedy", 2],
                                  ] as const
                                ).map(([field, label, rows]) => (
                                  <div key={`${editPeriod}-${field}`} className="space-y-1">
                                    <label className="text-xs font-medium text-foreground">
                                      {label}{" "}
                                      <span className="font-normal text-muted-foreground">
                                        (
                                        {
                                          RASHIFAL_PERIODS.find((p) => p.key === editPeriod)
                                            ?.labelEn
                                        }
                                        )
                                      </span>
                                    </label>
                                    <textarea
                                      rows={rows}
                                      value={r.periods?.[editPeriod]?.[field] || ""}
                                      onChange={(e) =>
                                        handlePeriodFieldChange(
                                          index,
                                          editPeriod,
                                          field,
                                          e.target.value
                                        )
                                      }
                                      className={`${adminInput} h-auto py-2`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {section === "forex" && (
        <section className={adminPanel}>
          <div className={adminPanelHeader}>
            <h2 className={adminPanelTitle}>NRB exchange rates</h2>
            <span className="text-[11px] text-muted-foreground">
              Showing {filteredForex.length} of {forexData.length}
            </span>
          </div>
          {forexData.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading forex rates…</p>
          ) : filteredForex.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">No currencies match search.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className={adminTable}>
                <thead className={adminTableHead}>
                  <tr>
                    <th className={adminTableHeadCell}>Code</th>
                    <th className={adminTableHeadCell}>Currency</th>
                    <th className={adminTableHeadCell}>Unit</th>
                    <th className={adminTableHeadCell}>Buy (Rs.)</th>
                    <th className={`${adminTableHeadCell} text-right`}>Sell (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForex.map((f, idx) => (
                    <tr key={f.code ? `${f.code}-${idx}` : `forex-${idx}`} className={adminTableRow}>
                      <td className={`${adminTableCell} font-mono font-medium`}>{f.code}</td>
                      <td className={adminTableCell}>{f.nameNp}</td>
                      <td className={`${adminTableCell} font-mono text-muted-foreground`}>{f.unit}</td>
                      <td className={`${adminTableCell} font-mono`}>{f.buy}</td>
                      <td className={`${adminTableCell} text-right font-mono`}>{f.sell}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </AdminPageShell>
  );
}
