import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

/** CMS models added after initial dev-server boot — recreate client if stale. */
function isStalePrismaClient(client: PrismaClient) {
  return (
    typeof (client as PrismaClient & { gallery?: unknown }).gallery === "undefined" ||
    typeof (client as PrismaClient & { menu?: unknown }).menu === "undefined"
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
