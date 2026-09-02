-- Run manually on PostgreSQL (Neon) after `npx prisma db push` or migrate.
-- Enables faster ILIKE / fuzzy search on article titles without loading full content.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY IF NOT EXISTS article_title_trgm_idx
  ON "Article" USING gin (title gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS article_title_np_trgm_idx
  ON "Article" USING gin ("titleNp" gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS article_excerpt_trgm_idx
  ON "Article" USING gin (excerpt gin_trgm_ops);
