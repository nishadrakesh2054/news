import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { resolveDatabaseUrl } from "@/lib/db-url";

export { resolveDatabaseUrl };

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

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

  // Local `next dev`: use Prisma's TCP engine. Neon WebSockets throw ErrorEvent
  // here and break login (/admin → credentials 401 → bounce to home).
  // Vercel keeps the Neon WS adapter (works in serverless).
  const useNeonWs =
    Boolean(process.env.VERCEL) ||
    process.env.DATABASE_URL_USE_NEON_ADAPTER === "1" ||
    process.env.DATABASE_DRIVER === "neon-ws";

  if (isNeonUrl(connectionString) && useNeonWs) {
    if (typeof WebSocket === "undefined") {
      neonConfig.webSocketConstructor = ws;
    }
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
  };
  const tagDelegate = (client as unknown as { tag?: { findMany?: unknown } }).tag;
  return (
    typeof c.gallery === "undefined" ||
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
