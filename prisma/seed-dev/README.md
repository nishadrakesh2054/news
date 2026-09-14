# Development seed (additive / idempotent)

Safe seed for Echo Manch demo content. **Does not** delete, truncate, drop, or overwrite existing articles.

## Command

```bash
pnpm db:seed-dev
```

## Optional environment

| Variable | Purpose |
| --- | --- |
| `IMAGE_PROVIDER_API_KEY` or `UNSPLASH_ACCESS_KEY` | Unsplash API search (optional) |
| `PEXELS_API_KEY` | Pexels API search (optional) |
| `SEED_UPLOAD_CLOUDINARY=1` | Upload resolved images via existing Cloudinary env (`NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) |

Without API keys, curated Unsplash CDN landscape URLs are used (same pattern as existing seeds).

## Behaviour

- Creates **missing** categories/tags only (never updates existing category/tag fields).
- Creates articles with slugs `dev-seed-{category}-{nnn}` and `dev-seed-australia-{nnn}`.
- Skips any slug that already exists.
- Reuses existing staff authors; creates `seed-author@echomanch.local` only if no staff user exists.
- Mix of **PUBLISHED** / **DRAFT**, staggered dates, bilingual NE/EN bodies, SEO fields, tags, cover images, and Australia `auRegion` distribution.

## Notes

- Content is development/demo journalism — not verified breaking news.
- Do not run `prisma migrate reset` or truncate tables for this seed.
