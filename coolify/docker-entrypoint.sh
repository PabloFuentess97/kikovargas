#!/bin/sh
# ─────────────────────────────────────────────────────────────
# docker-entrypoint.sh — kikovargas.fit
# Runs Prisma migrations then starts the Next.js server.
# ─────────────────────────────────────────────────────────────
set -e

echo "──────────────────────────────────────────"
echo "  kikovargas.fit — startup"
echo "  $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "──────────────────────────────────────────"

# Validate required env vars
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${JWT_SECRET:?JWT_SECRET is required}"
: "${ENCRYPTION_KEY:?ENCRYPTION_KEY is required}"
: "${NEXT_PUBLIC_URL:?NEXT_PUBLIC_URL is required}"

# Wait for the database to be reachable (max 60s)
echo "→ Waiting for database..."
ATTEMPTS=0
until node -e "
  const { PrismaClient } = require('./src/generated/prisma');
  const p = new PrismaClient();
  p.\$queryRaw\`SELECT 1\`.then(() => process.exit(0)).catch(() => process.exit(1));
" 2>/dev/null; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ $ATTEMPTS -ge 30 ]; then
    echo "✗ Database not reachable after 60s. Aborting."
    exit 1
  fi
  echo "  ...retry $ATTEMPTS/30"
  sleep 2
done
echo "✓ Database reachable"

# Apply pending migrations
echo "→ Applying Prisma migrations..."
npx prisma migrate deploy
echo "✓ Migrations applied"

# Start the app
echo "→ Starting Next.js on ${HOSTNAME:-0.0.0.0}:${PORT:-3000}"
echo "──────────────────────────────────────────"
exec "$@"
