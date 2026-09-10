import { NotificationStatus, NotificationType } from "@prisma/client";

export type NotificationCreateInput = {
  title: string;
  titleNp?: string;
  body: string;
  type: NotificationType;
  status: NotificationStatus;
  linkUrl?: string;
  sendPush: boolean;
  sendEmail: boolean;
};

export function validateNotificationCreate(body: unknown):
  | { ok: true; data: NotificationCreateInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const input = body as Record<string, unknown>;
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const bodyText = typeof input.body === "string" ? input.body.trim() : "";

  if (!title) return { ok: false, error: "Title is required" };
  if (!bodyText) return { ok: false, error: "Body is required" };

  const type =
    typeof input.type === "string" && Object.values(NotificationType).includes(input.type as NotificationType)
      ? (input.type as NotificationType)
      : NotificationType.SYSTEM;

  const status =
    typeof input.status === "string" &&
    Object.values(NotificationStatus).includes(input.status as NotificationStatus)
      ? (input.status as NotificationStatus)
      : NotificationStatus.DRAFT;

  return {
    ok: true,
    data: {
      title,
      titleNp: typeof input.titleNp === "string" ? input.titleNp.trim() : undefined,
      body: bodyText,
      type,
      status,
      linkUrl: typeof input.linkUrl === "string" ? input.linkUrl.trim() : undefined,
      sendPush: input.sendPush !== false,
      sendEmail: input.sendEmail === true,
    },
  };
}
