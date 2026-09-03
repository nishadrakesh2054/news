import { apiSuccess, apiError } from "@/lib/api-response";
import { MESSAGES } from "@/constants/messages";
import { prisma, resolveDatabaseUrl } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasDatabaseUrl = Boolean(resolveDatabaseUrl());
  let database = "not-configured";

  if (hasDatabaseUrl) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      database = "ok";
    } catch {
      database = "unreachable";
    }
  }

  const payload = {
    environment: process.env.NODE_ENV,
    vercel: Boolean(process.env.VERCEL),
    database,
    timestamp: new Date().toISOString(),
  };

  if (database === "unreachable") {
    return apiError("Database is unreachable. Check DATABASE_URL on Vercel and Neon.", 503);
  }

  if (database === "not-configured") {
    return apiError("DATABASE_URL is missing in this environment.", 503);
  }

  return apiSuccess(payload, MESSAGES.SYSTEM.HEALTH_OK);
}
