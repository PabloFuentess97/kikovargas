# ─────────────────────────────────────────────────────────────
# Dockerfile — kikovargas.fit (Coolify-optimized)
# Next.js 16 standalone + Prisma 7 + PostgreSQL
# ─────────────────────────────────────────────────────────────

# ─── Stage 1: deps ───────────────────────────────────────────
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy only the manifests for cache-friendly installs
COPY package.json package-lock.json* ./
COPY prisma ./prisma

RUN npm ci --frozen-lockfile

# ─── Stage 2: builder ────────────────────────────────────────
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (custom output: src/generated/prisma)
RUN npx prisma generate

# Disable telemetry on build
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js (uses output: "standalone" from next.config.ts)
RUN npm run build

# ─── Stage 3: runner ─────────────────────────────────────────
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl tini curl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV TZ=Europe/Madrid

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy Next.js standalone build
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema + migrations + generated client + CLI (for migrate deploy at runtime)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/generated/prisma ./src/generated/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Copy entrypoint
COPY --chown=nextjs:nodejs coolify/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create writable directories for uploads (mounted as Coolify persistent volumes)
RUN mkdir -p /app/public/uploads /app/private-uploads && \
    chown -R nextjs:nodejs /app/public/uploads /app/private-uploads

USER nextjs

EXPOSE 3000

# Health check (Coolify uses this to know when the container is ready)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fsS http://localhost:3000/api/health || exit 1

# tini = PID 1 reaper, handles signals correctly
ENTRYPOINT ["/sbin/tini", "--", "./docker-entrypoint.sh"]
CMD ["node", "server.js"]
