/**
 * Applies pg_trgm extension and GIN indexes for article search.
 * Usage: pnpm db:search-indexes
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sqlPath = resolve(__dirname, "../prisma/sql/performance_indexes.sql");
  const sql = readFileSync(sqlPath, "utf8");

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      const runnable = statement.includes("CONCURRENTLY")
        ? statement.replace("CONCURRENTLY", "")
        : statement;
      console.log(`Running: ${runnable.slice(0, 60)}...`);
      await client.query(runnable);
    }

    console.log("Search indexes applied successfully.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Failed to apply search indexes:", error);
  process.exit(1);
});
