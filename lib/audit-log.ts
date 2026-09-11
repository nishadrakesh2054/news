import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const AUDIT_LOG_RETENTION_DAYS = 30;

type AuditParams = {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
};

/** Throttle cleanup so we don't run a delete on every request. */
let lastPurgeAt = 0;
const PURGE_INTERVAL_MS = 60 * 60 * 1000; // once per hour per process

export async function writeAuditLog(params: AuditParams) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details,
        ipAddress: params.ipAddress,
      },
    });
    void maybePurgeOldAuditLogs();
  } catch (error) {
    logger.error("Failed to write audit log", { error, ...params });
  }
}

/** Delete logs older than retention. Safe to call often (throttled). */
export async function maybePurgeOldAuditLogs(force = false): Promise<number> {
  const now = Date.now();
  if (!force && now - lastPurgeAt < PURGE_INTERVAL_MS) {
    return 0;
  }
  lastPurgeAt = now;

  try {
    const cutoff = new Date(now - AUDIT_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const result = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    if (result.count > 0) {
      logger.info("Purged old audit logs", {
        deleted: result.count,
        olderThanDays: AUDIT_LOG_RETENTION_DAYS,
      });
    }
    return result.count;
  } catch (error) {
    logger.error("Failed to purge audit logs", { error });
    return 0;
  }
}
