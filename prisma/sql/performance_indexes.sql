-- Search indexes for article title/excerpt (run after db push).
-- Usage: pnpm db:search-indexes

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS article_title_trgm_idx
  ON "Article" USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS article_title_np_trgm_idx
  ON "Article" USING gin ("titleNp" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS article_excerpt_trgm_idx
  ON "Article" USING gin (excerpt gin_trgm_ops);
