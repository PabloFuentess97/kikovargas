# 12 · Despliegue

## Stack de deployment

- **Docker + docker-compose** (producción y desarrollo reproducible)
- **Node 20 Alpine** como runtime
- **PostgreSQL 16 Alpine** como DB
- **Reverse proxy externo** (Caddy, Nginx, Traefik) para HTTPS — no gestionado por el compose

## Dockerfile

Multi-stage. Tres stages:

```dockerfile
# ─── Stage 1: Dependencies ───────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci --ignore-scripts

# ─── Stage 2: Build ──────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build requires env vars set (can be dummy)
ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ARG JWT_SECRET="build-time-placeholder-must-be-32-chars!!"

ENV DATABASE_URL=${DATABASE_URL}
ENV JWT_SECRET=${JWT_SECRET}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ─── Stage 3: Production ─────────────────────────────
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
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Create uploads directory (will be overlaid by volume mount)
RUN mkdir -p /app/public/uploads && chown nextjs:nodejs /app/public/uploads

# Copy Prisma schema + migrations + config for runtime migrate deploy
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated

# Copy FULL node_modules — needed for Prisma CLI at runtime
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Writable Prisma engine cache
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

### Notas técnicas

- **`libc6-compat`** necesario para Prisma en Alpine (enlaza contra glibc).
- **Usuario non-root** (`nextjs:nodejs`, UID 1001) por seguridad.
- **Copia `node_modules` entero** a la imagen final (no solo el subset de standalone) porque `prisma migrate deploy` lo necesita en runtime.
- **`PRISMA_ENGINES_MIRROR=/app/.cache`** evita que Prisma intente escribir al directorio de instalación (readonly con user non-root).
- **Healthcheck** con `wget`, no `curl` (no incluido en Alpine por defecto).

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

### Claves

- **`${VAR:?error}`** fuerza que la variable exista (falla si no).
- **`${VAR:-default}`** usa default si no está definida.
- **`depends_on: condition: service_healthy`** espera a que el healthcheck del DB pase antes de arrancar la app.
- **Red interna** (`kikovargas-net`) — el DB no expone puertos al host, solo es accesible desde la app.

## docker-entrypoint.sh

Script que se ejecuta **antes** del `CMD` del Dockerfile.

```bash
#!/bin/sh
set -e

MAX_RETRIES="${DB_WAIT_RETRIES:-30}"
RETRY_INTERVAL="${DB_WAIT_INTERVAL:-2}"

log()  { echo "[entrypoint] $(date -u +%H:%M:%S) $*"; }
die()  { log "FATAL: $*"; exit 1; }

# Validar env
validate_env() {
  [ -z "$DATABASE_URL" ] && die "DATABASE_URL is not set"
  [ -z "$JWT_SECRET" ]   && die "JWT_SECRET is not set"

  secret_len=$(printf '%s' "$JWT_SECRET" | wc -c)
  [ "$secret_len" -lt 32 ] && die "JWT_SECRET must be >= 32 chars"
}

# Parsear host/port del DATABASE_URL
parse_db_url() {
  DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')
  DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*@[^:]*:\([0-9]*\).*|\1|p')
  DB_HOST="${DB_HOST:-localhost}"
  DB_PORT="${DB_PORT:-5432}"
}

# TCP probe al DB
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

# prisma migrate deploy con reintentos
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

# Test escritura en uploads
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

**Uso de `node -e` para TCP check:** Alpine no incluye `nc` (netcat) por defecto. Node sí está disponible y es más robusto.

## Variables de entorno

### Archivo `.env.example`

```bash
# ─── Database ────────────────────────────────────────
DATABASE_URL="postgresql://postgres:changeme_strong_password@localhost:5432/kikovargass?schema=public"
POSTGRES_PASSWORD="changeme_strong_password"

# ─── Auth ────────────────────────────────────────────
# Min 32 chars. Generate: openssl rand -base64 48
JWT_SECRET="cambia-esto-por-un-secreto-de-al-menos-32-caracteres!"

# ─── Encryption ─────────────────────────────────────
# For AES encryption of API keys in DB. Falls back to JWT_SECRET if empty.
ENCRYPTION_KEY=""

# ─── Email (optional) ───────────────────────────────
RESEND_API_KEY=""
CONTACT_EMAIL_TO="contacto@kikovargass.com"

# ─── App URL ────────────────────────────────────────
NEXT_PUBLIC_URL="http://localhost:3000"

# ─── App ─────────────────────────────────────────────
NODE_ENV="development"

# ─── Docker (VPS) ───────────────────────────────────
APP_PORT="3000"
```

### Tabla de referencia

| Variable | Obligatoria | Default | Uso |
|----------|-------------|---------|-----|
| `DATABASE_URL` | Sí | — | Connection string Postgres |
| `POSTGRES_PASSWORD` | Sí (Docker) | `changeme_strong_password` | Password del DB |
| `JWT_SECRET` | Sí | — | Firma JWT. Min 32 chars |
| `ENCRYPTION_KEY` | Recomendada | fallback JWT_SECRET | Cifrado AES de API keys |
| `RESEND_API_KEY` | Opcional | `""` | Fallback si no está en DB |
| `CONTACT_EMAIL_TO` | Opcional | `contacto@kikovargass.com` | Fallback destino de emails |
| `NEXT_PUBLIC_URL` | Opcional | `http://localhost:3000` | URL base para SEO/metadata |
| `NODE_ENV` | Sí | `development` | `development` / `production` |
| `APP_PORT` | Opcional | `3000` | Puerto del host donde se expone |
| `DB_WAIT_RETRIES` | Opcional | `30` | Reintentos TCP en entrypoint |
| `DB_WAIT_INTERVAL` | Opcional | `2` | Segundos entre reintentos |
| `OPENAI_API_KEY` | Opcional | — | Fallback si no está en DB |

## Volúmenes

### `pgdata` (named volume)

Datos de PostgreSQL. Gestionado por Docker.

```bash
docker volume inspect kikovargas-pgdata
# Location: /var/lib/docker/volumes/kikovargas-pgdata/_data
```

### `./uploads` (bind mount)

Archivos subidos. En el host: `./uploads/` relativo al directorio donde corre `docker compose`.

**Permisos necesarios:**
```bash
mkdir -p ./uploads
sudo chown -R 1001:1001 ./uploads
sudo chmod -R 755 ./uploads
```

## Despliegue inicial en VPS

### Prerequisitos
- Ubuntu 22.04+ o Debian 12+
- Docker 24+ instalado
- Docker Compose plugin
- Acceso SSH
- Dominio apuntando al VPS (A record)

### Pasos

```bash
# 1. Clonar repo
git clone https://github.com/PabloFuentess97/kikovargas.git /opt/kikovargas
cd /opt/kikovargas

# 2. Crear .env
cp .env.example .env
nano .env   # completar valores reales

# Generar JWT_SECRET:
openssl rand -base64 48

# 3. Ajustar permisos de uploads
mkdir -p uploads
sudo chown -R 1001:1001 uploads

# 4. Build + up
docker compose build
docker compose up -d

# 5. Ver logs
docker compose logs -f app

# Esperar:
# [entrypoint] Running Prisma migrations...
# [entrypoint] Migrations applied successfully.
# [entrypoint] Starting application...
#  ▲ Next.js 16.2.3
#  - Ready in 1.2s

# 6. Crear admin inicial
docker compose exec app sh
npx tsx prisma/seed.ts
exit

# Por defecto crea admin@kikovargass.com / changeme12345678
```

### Configurar reverse proxy (Caddy)

`/etc/caddy/Caddyfile`:
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

```bash
sudo caddy reload --config /etc/caddy/Caddyfile
```

Caddy automáticamente gestiona HTTPS via Let's Encrypt.

### Actualizar

```bash
cd /opt/kikovargas
git pull
docker compose build app
docker compose up -d app
```

Downtime: ~5-10 segundos (mientras el contenedor se recrea y pasa healthcheck).

## Backup

### DB
```bash
docker compose exec -T db pg_dump -U postgres kikovargass | gzip > backup-$(date +%Y%m%d).sql.gz
```

### Restore
```bash
gunzip -c backup-YYYYMMDD.sql.gz | docker compose exec -T db psql -U postgres kikovargass
```

### Uploads
```bash
tar czf uploads-$(date +%Y%m%d).tar.gz uploads/
```

### Script automatizado (cron diario)

`/etc/cron.daily/backup-kikovargas`:
```bash
#!/bin/bash
BACKUP_DIR=/backups/kikovargas
DATE=$(date +%Y%m%d)
mkdir -p $BACKUP_DIR
cd /opt/kikovargas

docker compose exec -T db pg_dump -U postgres kikovargass | gzip > $BACKUP_DIR/db-$DATE.sql.gz
tar czf $BACKUP_DIR/uploads-$DATE.tar.gz uploads/

# Keep 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
```

```bash
chmod +x /etc/cron.daily/backup-kikovargas
```

## Troubleshooting común

### "DB did not become ready"
```bash
docker compose logs db
# Si muestra errores, probablemente `POSTGRES_PASSWORD` cambió respecto a la última vez:
docker compose down -v   # ATENCIÓN: borra datos
docker compose up -d
```

### "Migrations failed"
```bash
docker compose exec app sh
npx prisma migrate status   # ver estado
npx prisma migrate deploy   # aplicar manualmente
```

### Uploads no se guardan
```bash
ls -la ./uploads
# Debe ser UID 1001 (el user `nextjs` del container)
sudo chown -R 1001:1001 ./uploads
docker compose restart app
```

### Healthcheck falla
```bash
docker compose exec app wget -O- http://localhost:3000/
# Ver qué retorna
```

## Checklist de producción

- [ ] `JWT_SECRET` único y seguro (48+ chars)
- [ ] `ENCRYPTION_KEY` distinto de `JWT_SECRET`
- [ ] `POSTGRES_PASSWORD` fuerte
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_URL` con HTTPS real
- [ ] Reverse proxy con HTTPS (Caddy/Nginx)
- [ ] `./uploads` writable por UID 1001
- [ ] Admin user creado via seed
- [ ] Backups cron instalado y testeado
- [ ] DNS apuntando al VPS
- [ ] Firewall: solo 22, 80, 443 abiertos
- [ ] `TZ` del servidor correcta (ej. `Europe/Madrid`)
- [ ] Monitoreo de disco (uploads puede crecer)
- [ ] Alertas de caída (ping externo)
