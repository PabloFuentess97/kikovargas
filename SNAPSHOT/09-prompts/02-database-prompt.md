# Prompt — Build Database Schema

## Context for LLM

```
Create the Prisma schema and all migrations for a Next.js admin platform with:
- Users (admin auth)
- Blog posts
- Image gallery
- Page views (analytics)
- Flexible site_config (JSON key-value store)
- Newsletter subscribers + campaigns
- Booking system (links + bookings + availability)
- Event pages (landing builder with 14 block types)
- Knowledge base (editable help articles)
- Contact form submissions

**File 1: prisma/schema.prisma**

Use the exact schema from SNAPSHOT/03-database/01-full-schema.md.
Key decisions:
- All IDs are `cuid()` strings
- Timestamps use `@map` for snake_case column names
- Enums: Role, PostStatus, ContactStatus, CampaignStatus, BookingStatus, EventPageStatus
- All unique constraints explicitly declared
- All indexes explicitly declared
- Cascades:
  - Delete User → Restrict posts
  - Delete Post → Cascade images, SetNull on cover
  - Delete BookingLink → Cascade Bookings
  - Delete EventPage → Cascade blocks + leads
- Generated client output: `../src/generated/prisma`

**Files 2-7: Migrations**

Create these 6 migration files with the EXACT SQL from SNAPSHOT/03-database/03-migrations.md:

1. prisma/migrations/0_init/migration.sql
2. prisma/migrations/1_add_site_config/migration.sql
3. prisma/migrations/2_add_newsletter_system/migration.sql
4. prisma/migrations/3_add_booking_system/migration.sql
5. prisma/migrations/4_add_event_pages/migration.sql
6. prisma/migrations/5_add_knowledge_base/migration.sql

**File 8: prisma/migrations/migration_lock.toml**
```toml
provider = "postgresql"
```

**File 9: prisma/seed.ts**

TypeScript seed script that:
- Imports PrismaClient from @/generated/prisma
- Creates an admin user if none exists (email from SEED_ADMIN_EMAIL or default)
- Uses bcryptjs to hash the password (12 rounds)
- Logs the credentials and reminds to change password

Run with: `npx tsx prisma/seed.ts`

After creating, run `npx prisma generate` to generate the client.
```

## Validation after build

```bash
# Generate client
npx prisma generate

# Should succeed without errors

# Apply migrations (needs DATABASE_URL)
npx prisma migrate deploy

# Should see: "6 migrations found in prisma/migrations" and apply them

# Seed initial admin
npx tsx prisma/seed.ts

# Should log: "✓ Admin user created: admin@kikovargass.com"
```
