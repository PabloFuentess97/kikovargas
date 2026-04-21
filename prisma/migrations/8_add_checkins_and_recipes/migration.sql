-- AlterTable: users — add height for BMI calculation
ALTER TABLE "users" ADD COLUMN "height_cm" INTEGER;

-- CreateTable: client_checkins
CREATE TABLE "client_checkins" (
  "id"                TEXT NOT NULL,
  "client_id"         TEXT NOT NULL,
  "date"              TIMESTAMP(3) NOT NULL,
  "weight_kg"         DOUBLE PRECISION,
  "photo_front_url"   TEXT,
  "photo_front_key"   TEXT,
  "photo_side_url"    TEXT,
  "photo_side_key"    TEXT,
  "photo_back_url"    TEXT,
  "photo_back_key"    TEXT,
  "notes"             TEXT NOT NULL DEFAULT '',
  "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "client_checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable: recipes
CREATE TABLE "recipes" (
  "id"           TEXT NOT NULL,
  "title"        TEXT NOT NULL,
  "description"  TEXT NOT NULL DEFAULT '',
  "category"     TEXT NOT NULL DEFAULT 'general',
  "servings"     INTEGER NOT NULL DEFAULT 1,
  "prep_time_min" INTEGER,
  "cook_time_min" INTEGER,
  "allergens"    JSONB NOT NULL DEFAULT '[]',
  "ingredients"  JSONB NOT NULL,
  "steps"        JSONB NOT NULL,
  "macros"       JSONB NOT NULL DEFAULT '{}',
  "ai_generated" BOOLEAN NOT NULL DEFAULT false,
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "client_checkins_client_id_date_idx" ON "client_checkins" ("client_id", "date");
CREATE INDEX "recipes_category_created_at_idx"    ON "recipes" ("category", "created_at");

-- Foreign keys
ALTER TABLE "client_checkins" ADD CONSTRAINT "client_checkins_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
