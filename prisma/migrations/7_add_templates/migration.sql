-- CreateTable: workout_templates
CREATE TABLE "workout_templates" (
  "id"          TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "category"    TEXT NOT NULL DEFAULT 'general',
  "week_day"    INTEGER,
  "exercises"   JSONB NOT NULL,
  "sort_order"  INTEGER NOT NULL DEFAULT 0,
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"  TIMESTAMP(3) NOT NULL,

  CONSTRAINT "workout_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable: diet_templates
CREATE TABLE "diet_templates" (
  "id"          TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "category"    TEXT NOT NULL DEFAULT 'general',
  "meals"       JSONB NOT NULL,
  "notes"       TEXT NOT NULL DEFAULT '',
  "sort_order"  INTEGER NOT NULL DEFAULT 0,
  "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"  TIMESTAMP(3) NOT NULL,

  CONSTRAINT "diet_templates_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "workout_templates_category_sort_order_idx" ON "workout_templates" ("category", "sort_order");
CREATE INDEX "diet_templates_category_sort_order_idx"    ON "diet_templates" ("category", "sort_order");
