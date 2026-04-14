# kikovargass.com

Professional personal brand website for Kiko Vargas, IFBB Pro Bodybuilder. Built with Next.js 16, PostgreSQL, and a dark premium design system.

## Tech Stack

- **Framework** — Next.js 16 (App Router, Server Components)
- **Database** — PostgreSQL + Prisma 7 (with `@prisma/adapter-pg`)
- **Styling** — Tailwind CSS 4 + Framer Motion
- **Auth** — JWT with httpOnly cookies + bcrypt
- **Email** — Resend (transactional, for contact form)
- **Uploads** — UploadThing (gallery images)
- **Validation** — Zod 4
- **Deployment** — Docker (multi-stage) + Docker Compose

## Features

**Public site**
- Premium dark landing page with parallax hero, gallery lightbox, blog preview, contact form
- Cookie consent banner with analytics opt-in
- Legal pages (Privacy Policy, Cookie Policy, Terms)
- Custom 404/500 error pages with brand styling
- Page view analytics (self-hosted, no third-party tracking)

**Admin dashboard** (`/dashboard`)
- Blog management (CRUD, drafts, publishing)
- Gallery management (upload, reorder, alt text)
- Contact inbox (read, reply, archive)
- Analytics dashboard (views, countries, devices, browsers)
- User management

## Project Structure

```
src/
  app/
    (landing)/        # Public pages (home, legal)
    (admin)/          # Admin dashboard
    (auth)/           # Login page
    api/              # REST API routes
  components/
    landing/          # Landing page sections
    analytics/        # Page tracker
  lib/
    auth/             # JWT session helpers
    db/               # Prisma client
    email/            # Resend client
    uploadthing/      # Upload router
    validations/      # Zod schemas
  config/             # Environment validation
prisma/
  schema.prisma       # Data model
  migrations/         # Migration history
  seed.ts             # Default admin + sample data
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL and JWT secret

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed default admin user (optional)
npm run db:seed

# Start dev server
npm run dev
```

The app runs at `http://localhost:3000`. Admin login at `/login`.

Default credentials after seeding:
- Email: `admin@kikovargass.com`
- Password: `Admin2024!`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## Docker Deployment

```bash
cp .env.example .env
# Edit .env with production values (see .env.example for details)

docker compose up -d --build
```

This starts PostgreSQL + the Next.js app. Migrations run automatically on startup.

After first deploy, seed the admin user:

```bash
docker compose exec app npx prisma db seed
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Min 32 chars. Generate: `openssl rand -base64 48` |
| `POSTGRES_PASSWORD` | Docker only | Password for the PostgreSQL container |
| `RESEND_API_KEY` | No | Resend API key for contact notifications |
| `CONTACT_EMAIL_TO` | No | Recipient for contact form (default: `contacto@kikovargass.com`) |
| `UPLOADTHING_TOKEN` | No | UploadThing token for image uploads |

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full deployment guide including VPS setup, Nginx, SSL, backups, and troubleshooting.

## License

All rights reserved. This codebase is private.
