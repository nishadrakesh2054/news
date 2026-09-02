"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Search, Send } from "lucide-react";
import { NotificationStatus, NotificationType } from "@prisma/client";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminStatsStrip } from "@/components/admin/content";
import {
  adminBadgeMuted,
  adminBadgeSuccess,
  adminBadgeWarning,
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminPanel,
  adminSelect,
  adminTable,
  adminTableCell,
  adminTableHead,
  adminTableHeadCell,
  adminTableRow,
  adminToolbarRow,
  adminToolbarSearch,
  adminToolbarSelectMd,
  adminToolbarSelectStatus,
} from "@/constants/admin-layout";

interface NotificationItem {
  id: string;
  title: string;
  titleNp: string | null;
  body: string;
  type: NotificationType;
  status: NotificationStatus;
  linkUrl: string | null;
  scheduledAt: string | null;
  sendPush: boolean;
  sendEmail: boolean;
  pushDelivered: number;
  emailDelivered: number;
  sentAt: string | null;
  createdAt: string;
}

const TYPE_LABELS: Record<NotificationType, string> = {
  BREAKING: "Breaking",
  ARTICLE: "Article",
  SYSTEM: "System",
  PROMO: "Promo",
};

const STATUS_LABELS: Record<NotificationStatus, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  SENT: "Sent",
};

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<NotificationItem | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [title, setTitle] = useState("");
  const [titleNp, setTitleNp] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<NotificationType>(NotificationType.SYSTEM);
  const [status, setStatus] = useState<NotificationStatus>(NotificationStatus.DRAFT);
  const [linkUrl, setLinkUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [sendPush, setSendPush] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);

  const { data: notifications = [], isLoading, isError, refetch, isFetching } = useQuery<
    NotificationItem[]
  >({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const res = await fetch("/api/admin/notifications?limit=50");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch notifications");
      return json.data?.notifications ?? json.data;
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/notifications/${id}/send`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Notification sent");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: {
      title: string;
      titleNp?: string;
      body: string;
      type: NotificationType;
      status: NotificationStatus;
      linkUrl?: string;
      scheduledAt?: string;
      sendPush: boolean;
      sendEmail: boolean;
    }) => {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create notification");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Notification created");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      closeModal();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        title: string;
        body: string;
        status: NotificationStatus;
        linkUrl?: string;
        scheduledAt?: string | null;
        sendPush?: boolean;
        sendEmail?: boolean;
      };
    }) => {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update notification");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Notification updated");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      closeModal();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/notifications/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete notification");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Notification deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openCreateModal = () => {
    setEditingNotification(null);
    setTitle("");
    setTitleNp("");
    setBody("");
    setType(NotificationType.SYSTEM);
    setStatus(NotificationStatus.DRAFT);
    setLinkUrl("");
    setScheduledAt("");
    setSendPush(true);
    setSendEmail(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: NotificationItem) => {
    setEditingNotification(item);
    setTitle(item.title);
    setTitleNp(item.titleNp || "");
    setBody(item.body);
    setType(item.type);
    setStatus(item.status);
    setLinkUrl(item.linkUrl || "");
    setScheduledAt(item.scheduledAt ? item.scheduledAt.slice(0, 16) : "");
    setSendPush(item.sendPush);
    setSendEmail(item.sendEmail);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNotification(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and message body are required");
      return;
    }

    if (editingNotification) {
      updateMutation.mutate({
        id: editingNotification.id,
        payload: {
          title: title.trim(),
          body: body.trim(),
          status,
          linkUrl: linkUrl.trim() || undefined,
          scheduledAt: scheduledAt || undefined,
          sendPush,
          sendEmail,
        },
      });
    } else {
      createMutation.mutate({
        title: title.trim(),
        titleNp: titleNp.trim() || undefined,
        body: body.trim(),
        type,
        status,
        linkUrl: linkUrl.trim() || undefined,
        scheduledAt: scheduledAt || undefined,
        sendPush,
        sendEmail,
      });
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      const term = search.toLowerCase();
      const matchesSearch =
        search.trim() === "" ||
        item.title.toLowerCase().includes(term) ||
        (item.titleNp && item.titleNp.includes(search)) ||
        item.body.toLowerCase().includes(term);
      const matchesType = typeFilter === "ALL" || item.type === typeFilter;
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [notifications, search, typeFilter, statusFilter]);

  const draftCount = notifications.filter((n) => n.status === NotificationStatus.DRAFT).length;
  const sentCount = notifications.filter((n) => n.status === NotificationStatus.SENT).length;
  const scheduledCount = notifications.filter((n) => n.status === NotificationStatus.SCHEDULED).length;
  const isFiltered = search.trim() !== "" || typeFilter !== "ALL" || statusFilter !== "ALL";

  const statusBadge = (value: NotificationStatus) => {
    if (value === NotificationStatus.SENT) return adminBadgeSuccess;
    if (value === NotificationStatus.SCHEDULED) return adminBadgeWarning;
    return adminBadgeMuted;
  };

  return (
    <AdminPageShell
      title="Notifications"
      description="Push alerts and newsroom notifications"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <button type="button" onClick={openCreateModal} className={adminBtnPrimary}>
          <Plus className="h-3.5 w-3.5" />
          New notification
        </button>
      }
    >
      <AdminStatsStrip
        stats={[
          { label: "Total", value: notifications.length },
          { label: "Draft", value: draftCount },
          { label: "Scheduled", value: scheduledCount },
          { label: "Sent", value: sentCount },
        ]}
      />

      <div className={adminToolbarRow}>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={adminToolbarSelectMd}
        >
          <option value="ALL">All types</option>
          <option value="BREAKING">Breaking</option>
          <option value="ARTICLE">Article</option>
          <option value="SYSTEM">System</option>
          <option value="PROMO">Promo</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={adminToolbarSelectStatus}
        >
          <option value="ALL">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="SENT">Sent</option>
        </select>

        <div className={adminToolbarSearch}>
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search title or message…"
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
              setSearch("");
              setTypeFilter("ALL");
              setStatusFilter("ALL");
            }}
            className="inline-flex h-8 shrink-0 items-center px-2 text-xs font-medium text-[#C3272E] hover:underline"
          >
            Reset
          </button>
        ) : null}
      </div>

      <div className={adminPanel}>
        {isLoading ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading notifications…</p>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load notifications.</p>
        ) : filteredNotifications.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">
            {isFiltered ? "No notifications match your filters." : "No notifications yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className={adminTable}>
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTableHeadCell}>Title</th>
                  <th className={adminTableHeadCell}>Type</th>
                  <th className={adminTableHeadCell}>Status</th>
                  <th className={adminTableHeadCell}>Delivery</th>
                  <th className={adminTableHeadCell}>Created</th>
                  <th className={`${adminTableHeadCell} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.map((item) => (
                  <tr key={item.id} className={adminTableRow}>
                    <td className={`${adminTableCell} max-w-xs`}>
                      <p className="truncate font-medium text-foreground">{item.title}</p>
                      {item.titleNp ? (
                        <p className="truncate text-[11px] text-muted-foreground">{item.titleNp}</p>
                      ) : null}
                    </td>
                    <td className={adminTableCell}>
                      <span className={adminBadgeMuted}>{TYPE_LABELS[item.type]}</span>
                    </td>
                    <td className={adminTableCell}>
                      <span className={statusBadge(item.status)}>{STATUS_LABELS[item.status]}</span>
                    </td>
                    <td className={`${adminTableCell} font-mono text-[11px] text-muted-foreground`}>
                      {item.status === "SENT"
                        ? `${item.pushDelivered} push / ${item.emailDelivered} email`
                        : item.scheduledAt
                          ? new Date(item.scheduledAt).toLocaleString()
                          : "—"}
                    </td>
                    <td className={`${adminTableCell} text-muted-foreground`}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className={`${adminTableCell} text-right`}>
                      <div className="inline-flex items-center">
                        {item.status !== "SENT" ? (
                          <button
                            type="button"
                            onClick={() => sendMutation.mutate(item.id)}
                            disabled={sendMutation.isPending}
                            className={adminBtnGhost}
                            title="Send now"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className={adminBtnGhost}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (confirm(`Delete notification "${item.title}"?`)) {
                              deleteMutation.mutate(item.id);
                            }
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-[#C3272E] hover:bg-muted disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                <h2 className="text-sm font-semibold text-foreground">
                  {editingNotification ? "Edit notification" : "New notification"}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                <form id="notification-form" onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label htmlFor="notif-title-np" className="text-xs font-medium text-foreground">
                        Nepali title
                      </label>
                      <input
                        id="notif-title-np"
                        type="text"
                        placeholder="सूचना शीर्षक…"
                        value={titleNp}
                        onChange={(e) => setTitleNp(e.target.value)}
                        disabled={!!editingNotification}
                        className={`${adminInput} w-full disabled:opacity-60`}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="notif-title" className="text-xs font-medium text-foreground">
                        English title <span className="text-[#C3272E]">*</span>
                      </label>
                      <input
                        id="notif-title"
                        type="text"
                        required
                        placeholder="Notification title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`${adminInput} w-full`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label htmlFor="notif-type" className="text-xs font-medium text-foreground">
                        Type
                      </label>
                      <select
                        id="notif-type"
                        value={type}
                        onChange={(e) => setType(e.target.value as NotificationType)}
                        disabled={!!editingNotification}
                        className={`${adminSelect} w-full disabled:opacity-60`}
                      >
                        <option value="BREAKING">Breaking</option>
                        <option value="ARTICLE">Article</option>
                        <option value="SYSTEM">System</option>
                        <option value="PROMO">Promo</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="notif-status" className="text-xs font-medium text-foreground">
                        Status
                      </label>
                      <select
                        id="notif-status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as NotificationStatus)}
                        className={`${adminSelect} w-full`}
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="SENT">Sent</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="notif-body" className="text-xs font-medium text-foreground">
                      Message <span className="text-[#C3272E]">*</span>
                    </label>
                    <textarea
                      id="notif-body"
                      rows={3}
                      required
                      placeholder="Notification message…"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className={`${adminInput} min-h-20 w-full resize-y py-2`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="notif-scheduled" className="text-xs font-medium text-foreground">
                      Schedule send (optional)
                    </label>
                    <input
                      id="notif-scheduled"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className={adminInput}
                    />
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-xs text-foreground">
                      <input
                        type="checkbox"
                        checked={sendPush}
                        onChange={(e) => setSendPush(e.target.checked)}
                      />
                      Send web push
                    </label>
                    <label className="flex items-center gap-2 text-xs text-foreground">
                      <input
                        type="checkbox"
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                      />
                      Send email to newsletter
                    </label>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="notif-link" className="text-xs font-medium text-foreground">
                      Link URL
                    </label>
                    <input
                      id="notif-link"
                      type="url"
                      placeholder="https://…"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      className={`${adminInput} w-full font-mono`}
                    />
                  </div>
                </form>
              </div>

              <div className="flex shrink-0 justify-end gap-2 border-t border-border/70 px-4 py-3">
                <button type="button" onClick={closeModal} className={adminBtnSecondary}>
                  Cancel
                </button>
                <button
                  type="submit"
                  form="notification-form"
                  className={adminBtnPrimary}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingNotification ? "Save" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
