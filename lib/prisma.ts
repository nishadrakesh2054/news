import { PrismaClient } from "@prisma/client";

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

function createPrismaClient() {
  const connectionString = resolveDatabaseUrl();
  const log: Array<"warn" | "error"> =
    process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"];

  if (!connectionString) {
    return new PrismaClient({ log });
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
    tag?: { fields?: unknown };
  };
  // Recreate when newer schema fields are missing from a warm client.
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
