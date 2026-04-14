#!/bin/sh
set -e

# ─── Config ──────────────────────────────────────────
MAX_RETRIES="${DB_WAIT_RETRIES:-30}"
RETRY_INTERVAL="${DB_WAIT_INTERVAL:-2}"

# ─── Logging ─────────────────────────────────────────
log()  { echo "[entrypoint] $(date -u +%H:%M:%S) $*"; }
die()  { log "FATAL: $*"; exit 1; }

# ─── Parse DATABASE_URL ──────────────────────────────
# Extracts host and port from postgresql://user:pass@host:port/db
parse_db_url() {
  [ -z "$DATABASE_URL" ] && die "DATABASE_URL is not set"

  DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')
  DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*@[^:]*:\([0-9]*\).*|\1|p')

  DB_HOST="${DB_HOST:-localhost}"
  DB_PORT="${DB_PORT:-5432}"
}

# ─── Wait for PostgreSQL TCP connection ──────────────
wait_for_db() {
  log "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."

  attempt=0
  while [ "$attempt" -lt "$MAX_RETRIES" ]; do
    # Use /dev/tcp-style check via nc (busybox netcat on alpine)
    if nc -z "$DB_HOST" "$DB_PORT" >/dev/null 2>&1; then
      log "PostgreSQL is accepting connections."
      return 0
    fi

    attempt=$((attempt + 1))
    log "Attempt ${attempt}/${MAX_RETRIES} — PostgreSQL not ready, retrying in ${RETRY_INTERVAL}s..."
    sleep "$RETRY_INTERVAL"
  done

  die "PostgreSQL at ${DB_HOST}:${DB_PORT} did not become ready after $((MAX_RETRIES * RETRY_INTERVAL))s"
}

# ─── Run Prisma migrations ───────────────────────────
run_migrations() {
  log "Running Prisma migrations..."

  if npx prisma migrate deploy --schema=./prisma/schema.prisma 2>&1; then
    log "Migrations applied successfully."
  else
    exit_code=$?
    die "Prisma migrate deploy failed with exit code ${exit_code}"
  fi
}

# ─── Main ────────────────────────────────────────────
parse_db_url
wait_for_db
run_migrations

log "Starting application..."
exec "$@"
