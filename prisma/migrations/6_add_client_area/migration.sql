-- CreateEnum
CREATE TYPE "WorkoutStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "TaskCategory" AS ENUM ('DAILY', 'WEEKLY', 'GENERAL');
CREATE TYPE "DocumentUploader" AS ENUM ('COACH', 'CLIENT');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'PENDING', 'PAID', 'CANCELLED', 'OVERDUE');

-- AlterTable: users (add client-specific columns)
ALTER TABLE "users" ADD COLUMN "phone" TEXT;
ALTER TABLE "users" ADD COLUMN "birth_date" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "started_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "monthly_fee" INTEGER;
ALTER TABLE "users" ADD COLUMN "notes" TEXT DEFAULT '';

-- CreateTable: workouts
CREATE TABLE "workouts" (
  "id"          TEXT NOT NULL,
  "client_id"   TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "status"      "WorkoutStatus" NOT NULL DEFAULT 'ACTIVE',
  "week_day"    INTEGER,
  "exercises"   JSONB NOT NULL,
  "sort_order"  INTEGER NOT NULL DEFAULT 0,
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"  TIMESTAMP(3) NOT NULL,

  CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: client_tasks
CREATE TABLE "client_tasks" (
  "id"           TEXT NOT NULL,
  "client_id"    TEXT NOT NULL,
  "title"        TEXT NOT NULL,
  "description"  TEXT NOT NULL DEFAULT '',
  "completed"    BOOLEAN NOT NULL DEFAULT false,
  "completed_at" TIMESTAMP(3),
  "category"     "TaskCategory" NOT NULL DEFAULT 'GENERAL',
  "due_date"     TIMESTAMP(3),
  "sort_order"   INTEGER NOT NULL DEFAULT 0,
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "client_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable: client_documents
CREATE TABLE "client_documents" (
  "id"          TEXT NOT NULL,
  "client_id"   TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "file_url"    TEXT NOT NULL,
  "file_key"    TEXT NOT NULL,
  "file_size"   INTEGER NOT NULL,
  "file_mime"   TEXT NOT NULL,
  "uploaded_by" "DocumentUploader" NOT NULL DEFAULT 'COACH',
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "client_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable: diets
CREATE TABLE "diets" (
  "id"          TEXT NOT NULL,
  "client_id"   TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "start_date"  TIMESTAMP(3),
  "end_date"    TIMESTAMP(3),
  "active"      BOOLEAN NOT NULL DEFAULT true,
  "meals"       JSONB NOT NULL,
  "notes"       TEXT NOT NULL DEFAULT '',
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"  TIMESTAMP(3) NOT NULL,

  CONSTRAINT "diets_pkey" PRIMARY KEY ("id")
);

-- CreateTable: invoices
CREATE TABLE "invoices" (
  "id"         TEXT NOT NULL,
  "client_id"  TEXT NOT NULL,
  "number"     TEXT NOT NULL,
  "concept"    TEXT NOT NULL,
  "amount"     INTEGER NOT NULL,
  "currency"   TEXT NOT NULL DEFAULT 'EUR',
  "status"     "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
  "issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "due_date"   TIMESTAMP(3),
  "paid_at"    TIMESTAMP(3),
  "pdf_url"    TEXT,
  "notes"      TEXT NOT NULL DEFAULT '',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "workouts_client_id_status_idx"          ON "workouts" ("client_id", "status");
CREATE INDEX "client_tasks_client_id_completed_idx"   ON "client_tasks" ("client_id", "completed");
CREATE INDEX "client_documents_client_id_idx"         ON "client_documents" ("client_id");
CREATE INDEX "diets_client_id_active_idx"             ON "diets" ("client_id", "active");
CREATE INDEX "invoices_client_id_status_idx"          ON "invoices" ("client_id", "status");
CREATE INDEX "invoices_status_due_date_idx"           ON "invoices" ("status", "due_date");
CREATE UNIQUE INDEX "invoices_number_key"             ON "invoices" ("number");

-- Foreign keys
ALTER TABLE "workouts"         ADD CONSTRAINT "workouts_client_id_fkey"         FOREIGN KEY ("client_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "client_tasks"     ADD CONSTRAINT "client_tasks_client_id_fkey"     FOREIGN KEY ("client_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "client_documents" ADD CONSTRAINT "client_documents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "diets"            ADD CONSTRAINT "diets_client_id_fkey"            FOREIGN KEY ("client_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invoices"         ADD CONSTRAINT "invoices_client_id_fkey"         FOREIGN KEY ("client_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
