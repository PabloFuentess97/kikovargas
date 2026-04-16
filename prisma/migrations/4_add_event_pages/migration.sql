-- CreateEnum
CREATE TYPE "EventPageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable: event_pages
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

-- CreateTable: event_blocks
CREATE TABLE "event_blocks" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "page_id" TEXT NOT NULL,

    CONSTRAINT "event_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable: event_leads
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

-- CreateIndex
CREATE UNIQUE INDEX "event_pages_slug_key" ON "event_pages"("slug");
CREATE INDEX "event_pages_status_idx" ON "event_pages"("status");
CREATE INDEX "event_pages_slug_idx" ON "event_pages"("slug");

CREATE INDEX "event_blocks_page_id_order_idx" ON "event_blocks"("page_id", "order");

CREATE INDEX "event_leads_page_id_idx" ON "event_leads"("page_id");
CREATE INDEX "event_leads_email_idx" ON "event_leads"("email");
CREATE INDEX "event_leads_created_at_idx" ON "event_leads"("created_at");

-- AddForeignKeys
ALTER TABLE "event_blocks" ADD CONSTRAINT "event_blocks_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "event_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "event_leads" ADD CONSTRAINT "event_leads_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "event_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
