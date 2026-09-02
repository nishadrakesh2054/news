"use client";

import { Fragment, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plus, Search, Trash2, X } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminStatsStrip } from "@/components/admin/content";
import {
  adminBadge,
  adminBadgeMuted,
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminPanel,
  adminTable,
  adminTableCell,
  adminTableHead,
  adminTableHeadCell,
  adminTableRow,
  adminToolbarRow,
  adminToolbarSearch,
  adminToolbarSelectStatus,
} from "@/constants/admin-layout";

interface PollOption {
  id: string;
  optionNp: string;
  votes: number;
}

interface PollItem {
  id: string;
  questionNp: string;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  options: PollOption[];
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "CLOSED", label: "Closed" },
  { value: "ARCHIVED", label: "Archived" },
];

function emptyOptions() {
  return ["हो", "होइन"];
}

export default function AdminPollsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [questionNp, setQuestionNp] = useState("");
  const [options, setOptions] = useState<string[]>(emptyOptions);
  const [expiresAt, setExpiresAt] = useState("");

  const { data: polls = [], isLoading, isError, refetch, isFetching } = useQuery<PollItem[]>({
    queryKey: ["admin-polls"],
    queryFn: async () => {
      const res = await fetch("/api/admin/polls?limit=50");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load polls");
      return json.data?.polls ?? json.data;
    },
  });

  const openCreateModal = () => {
    setQuestionNp("");
    setOptions(emptyOptions());
    setExpiresAt("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const createMutation = useMutation({
    mutationFn: async (payload: { questionNp: string; options: string[]; expiresAt?: string }) => {
      const res = await fetch("/api/admin/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionNp: payload.questionNp,
          options: payload.options,
          expiresAt: payload.expiresAt || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to create poll");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Poll published — previous active poll closed");
      setQuestionNp("");
      setOptions(emptyOptions());
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["admin-polls"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const pollActionMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      action,
    }: {
      id: string;
      status?: string;
      action: "patch" | "delete";
    }) => {
      const res = await fetch(`/api/admin/polls/${id}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: action === "patch" ? JSON.stringify({ status }) : undefined,
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Action failed");
    },
    onSuccess: () => {
      toast.success("Poll updated");
      queryClient.invalidateQueries({ queryKey: ["admin-polls"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = useMemo(() => {
    return polls.filter((poll) => {
      const matchesStatus = statusFilter === "ALL" || poll.status === statusFilter;
      const matchesSearch =
        !search.trim() || poll.questionNp.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [polls, statusFilter, search]);

  const activePoll = polls.find((p) => p.status === "ACTIVE");
  const totalVotes = polls.reduce(
    (sum, p) => sum + p.options.reduce((s, o) => s + o.votes, 0),
    0
  );
  const isFiltered = statusFilter !== "ALL" || search.trim() !== "";

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!questionNp.trim()) {
      toast.error("Question is required");
      return;
    }
    if (cleanOptions.length < 2) {
      toast.error("At least 2 options are required");
      return;
    }
    createMutation.mutate({
      questionNp: questionNp.trim(),
      options: cleanOptions,
      expiresAt: expiresAt || undefined,
    });
  };

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  };

  const addOption = () => {
    setOptions((prev) => (prev.length >= 6 ? prev : [...prev, ""]));
  };

  const removeOption = (index: number) => {
    setOptions((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== index)));
  };

  const getVoteTotal = (poll: PollItem) =>
    poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  const getLeadingOption = (poll: PollItem) => {
    if (poll.options.length === 0) return "—";
    const top = [...poll.options].sort((a, b) => b.votes - a.votes)[0];
    return top.optionNp;
  };

  return (
    <AdminPageShell
      title="Opinion polls"
      description="Publish one active poll at a time and track reader votes"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <button type="button" onClick={openCreateModal} className={adminBtnPrimary}>
          <Plus className="h-3.5 w-3.5" />
          New poll
        </button>
      }
    >
      <AdminStatsStrip
        stats={[
          { label: "Total polls", value: polls.length },
          { label: "Active now", value: activePoll ? "1" : "0" },
          { label: "Total votes", value: totalVotes },
          { label: "Showing", value: filtered.length },
        ]}
      />

      {activePoll ? (
        <div className={`${adminPanel} px-3 py-2.5`}>
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Current active poll
          </p>
          <p className="mt-0.5 text-sm font-medium text-foreground">{activePoll.questionNp}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {getVoteTotal(activePoll)} votes
            {activePoll.expiresAt
              ? ` · Expires ${new Date(activePoll.expiresAt).toLocaleString()}`
              : ""}
            {" · "}Publishing a new poll will close this one
          </p>
        </div>
      ) : null}

      <div className={adminToolbarRow}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={adminToolbarSelectStatus}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className={adminToolbarSearch}>
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search poll question…"
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

        {isFiltered ? (
          <button
            type="button"
            onClick={() => {
              setStatusFilter("ALL");
              setSearch("");
            }}
            className="inline-flex h-8 shrink-0 items-center px-2 text-xs font-medium text-[#C3272E] hover:underline"
          >
            Reset
          </button>
        ) : null}
      </div>

      <div className={adminPanel}>
        {isLoading ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading polls…</p>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load polls.</p>
        ) : filtered.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">
            {isFiltered ? "No polls match your filters." : "No polls yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={adminTable}>
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTableHeadCell}>Question</th>
                  <th className={adminTableHeadCell}>Status</th>
                  <th className={adminTableHeadCell}>Options</th>
                  <th className={adminTableHeadCell}>Votes</th>
                  <th className={adminTableHeadCell}>Leading</th>
                  <th className={adminTableHeadCell}>Created</th>
                  <th className={adminTableHeadCell}>Expires</th>
                  <th className={`${adminTableHeadCell} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((poll) => {
                  const votes = getVoteTotal(poll);
                  const isExpanded = expandedId === poll.id;
                  const isActive = poll.status === "ACTIVE";

                  return (
                    <Fragment key={poll.id}>
                      <tr className={adminTableRow}>
                        <td className={`${adminTableCell} max-w-md`}>
                          <p className="line-clamp-2 font-medium text-foreground">{poll.questionNp}</p>
                        </td>
                        <td className={adminTableCell}>
                          {isActive ? (
                            <span className={adminBadge}>Active</span>
                          ) : (
                            <span className={adminBadgeMuted}>{poll.status}</span>
                          )}
                        </td>
                        <td className={`${adminTableCell} text-muted-foreground`}>
                          {poll.options.length}
                        </td>
                        <td className={`${adminTableCell} font-mono tabular-nums`}>{votes}</td>
                        <td className={`${adminTableCell} max-w-[140px] truncate text-muted-foreground`}>
                          {getLeadingOption(poll)}
                        </td>
                        <td className={`${adminTableCell} whitespace-nowrap text-muted-foreground`}>
                          {new Date(poll.createdAt).toLocaleDateString()}
                        </td>
                        <td className={`${adminTableCell} whitespace-nowrap font-mono text-[11px] text-muted-foreground`}>
                          {poll.expiresAt ? new Date(poll.expiresAt).toLocaleString() : "—"}
                        </td>
                        <td className={`${adminTableCell} text-right`}>
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setExpandedId(isExpanded ? null : poll.id)}
                              className={adminBtnGhost}
                              title="Results"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </button>
                            {poll.status === "ACTIVE" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  pollActionMutation.mutate({ id: poll.id, status: "CLOSED", action: "patch" })
                                }
                                className={adminBtnGhost}
                                title="Close poll"
                              >
                                Close
                              </button>
                            ) : poll.status === "CLOSED" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  pollActionMutation.mutate({ id: poll.id, status: "ARCHIVED", action: "patch" })
                                }
                                className={adminBtnGhost}
                                title="Archive"
                              >
                                Archive
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Delete this poll permanently?")) {
                                  pollActionMutation.mutate({ id: poll.id, action: "delete" });
                                }
                              }}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-[#C3272E] hover:bg-muted"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded ? (
                        <tr className="bg-muted/20">
                          <td colSpan={8} className="px-3 py-3">
                            <div className="max-w-2xl space-y-2">
                              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                Vote breakdown
                              </p>
                              {poll.options.map((opt) => {
                                const percent = votes > 0 ? Math.round((opt.votes / votes) * 100) : 0;
                                return (
                                  <div key={opt.id}>
                                    <div className="flex justify-between text-[11px]">
                                      <span className="text-foreground">{opt.optionNp}</span>
                                      <span className="font-mono text-muted-foreground">
                                        {opt.votes} ({percent}%)
                                      </span>
                                    </div>
                                    <div className="mt-0.5 h-1 border border-border bg-card">
                                      <div
                                        className="h-full bg-[#0C4EA0]"
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
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
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40">
          <div className="flex min-h-full items-start justify-center p-4 pb-6 pt-16">
            <div
              className={`${adminPanel} flex max-h-[calc(100vh-5rem)] w-full max-w-lg flex-col overflow-hidden`}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-border/70 px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">New poll</h2>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={createMutation.isPending}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <form id="poll-form" onSubmit={handleCreate} className="space-y-3">
                  <p className="rounded-sm border border-border/70 bg-muted/15 px-3 py-2 text-[10px] text-muted-foreground">
                    Publishing a new poll will close the current active poll.
                  </p>

                  <div className="space-y-1">
                    <label htmlFor="poll-question" className="text-xs font-medium text-foreground">
                      Question <span className="text-[#C3272E]">*</span>
                    </label>
                    <textarea
                      id="poll-question"
                      rows={2}
                      required
                      value={questionNp}
                      onChange={(e) => setQuestionNp(e.target.value)}
                      placeholder="Poll question…"
                      className={`${adminInput} min-h-16 w-full resize-y py-2`}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-foreground">
                        Answer options <span className="text-[#C3272E]">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={addOption}
                        disabled={options.length >= 6}
                        className="text-[11px] font-medium text-[#0C4EA0] hover:underline disabled:opacity-40"
                      >
                        + Add option
                      </button>
                    </div>
                    {options.map((opt, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-5 shrink-0 text-[11px] font-mono text-muted-foreground">
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          required={index < 2}
                          value={opt}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className={`${adminInput} w-full flex-1`}
                        />
                        {options.length > 2 ? (
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-[#C3272E] hover:bg-muted"
                            title="Remove option"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <span className="w-7 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="poll-expires" className="text-xs font-medium text-foreground">
                      Expires (optional)
                    </label>
                    <input
                      id="poll-expires"
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className={adminInput}
                    />
                  </div>
                </form>
              </div>

              <div className="flex shrink-0 justify-end gap-2 border-t border-border/70 px-4 py-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={createMutation.isPending}
                  className={adminBtnSecondary}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="poll-form"
                  disabled={createMutation.isPending}
                  className={adminBtnPrimary}
                >
                  {createMutation.isPending ? "Publishing…" : "Publish"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
