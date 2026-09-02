# Production Operations

## Database

Apply schema and indexes:

```bash
pnpm db:push
pnpm db:search-indexes   # pg_trgm GIN indexes for search
```

Neon provides automated backups on paid plans. Document your restore procedure in the Neon console and test a restore at least once before launch.

## Environment

Copy `.env.example` to `.env.local` and fill all secrets. Never commit `.env` files.

Required for production:

- `DATABASE_URL` (pooler URL)
- `NEXTAUTH_SECRET` (long random string)
- `NEXTAUTH_URL` (production URL)
- `NEXT_PUBLIC_SITE_URL`
- Cloudinary credentials

## Deployment checklist

- [ ] `pnpm test` passes
- [ ] `pnpm build` succeeds
- [ ] `pnpm db:push` applied on production DB
- [ ] `pnpm db:search-indexes` applied (pg_trgm)
- [ ] `CRON_SECRET` set and cron routes scheduled
- [ ] Security headers active (`next.config.ts`)
- [ ] `.env` secrets not exposed to client bundle

## Cron jobs

Schedule these endpoints with `Authorization: Bearer $CRON_SECRET`:

- `GET /api/cron/publish-scheduled` — publish scheduled articles
- `GET /api/cron/send-notifications` — dispatch due notifications
