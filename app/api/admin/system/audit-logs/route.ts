import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { requirePermission } from "@/lib/admin-auth";
import {
  AUDIT_LOG_RETENTION_DAYS,
  maybePurgeOldAuditLogs,
} from "@/lib/audit-log";

export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission("audit.read");
    if (auth.error) return auth.error;

    // Best-effort: drop logs older than 30 days (throttled to ~hourly).
    void maybePurgeOldAuditLogs();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "25", 10) || 25)
    );
    const search = searchParams.get("search")?.trim() || "";
    const entity = searchParams.get("entity")?.trim() || "";

    const where: Prisma.AuditLogWhereInput = {};
    if (entity && entity !== "ALL") {
      where.entity = entity;
    }
    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { entity: { contains: search, mode: "insensitive" } },
        { details: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [total, logs, entityGroups] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.auditLog.groupBy({
        by: ["entity"],
        orderBy: { entity: "asc" },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return apiSuccess({
      logs,
      entities: entityGroups.map((g) => g.entity),
      retentionDays: AUDIT_LOG_RETENTION_DAYS,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    return handleServerError(error, "Failed to fetch audit logs");
  }
}
