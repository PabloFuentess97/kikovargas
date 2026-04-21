# Master Rebuild Prompt

Use this as a starting prompt when asking an LLM to rebuild the entire project from this snapshot.

## Prompt

```
You will help me rebuild a Next.js project called "KikoVargas" from a complete
specification (the SNAPSHOT folder).

**Project purpose:** Professional personal website and content platform for Kiko
Vargas, an IFBB Pro Bodybuilder. Combines a premium dark athletic landing page
with a comprehensive admin panel for content management, AI-assisted content
generation, booking system, landing page builder, and newsletter/email marketing.

**Stack:**
- Next.js 16.2.3 (App Router, Standalone output)
- React 19.2.4
- PostgreSQL 16 + Prisma 7.7.0 ORM
- TypeScript 5 + Tailwind CSS 4
- TipTap 3.22 (rich text editor)
- JWT auth (jsonwebtoken) + bcryptjs (password hashing)
- Resend (transactional email)
- OpenAI + Ollama (AI content generation)
- Framer Motion 12
- Docker + docker-compose for deployment

**Design philosophy:** Premium dark athletic, editorial typography (Oswald + Inter),
gold accent (#c9a84c) on near-black background (#030303), sharp corners on landing,
rounded corners in admin.

**Key files to build:**
1. Infrastructure: Dockerfile, docker-compose.yml, .env.example, docker-entrypoint.sh
2. Database: prisma/schema.prisma + all 6 migrations
3. Auth: src/middleware.ts, src/lib/auth/session.ts, src/lib/auth/jwt.ts
4. Encryption: src/lib/crypto.ts (AES-256-GCM for API keys)
5. Design system: src/app/globals.css (full CSS variables + classes)
6. Layouts: src/app/layout.tsx, src/app/(admin)/layout.tsx
7. Landing: src/components/landing/* (15 components)
8. Admin UI: src/components/admin/ui/* (Button, Card, Table, Form, etc.)
9. Event blocks: src/components/event-blocks/* (14 block types + renderer)
10. API routes: src/app/api/* (37 endpoints)
11. Admin pages: src/app/(admin)/dashboard/*
12. Public pages: /, /blog, /gallery, /book, /event, /login, /privacy, /terms

I will provide you the snapshot one section at a time. For each section, confirm
you understand before we move to the next. Ask clarifying questions if anything
is ambiguous.

First section to review: [PASTE A SPECIFIC SECTION HERE]
```

## Suggested Section Order

When feeding sections to the LLM, go in this order (matches buildability):

1. **08-deployment** — Set up infrastructure first
2. **03-database** — Schema and migrations
3. **07-security** — Auth, encryption, upload protection
4. **01-design-system** — Colors, typography, spacing, components
5. **05-api** — All endpoints
6. **04-features** — Detailed feature specs (reference during implementation)
7. **06-admin-panel** — Admin UI on top of API
8. **02-content** — Seed copy into DB / set defaults
9. **09-prompts** — Use feature-specific prompts as needed

## Tips for Successful Rebuild

1. **Build in vertical slices.** Start with authentication end-to-end (login page + API + middleware), then move to a single feature (e.g., posts) before moving on.

2. **Use the existing Zod schemas** from `02-request-response-schemas.md`. Don't invent new validation.

3. **Match the API envelope exactly:** `{ success: true, data }` or `{ success: false, error }`.

4. **Do not skip `requireAdmin()`** on any admin endpoint.

5. **Copy the CSS verbatim** from `01-design-system`. The design tokens and component classes are interdependent.

6. **Use `clamp()` for responsive typography** (no breakpoints needed).

7. **Use `data-theme="admin"`** to swap themes on admin layout.

8. **Test with `docker compose up`** from the beginning — faster than local dev setup.

9. **Run migrations automatically** via `docker-entrypoint.sh`. Don't skip this.

10. **Seed a default admin user** via `prisma/seed.ts` immediately after first deployment.
