-- Additive schema fixes from full-website audit (safe; no drops).
-- Usage: prisma db execute --file prisma/sql/audit_hardening.sql --schema prisma/schema

-- Newsletter double opt-in
DO $$ BEGIN
  ALTER TYPE "SubscriberStatus" ADD VALUE IF NOT EXISTS 'PENDING';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "NewsletterSubscriber"
  ADD COLUMN IF NOT EXISTS "confirmToken" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_confirmToken_key"
  ON "NewsletterSubscriber" ("confirmToken");

CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_confirmToken_idx"
  ON "NewsletterSubscriber" ("confirmToken");

-- Poll vote uniqueness
CREATE TABLE IF NOT EXISTS "PollVote" (
  "id" TEXT NOT NULL,
  "pollId" TEXT NOT NULL,
  "voterKey" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PollVote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PollVote_pollId_voterKey_key"
  ON "PollVote" ("pollId", "voterKey");

CREATE INDEX IF NOT EXISTS "PollVote_pollId_idx"
  ON "PollVote" ("pollId");

DO $$ BEGIN
  ALTER TABLE "PollVote"
    ADD CONSTRAINT "PollVote_pollId_fkey"
    FOREIGN KEY ("pollId") REFERENCES "Poll"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
