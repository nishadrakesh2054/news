# Production Operations

## Database

Apply schema and indexes:

```bash
pnpm db:push
pnpm db:search-indexes   # pg_trgm GIN indexes for search
```

See [BACKUP.md](./BACKUP.md) for Neon backup and restore.

## Environment

Copy `.env.example` to `.env.local` and fill all secrets. **Never commit `.env` files.**

Required for production:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon **pooled** URL (`-pooler`). Use `sslmode=require`. Remove `channel_binding=require` — it often causes Prisma 500s on Vercel. |
| `NEXTAUTH_SECRET` | Session signing (long random string) |
| `NEXTAUTH_URL` | `https://echomanchnews.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://echomanchnews.vercel.app` (Nepali public) |
| `NEXT_PUBLIC_ENGLISH_SITE_URL` | `https://echomanchnews.vercel.app` (English uses `?lang=en`) |
| `CLOUDINARY_*` | Media uploads |
| `CRON_SECRET` | Protects `/api/cron/*` |
| `RESEND_API_KEY` | Password reset + newsletter emails |
| `MAIL_FROM_EMAIL` | `info@echomanchs.com` |
| `SENTRY_DSN` | Error monitoring (optional) |

## Bilingual editions (one CMS / one API)

Point both domains at the same Next.js deployment:

| Host | Edition |
|------|---------|
| `echomanchs.com` | Nepali (`NEPALI_ONLY` + `BOTH`) |
| `en.echomanchs.com` | English (`ENGLISH_ONLY` + `BOTH`) |

- CMS: set each article’s **Language edition** (Nepali only / English only / Both).
- Public APIs honor `Host` and optional `?lang=en|ne` (e.g. `GET /api/articles?lang=en`).
- Localhost: use `/?lang=en` instead of a subdomain.

On Vercel: add both domains to the project. Set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_ENGLISH_SITE_URL`.

## Deployment checklist

- [ ] `pnpm test` passes
- [ ] `pnpm build` succeeds
- [ ] `pnpm db:push` on production DB
- [ ] `pnpm db:search-indexes` on production DB
- [ ] All env vars set on Vercel (not in git), especially `DATABASE_URL` and `NEXTAUTH_URL=https://echomanchnews.vercel.app`
- [ ] Current Vercel host is `echomanchnews.vercel.app` (English via `?lang=en`)
- [ ] `CRON_SECRET` set — Vercel cron sends `Authorization: Bearer $CRON_SECRET`
- [ ] Security headers active (`next.config.ts`)
- [ ] Rotate secrets if `.env` was ever pushed to GitHub

## Cron jobs

`vercel.json` schedules (Hobby plan = once per day each):

| Schedule (UTC) | Endpoint |
|----------|----------|
| `0 1 * * *` (01:00) | `GET /api/cron/publish-scheduled` |
| `0 2 * * *` (02:00) | `GET /api/cron/send-notifications` |

> Vercel Hobby cannot use `*/5 * * * *`. Pro unlocks frequent crons.

On Vercel, set `CRON_SECRET` in project env. Vercel automatically adds the Bearer header when invoking crons.

Manual test:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://echomanchnews.vercel.app/api/cron/publish-scheduled
```

## Password reset

- Users: `/forgot-password` → email link → `/reset-password?token=...`
- Requires `RESEND_API_KEY` + `MAIL_FROM_EMAIL` in production

## Monitoring

Set `SENTRY_DSN` (and optionally `NEXT_PUBLIC_SENTRY_DSN` for client). Sentry is disabled when DSN is unset.

`GET /api/health` now pings the database. `503` + `DATABASE_URL is missing` or `Database is unreachable` means Vercel cannot talk to Neon. Same-origin `/api/admin/*` 500s are not CORS.
