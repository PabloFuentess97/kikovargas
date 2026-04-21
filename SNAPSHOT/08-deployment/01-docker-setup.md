# Deployment — Docker Setup

## Overview

Production deployment uses **Docker Compose** with two services:
1. **`db`** — PostgreSQL 16 Alpine
2. **`app`** — Next.js standalone (multi-stage build)

Both isolated on an internal Docker network.

## Dockerfile (Multi-stage)

```dockerfile
# ─── Stage 1: Dependencies ──────────────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci --ignore-scripts

# ─── Stage 2: Build ─────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build requires these at build time (can be dummy values)
ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ARG JWT_SECRET="build-time-placeholder-must-be-32-chars!!"

ENV DATABASE_URL=${DATABASE_URL}
ENV JWT_SECRET=${JWT_SECRET}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ─── Stage 3: Production ────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output + static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Public assets (excluding uploads — mounted as volume)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create uploads directory (will be overlaid by volume mount)
RUN mkdir -p /app/public/uploads && chown nextjs:nodejs /app/public/uploads

# Copy Prisma schema + migrations + config for runtime migrate deploy
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated

# Copy full node_modules for Prisma CLI
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Writable cache directory for Prisma engines
RUN mkdir -p /app/.cache && chown nextjs:nodejs /app/.cache
ENV PRISMA_ENGINES_MIRROR=/app/.cache

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
```

### Key Points

- **Base image:** `node:20-alpine` (lightweight, secure)
- **Non-root user:** `nextjs` (UID 1001)
- **Standalone output:** Uses Next.js `output: "standalone"` (minimal runtime)
- **3 stages:** deps (cached), builder, runner
- **Healthcheck:** HTTP probe on port 3000

## docker-compose.yml

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: kikovargas-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: kikovargass
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme_strong_password}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - internal
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d kikovargass"]
      interval: 5s
      timeout: 5s
      retries: 10

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: kikovargas-app
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "${APP_PORT:-3000}:3000"
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD:-changeme_strong_password}@db:5432/kikovargass?schema=public
      JWT_SECRET: ${JWT_SECRET:?JWT_SECRET is required (min 32 chars)}
      NODE_ENV: production
      RESEND_API_KEY: ${RESEND_API_KEY:-}
      CONTACT_EMAIL_TO: ${CONTACT_EMAIL_TO:-contacto@kikovargass.com}
    volumes:
      - ./uploads:/app/public/uploads
    networks:
      - internal

networks:
  internal:
    name: kikovargas-net

volumes:
  pgdata:
    name: kikovargas-pgdata
```

## docker-entrypoint.sh

Runs **before** the Next.js server starts:

```bash
#!/bin/sh
set -e

MAX_RETRIES="${DB_WAIT_RETRIES:-30}"
RETRY_INTERVAL="${DB_WAIT_INTERVAL:-2}"

log()  { echo "[entrypoint] $(date -u +%H:%M:%S) $*"; }
die()  { log "FATAL: $*"; exit 1; }

# ─── Validate environment ────────────────────────────
validate_env() {
  [ -z "$DATABASE_URL" ] && die "DATABASE_URL is not set"
  [ -z "$JWT_SECRET" ]   && die "JWT_SECRET is not set"

  secret_len=$(printf '%s' "$JWT_SECRET" | wc -c)
  [ "$secret_len" -lt 32 ] && die "JWT_SECRET must be at least 32 characters"
}

# ─── Parse DB URL for host/port ──────────────────────
parse_db_url() {
  DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')
  DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*@[^:]*:\([0-9]*\).*|\1|p')
  DB_HOST="${DB_HOST:-localhost}"
  DB_PORT="${DB_PORT:-5432}"
}

# ─── Wait for PostgreSQL via TCP check ───────────────
wait_for_db() {
  attempt=0
  while [ "$attempt" -lt "$MAX_RETRIES" ]; do
    if node -e "const s=require('net').connect(${DB_PORT},'${DB_HOST}',()=>{s.end();process.exit(0)});s.on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),2000)" 2>/dev/null; then
      return 0
    fi
    attempt=$((attempt + 1))
    sleep "$RETRY_INTERVAL"
  done
  die "PostgreSQL did not become ready"
}

# ─── Run migrations (with retries) ───────────────────
run_migrations() {
  attempt=0
  while [ "$attempt" -lt 5 ]; do
    attempt=$((attempt + 1))
    if node ./node_modules/prisma/build/index.js migrate deploy --schema=./prisma/schema.prisma 2>&1; then
      return 0
    fi
    sleep 5
  done
  die "Migrations failed after 5 attempts"
}

# ─── Ensure uploads directory is writable ────────────
ensure_uploads_dir() {
  UPLOADS_DIR="/app/public/uploads"
  mkdir -p "$UPLOADS_DIR" 2>/dev/null
  touch "$UPLOADS_DIR/.write-test" 2>/dev/null && rm "$UPLOADS_DIR/.write-test"
}

validate_env
parse_db_url
wait_for_db
run_migrations
ensure_uploads_dir

log "Starting application..."
exec "$@"
```

## .dockerignore

```
node_modules
.next
.git
.gitignore
.env
.env.local
*.md
!README.md
docker-compose*.yml
Dockerfile
.dockerignore
.vscode
.idea
src/generated/prisma
```

## next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

## Build & Run

### First time
```bash
# 1. Copy env template
cp .env.example .env

# 2. Edit .env with your values (especially JWT_SECRET and POSTGRES_PASSWORD)
nano .env

# 3. Build the image
docker compose build

# 4. Start everything
docker compose up -d

# 5. Check logs
docker compose logs -f app
```

### Subsequent deploys
```bash
git pull
docker compose build app
docker compose up -d app
```

### Create the first admin user

After initial deploy, there are no users. SSH into the app container:
```bash
docker compose exec app sh
# Inside the container:
npx tsx prisma/seed.ts
```

Or run a one-off seed script via `docker compose run`.

### Useful commands

```bash
# View logs
docker compose logs -f app
docker compose logs -f db

# Restart app only
docker compose restart app

# Shell into app
docker compose exec app sh

# Shell into database
docker compose exec db psql -U postgres kikovargass

# Stop everything
docker compose down

# Stop AND remove volumes (DELETES DATA)
docker compose down -v
```

## Deploying to a VPS

1. **Install Docker + Compose** on the VPS
2. **Clone repo:** `git clone ... /opt/kikovargas`
3. **Set up `.env`** with production values
4. **Set up reverse proxy** (Nginx, Caddy, Traefik) in front of port 3000 for HTTPS
5. **Run compose:** `docker compose up -d`
6. **Ensure uploads dir is writable:** `chown -R 1001:1001 ./uploads`

### Caddy example

```caddy
kikovargass.com {
  reverse_proxy localhost:3000
  encode gzip

  header {
    X-Frame-Options "DENY"
    X-Content-Type-Options "nosniff"
    Referrer-Policy "strict-origin-when-cross-origin"
  }
}
```

### Nginx example

```nginx
server {
  server_name kikovargass.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  listen 443 ssl;
  ssl_certificate /etc/letsencrypt/live/kikovargass.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/kikovargass.com/privkey.pem;
}
```

## Updates & Rollbacks

### Zero-downtime deployment
Current setup has minor downtime during restart (~5-10s). For zero-downtime:
- Use a blue/green setup with 2 app containers
- Swap via reverse proxy

### Rollback
```bash
git checkout <previous-commit>
docker compose build app
docker compose up -d app
```

Prisma migrations are additive; manual rollback would require writing a down migration.
