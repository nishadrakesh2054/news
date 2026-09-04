import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Neon pooler + `channel_binding=require` often fails on serverless TCP. */
export function resolveDatabaseUrl(): string {
  let raw = process.env.DATABASE_URL?.trim() || "";
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    raw = raw.slice(1, -1).trim();
  }
  if (!raw) return "";
  try {
    const url = new URL(raw);
    url.searchParams.delete("channel_binding");
    if (!url.searchParams.has("sslmode")) {
      url.searchParams.set("sslmode", "require");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

function isNeonUrl(connectionString: string): boolean {
  return (
    connectionString.includes("neon.tech") ||
    connectionString.includes("neon.database") ||
    Boolean(process.env.DATABASE_URL_USE_NEON_ADAPTER === "1")
  );
}

function createPrismaClient() {
  const connectionString = resolveDatabaseUrl();
  const log: Array<"warn" | "error"> =
    process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"];

  if (!connectionString) {
    return new PrismaClient({ log });
  }

  if (isNeonUrl(connectionString)) {
    if (typeof WebSocket === "undefined") {
      neonConfig.webSocketConstructor = ws;
    }
    // PrismaNeon is a factory — pass PoolConfig, not a Pool instance
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({ adapter, log });
  }

  return new PrismaClient({
    log,
    datasources: { db: { url: connectionString } },
  });
}

/** CMS models added after initial dev-server boot — recreate client if stale. */
function isStalePrismaClient(client: PrismaClient) {
  const c = client as PrismaClient & {
    gallery?: unknown;
    menu?: unknown;
  };
  const tagDelegate = (client as unknown as { tag?: { findMany?: unknown } }).tag;
  return (
    typeof c.gallery === "undefined" ||
    typeof c.menu === "undefined" ||
    typeof tagDelegate?.findMany !== "function"
  );
}

function getPrismaClient() {
  const existing = globalForPrisma.prisma;

  if (existing && isStalePrismaClient(existing)) {
    void existing.$disconnect();
    globalForPrisma.prisma = undefined;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
