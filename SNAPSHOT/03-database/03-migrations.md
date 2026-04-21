# Database — Migrations

All 6 migrations in `prisma/migrations/`. Run automatically by `docker-entrypoint.sh` on container start.

## Migration 0 — `0_init/migration.sql`

Creates the foundational schema: users, posts, images, page_views, contacts.

```sql
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ContactStatus" AS ENUM ('PENDING', 'READ', 'REPLIED', 'ARCHIVED');

-- CreateTable users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable posts
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "author_id" TEXT NOT NULL,
    "cover_id" TEXT,
    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable images
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "width" INTEGER,
    "height" INTEGER,
    "size" INTEGER,
    "mime" TEXT NOT NULL DEFAULT 'image/jpeg',
    "gallery" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "post_id" TEXT,
    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable page_views
CREATE TABLE "page_views" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT NOT NULL DEFAULT '',
    "user_agent" TEXT NOT NULL DEFAULT '',
    "ip" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "device" TEXT NOT NULL DEFAULT '',
    "browser" TEXT NOT NULL DEFAULT '',
    "os" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable contacts
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'PENDING',
    "read_at" TIMESTAMP(3),
    "replied_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");
CREATE UNIQUE INDEX "posts_cover_id_key" ON "posts"("cover_id");
CREATE INDEX "posts_status_published_at_idx" ON "posts"("status", "published_at");
CREATE INDEX "posts_author_id_idx" ON "posts"("author_id");
CREATE UNIQUE INDEX "images_key_key" ON "images"("key");
CREATE INDEX "images_post_id_idx" ON "images"("post_id");
CREATE INDEX "images_gallery_order_idx" ON "images"("gallery", "order");
CREATE INDEX "page_views_created_at_idx" ON "page_views"("created_at");
CREATE INDEX "page_views_path_idx" ON "page_views"("path");
CREATE INDEX "contacts_status_idx" ON "contacts"("status");
CREATE INDEX "contacts_created_at_idx" ON "contacts"("created_at");

-- Foreign keys
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey"
    FOREIGN KEY ("author_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_id_fkey"
    FOREIGN KEY ("cover_id") REFERENCES "images"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "images" ADD CONSTRAINT "images_post_id_fkey"
    FOREIGN KEY ("post_id") REFERENCES "posts"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
```

## Migration 1 — `1_add_site_config/migration.sql`

Key-value JSON store for landing configuration.

```sql
CREATE TABLE "site_config" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "site_config_pkey" PRIMARY KEY ("key")
);
```

## Migration 2 — `2_add_newsletter_system/migration.sql`

```sql
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SENT');

CREATE TABLE "subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "confirmed_at" TIMESTAMP(3),
    "unsubscribed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "template" TEXT NOT NULL DEFAULT 'custom',
    "post_id" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "sent_at" TIMESTAMP(3),
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");
CREATE INDEX "subscribers_active_idx" ON "subscribers"("active");
CREATE INDEX "subscribers_created_at_idx" ON "subscribers"("created_at");
CREATE INDEX "campaigns_status_idx" ON "campaigns"("status");
CREATE INDEX "campaigns_created_at_idx" ON "campaigns"("created_at");
```

## Migration 3 — `3_add_booking_system/migration.sql`

```sql
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

CREATE TABLE "booking_links" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Reserva tu cita',
    "description" TEXT NOT NULL DEFAULT '',
    "duration" INTEGER NOT NULL DEFAULT 60,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "booking_links_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "link_id" TEXT NOT NULL,
    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "availability" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "availability_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "booking_links_slug_key" ON "booking_links"("slug");
CREATE INDEX "booking_links_active_idx" ON "booking_links"("active");
CREATE INDEX "booking_links_expires_at_idx" ON "booking_links"("expires_at");

CREATE INDEX "bookings_link_id_idx" ON "bookings"("link_id");
CREATE INDEX "bookings_date_idx" ON "bookings"("date");
CREATE INDEX "bookings_status_idx" ON "bookings"("status");
CREATE INDEX "bookings_email_idx" ON "bookings"("email");

CREATE UNIQUE INDEX "availability_dayOfWeek_key" ON "availability"("dayOfWeek");
CREATE INDEX "availability_active_idx" ON "availability"("active");

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_link_id_fkey"
    FOREIGN KEY ("link_id") REFERENCES "booking_links"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
```

## Migration 4 — `4_add_event_pages/migration.sql`

```sql
CREATE TYPE "EventPageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "event_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" "EventPageStatus" NOT NULL DEFAULT 'DRAFT',
    "template" TEXT NOT NULL DEFAULT 'custom',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "event_pages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "event_blocks" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "page_id" TEXT NOT NULL,
    CONSTRAINT "event_blocks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "event_leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "page_id" TEXT NOT NULL,
    CONSTRAINT "event_leads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "event_pages_slug_key" ON "event_pages"("slug");
CREATE INDEX "event_pages_status_idx" ON "event_pages"("status");
CREATE INDEX "event_pages_slug_idx" ON "event_pages"("slug");
CREATE INDEX "event_blocks_page_id_order_idx" ON "event_blocks"("page_id", "order");
CREATE INDEX "event_leads_page_id_idx" ON "event_leads"("page_id");
CREATE INDEX "event_leads_email_idx" ON "event_leads"("email");
CREATE INDEX "event_leads_created_at_idx" ON "event_leads"("created_at");

ALTER TABLE "event_blocks" ADD CONSTRAINT "event_blocks_page_id_fkey"
    FOREIGN KEY ("page_id") REFERENCES "event_pages"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "event_leads" ADD CONSTRAINT "event_leads_page_id_fkey"
    FOREIGN KEY ("page_id") REFERENCES "event_pages"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
```

## Migration 5 — `5_add_knowledge_base/migration.sql`

```sql
CREATE TABLE "kb_categories" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '📄',
    "description" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "kb_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "kb_articles" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "kb_articles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "kb_categories_sort_order_idx" ON "kb_categories"("sort_order");
CREATE INDEX "kb_articles_category_id_sort_order_idx" ON "kb_articles"("category_id", "sort_order");
```

## migration_lock.toml

```toml
provider = "postgresql"
```

## Running Migrations

Automatically executed on container startup by `docker-entrypoint.sh`:
```sh
node ./node_modules/prisma/build/index.js migrate deploy --schema=./prisma/schema.prisma
```

Up to 5 retries with 5-second intervals.
