# Database Backup & Recovery

Echo Manch uses **Neon PostgreSQL**. Backups are managed in the Neon console.

## Neon automated backups

- **Free plan:** Limited history (point-in-time recovery may not be available).
- **Paid plans:** Automated backups + PITR (point-in-time restore).

Enable and verify backups in [Neon Console](https://console.neon.tech) → your project → **Backups**.

## Before production launch

1. Confirm your Neon plan includes backups for your RPO needs.
2. Run a **test restore** to a branch (Neon → Branches → Create branch from restore point).
3. Document who on your team can access the Neon console.

## Manual export (optional)

Export schema + data with `pg_dump` using your **direct** (non-pooler) connection string:

```bash
pg_dump "$DATABASE_URL_UNPOOLED" --format=custom --file=echo-manch-backup.dump
```

Restore to a new database:

```bash
pg_restore --clean --if-exists --dbname="$TARGET_DATABASE_URL" echo-manch-backup.dump
```

> Use the pooler URL (`-pooler` host) for the app. Use the direct URL for `pg_dump` / `pg_restore`.

## After schema changes

Always run on production after deploy:

```bash
pnpm db:push
pnpm db:search-indexes
```

## Secret rotation

If `.env` was ever committed to git:

1. Rotate `DATABASE_URL` password in Neon.
2. Regenerate `NEXTAUTH_SECRET`, `CRON_SECRET`, `RESEND_API_KEY`, Cloudinary keys.
3. Update all values in Vercel/hosting env settings.
