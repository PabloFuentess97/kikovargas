# Deployment — Environment Variables

## .env.example

```bash
# ─── Database ────────────────────────────────────────
# For Docker Compose: the app service uses this password to connect to the db service.
# For local dev: use your local PostgreSQL connection string.
DATABASE_URL="postgresql://postgres:changeme_strong_password@localhost:5432/kikovargass?schema=public"
POSTGRES_PASSWORD="changeme_strong_password"

# ─── Auth ────────────────────────────────────────────
# Must be at least 32 characters. Generate with: openssl rand -base64 48
JWT_SECRET="cambia-esto-por-un-secreto-de-al-menos-32-caracteres!"

# ─── Encryption ─────────────────────────────────────
# Used to encrypt API keys stored in DB. Generate with: openssl rand -base64 48
# If not set, falls back to JWT_SECRET. Changing this invalidates stored keys.
ENCRYPTION_KEY=""

# ─── Email (optional) ───────────────────────────────
# Resend API key for contact form notifications. Leave empty to disable.
RESEND_API_KEY=""
CONTACT_EMAIL_TO="contacto@kikovargass.com"

# ─── App URL ────────────────────────────────────────
# Base URL for the application (used for SEO/metadata)
NEXT_PUBLIC_URL="http://localhost:3000"

# ─── App ─────────────────────────────────────────────
NODE_ENV="development"

# ─── Docker (VPS) ───────────────────────────────────
# External port for the app. Change to avoid conflicts with other projects.
APP_PORT="3000"
```

## Variables Reference

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `POSTGRES_PASSWORD` | **Yes (Docker)** | `changeme_strong_password` | Used by Compose to set Postgres password |
| `JWT_SECRET` | **Yes** | — | JWT signing secret (min 32 chars) |
| `ENCRYPTION_KEY` | Recommended | (falls back to JWT_SECRET) | AES encryption key for API keys in DB |
| `RESEND_API_KEY` | Optional | `""` | Resend key (fallback if not in DB config) |
| `CONTACT_EMAIL_TO` | Optional | `contacto@kikovargass.com` | Where contact form emails go (fallback) |
| `NEXT_PUBLIC_URL` | Optional | `http://localhost:3000` | Base URL for SEO metadata |
| `NODE_ENV` | **Yes** | `development` | `development` / `production` |
| `APP_PORT` | Optional | `3000` | Host port binding for Docker |
| `DB_WAIT_RETRIES` | Optional | `30` | Entrypoint retries for DB connection |
| `DB_WAIT_INTERVAL` | Optional | `2` | Seconds between DB connection retries |
| `OPENAI_API_KEY` | Optional | — | Fallback if not set via admin UI |
| `PRISMA_ENGINES_MIRROR` | Internal | `/app/.cache` | Set by Dockerfile |
| `NEXT_TELEMETRY_DISABLED` | Internal | `1` | Disable Next.js telemetry |
| `HOSTNAME` | Internal | `0.0.0.0` | Next.js standalone bind address |
| `PORT` | Internal | `3000` | Next.js listen port |

## DATABASE_URL Format

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

Examples:
- **Local dev:** `postgresql://postgres:pass@localhost:5432/kikovargass?schema=public`
- **Docker:** `postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/kikovargass?schema=public`
- **Managed Postgres (e.g., Neon):** `postgresql://user:pass@host/db?sslmode=require`

## Generating secrets

```bash
# JWT_SECRET (48 random chars, base64 encoded)
openssl rand -base64 48

# Same for ENCRYPTION_KEY
openssl rand -base64 48
```

## Priority of API Keys

For OpenAI and Resend, the system follows this priority:
1. **Database config** (set via `/dashboard/settings`) — encrypted
2. **Environment variable** — fallback (e.g., `OPENAI_API_KEY`, `RESEND_API_KEY`)
3. **Empty / feature disabled**

This allows admins to configure keys via the UI without touching env vars in production.

## Volumes

### `pgdata` — Database persistence
- Named Docker volume: `kikovargas-pgdata`
- Location: managed by Docker
- Persists PostgreSQL data across container recreations

### `./uploads` — Uploaded files
- Bind mount: host `./uploads` → container `/app/public/uploads`
- Owner: `nextjs:nodejs` (UID 1001)
- Backup this directory along with the DB volume
- Must be writable by UID 1001

## Backup Strategy

### Database
```bash
# Dump
docker compose exec db pg_dump -U postgres kikovargass > backup-$(date +%Y%m%d).sql

# Restore
docker compose exec -T db psql -U postgres kikovargass < backup-YYYYMMDD.sql
```

### Uploads
```bash
tar czf uploads-$(date +%Y%m%d).tar.gz uploads/
```

### Automated (cron example)
```bash
# /etc/cron.daily/backup-kikovargas
#!/bin/bash
BACKUP_DIR=/backups/kikovargas
DATE=$(date +%Y%m%d)
mkdir -p $BACKUP_DIR

docker compose -f /opt/kikovargas/docker-compose.yml exec -T db \
  pg_dump -U postgres kikovargass | gzip > $BACKUP_DIR/db-$DATE.sql.gz

tar czf $BACKUP_DIR/uploads-$DATE.tar.gz -C /opt/kikovargas uploads/

# Keep last 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
```

## Production Checklist

Before going live:

- [ ] `JWT_SECRET` is unique, 48+ random characters
- [ ] `ENCRYPTION_KEY` is unique, 48+ random characters
- [ ] `POSTGRES_PASSWORD` is strong (16+ chars, mixed)
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_URL` set to real domain with HTTPS
- [ ] Reverse proxy with HTTPS configured
- [ ] Resend domain verified (or using `onboarding@resend.dev` for testing)
- [ ] Admin user seeded (`npx tsx prisma/seed.ts`)
- [ ] Backups scheduled
- [ ] DNS pointing to VPS
- [ ] Firewall: only 22 (SSH), 80, 443 open
- [ ] Monitoring set up (logs, uptime, disk space)
