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
| `DATABASE_URL` | Neon pooler URL |
| `NEXTAUTH_SECRET` | Session signing (long random string) |
| `NEXTAUTH_URL` | Production URL |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (emails, SEO, sitemaps) |
| `CLOUDINARY_*` | Media uploads |
| `CRON_SECRET` | Protects `/api/cron/*` |
| `RESEND_API_KEY` | Password reset + newsletter emails |
| `MAIL_FROM_EMAIL` | Sender address |
| `SENTRY_DSN` | Error monitoring (optional) |

## Deployment checklist

- [ ] `pnpm test` passes
- [ ] `pnpm build` succeeds
- [ ] `pnpm db:push` on production DB
- [ ] `pnpm db:search-indexes` on production DB
- [ ] All env vars set on Vercel (not in git)
- [ ] `CRON_SECRET` set — Vercel cron sends `Authorization: Bearer $CRON_SECRET`
- [ ] Security headers active (`next.config.ts`)
- [ ] Rotate secrets if `.env` was ever pushed to GitHub

## Cron jobs

`vercel.json` schedules:

| Schedule | Endpoint |
|----------|----------|
| Every 5 min | `GET /api/cron/publish-scheduled` |
| Every 5 min | `GET /api/cron/send-notifications` |

On Vercel, set `CRON_SECRET` in project env. Vercel automatically adds the Bearer header when invoking crons.

Manual test:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.com/api/cron/publish-scheduled
```

## Password reset

- Users: `/forgot-password` → email link → `/reset-password?token=...`
- Requires `RESEND_API_KEY` + `MAIL_FROM_EMAIL` in production

## Monitoring

Set `SENTRY_DSN` (and optionally `NEXT_PUBLIC_SENTRY_DSN` for client). Sentry is disabled when DSN is unset.
