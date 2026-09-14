-- Search indexes for article title/excerpt (run after db push).
-- Usage: pnpm db:search-indexes

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS article_title_trgm_idx
  ON "Article" USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS article_title_np_trgm_idx
  ON "Article" USING gin ("titleNp" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS article_excerpt_trgm_idx
  ON "Article" USING gin (excerpt gin_trgm_ops);

-- List/archive query shapes used by related, category, and province pages.
CREATE INDEX IF NOT EXISTS "Article_status_categoryId_publishedAt_idx"
  ON "Article" (status, "categoryId", "publishedAt" DESC);

CREATE INDEX IF NOT EXISTS "Article_status_province_publishedAt_idx"
  ON "Article" (status, province, "publishedAt" DESC);
