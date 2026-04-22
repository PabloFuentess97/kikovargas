-- AlterTable: users — add per-user area override (null = use default)
ALTER TABLE "users" ADD COLUMN "allowed_areas" JSONB;

-- CreateTable: client_recipes (pivot: link, not copy)
CREATE TABLE "client_recipes" (
  "id"          TEXT NOT NULL,
  "client_id"   TEXT NOT NULL,
  "recipe_id"   TEXT NOT NULL,
  "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "client_recipes_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "client_recipes_client_id_recipe_id_key" ON "client_recipes" ("client_id", "recipe_id");
CREATE INDEX "client_recipes_client_id_idx" ON "client_recipes" ("client_id");

-- Foreign keys
ALTER TABLE "client_recipes" ADD CONSTRAINT "client_recipes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "client_recipes" ADD CONSTRAINT "client_recipes_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes" ("id") ON DELETE CASCADE ON UPDATE CASCADE;
