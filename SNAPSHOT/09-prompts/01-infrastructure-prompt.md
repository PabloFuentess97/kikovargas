# Prompt — Build Infrastructure

## Context for LLM

```
I'm building a Next.js 16 app with PostgreSQL. Set up the complete infrastructure:

1. Dockerfile (3-stage: deps, builder, runner)
   - Base: node:20-alpine
   - Non-root user: nextjs (UID 1001)
   - Next.js standalone output
   - Runs as: ./docker-entrypoint.sh then node server.js
   - Healthcheck: wget localhost:3000

2. docker-compose.yml
   - Two services: db (postgres:16-alpine) + app (built from Dockerfile)
   - Volumes: pgdata (named), ./uploads (bind mount)
   - Healthcheck on db using pg_isready
   - app depends_on db health
   - Internal network named kikovargas-net

3. docker-entrypoint.sh
   - Validates DATABASE_URL and JWT_SECRET (must be 32+ chars)
   - Parses DB URL for host/port
   - Waits for PostgreSQL (TCP check via Node)
   - Runs: node ./node_modules/prisma/build/index.js migrate deploy
   - Retries migrations up to 5 times
   - Ensures /app/public/uploads is writable

4. .env.example with:
   - DATABASE_URL
   - POSTGRES_PASSWORD
   - JWT_SECRET (min 32 chars)
   - ENCRYPTION_KEY (optional)
   - RESEND_API_KEY (optional)
   - CONTACT_EMAIL_TO
   - NEXT_PUBLIC_URL
   - APP_PORT

5. next.config.ts: output: "standalone"

6. package.json dependencies:
   - next@16.2.3, react@19.2.4, react-dom@19.2.4
   - @prisma/client@7.7.0, prisma@7.7.0, pg@8.20.0
   - @tiptap/react@3.22.3 + 5 TipTap extensions
   - jsonwebtoken@9, bcryptjs@3
   - resend@6, zod@4
   - framer-motion@12
   - Dev: typescript@5, tailwindcss@4, @types/*, eslint@9

7. tsconfig.json with:
   - strict: true
   - paths: { "@/*": ["./src/*"] }
   - jsx: react-jsx
   - moduleResolution: bundler

8. prisma.config.ts pointing to prisma/schema.prisma

9. .dockerignore (node_modules, .next, .git, .env, src/generated/prisma)

10. .gitignore (add src/generated/ and public/uploads/)

Use the EXACT file contents from SNAPSHOT/08-deployment/.
```

## Validation after build

```bash
# Build the image
docker compose build

# Start containers
docker compose up -d

# Check logs
docker compose logs app

# Should see:
# [entrypoint] Validating environment variables...
# [entrypoint] Environment OK.
# [entrypoint] Waiting for PostgreSQL...
# [entrypoint] PostgreSQL is accepting connections.
# [entrypoint] Running Prisma migrations...
# [entrypoint] Migrations applied successfully.
# [entrypoint] Starting application...
#   ▲ Next.js 16.2.3
#   - Local:  http://localhost:3000
#   - Ready in 1.2s

# Verify HTTP response
curl -I http://localhost:3000
```
