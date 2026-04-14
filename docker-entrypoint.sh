#!/bin/sh
set -e

# ─── Config ──────────────────────────────────────────
MAX_RETRIES="${DB_WAIT_RETRIES:-30}"
RETRY_INTERVAL="${DB_WAIT_INTERVAL:-2}"

# ─── Logging ─────────────────────────────────────────
log()  { echo "[entrypoint] $(date -u +%H:%M:%S) $*"; }
die()  { log "FATAL: $*"; exit 1; }

# ─── Validate environment ────────────────────────────
validate_env() {
  log "Validating environment variables..."

  [ -z "$DATABASE_URL" ] && die "DATABASE_URL is not set"
  [ -z "$JWT_SECRET" ]   && die "JWT_SECRET is not set"

  secret_len=$(printf '%s' "$JWT_SECRET" | wc -c)
  [ "$secret_len" -lt 32 ] && die "JWT_SECRET must be at least 32 characters (got ${secret_len})"

  log "Environment OK."
}

# ─── Parse DATABASE_URL ──────────────────────────────
parse_db_url() {
  DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')
  DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*@[^:]*:\([0-9]*\).*|\1|p')

  DB_HOST="${DB_HOST:-localhost}"
  DB_PORT="${DB_PORT:-5432}"
}

# ─── Wait for PostgreSQL ─────────────────────────────
wait_for_db() {
  log "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."

  attempt=0
  while [ "$attempt" -lt "$MAX_RETRIES" ]; do
    # Use Node.js for a reliable TCP check (always available in this image)
    if node -e "const s=require('net').connect(${DB_PORT},'${DB_HOST}',()=>{s.end();process.exit(0)});s.on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),2000)" 2>/dev/null; then
      log "PostgreSQL is accepting connections."
      return 0
    fi

    attempt=$((attempt + 1))
    if [ "$attempt" -lt "$MAX_RETRIES" ]; then
      log "Attempt ${attempt}/${MAX_RETRIES} — not ready, retrying in ${RETRY_INTERVAL}s..."
      sleep "$RETRY_INTERVAL"
    fi
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
    die "prisma migrate deploy failed (exit code ${exit_code})"
  fi
}

# ─── Main ────────────────────────────────────────────
validate_env
parse_db_url
wait_for_db
run_migrations

log "Starting application..."
exec "$@"
