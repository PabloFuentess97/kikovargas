# 03 · Actualizar la base de datos

Guía práctica para trabajar con Prisma en el proyecto.

## Conceptos clave

- **`prisma/schema.prisma`** — única fuente de verdad. Define modelos, enums, relaciones.
- **`prisma/migrations/`** — histórico de migraciones SQL. Nunca editar archivos ya aplicados.
- **`src/generated/prisma/`** — cliente TypeScript generado. Gitignored, regenerado en build.
- **`npx prisma migrate dev`** — para desarrollo. Crea migración + la aplica + regenera cliente.
- **`npx prisma migrate deploy`** — para producción. Solo aplica migraciones existentes, no crea nuevas.

## Añadir un nuevo modelo

### Ejemplo: crear modelo `Category` para categorías de blog

**1. Editar `prisma/schema.prisma`**

Añadir al final:
```prisma
model Category {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  posts Post[]

  @@map("categories")
}
```

Y modificar `Post` para la relación:
```prisma
model Post {
  // ... campos existentes
  categoryId String?   @map("category_id")
  category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  @@index([categoryId])
}
```

**2. Crear la migración**

```bash
npx prisma migrate dev --name add_categories
```

Prisma:
- Genera `prisma/migrations/YYYYMMDDHHMMSS_add_categories/migration.sql`.
- La aplica inmediatamente.
- Regenera `src/generated/prisma/`.

**3. Verificar**

```bash
cat prisma/migrations/*_add_categories/migration.sql
```

Deberías ver:
```sql
CREATE TABLE "categories" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  ...
);
ALTER TABLE "posts" ADD COLUMN "category_id" TEXT;
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_fkey" FOREIGN KEY ...;
```

**4. Usar en el código**

```typescript
import { prisma } from "@/lib/db/prisma";

const categories = await prisma.category.findMany({
  include: { _count: { select: { posts: true } } }
});
```

**5. Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add categories for posts"
```

**No commitear** `src/generated/` (gitignored).

## Modificar un modelo existente

### Añadir un campo opcional

Ejemplo: añadir `readingTime` a `Post`.

**1. Editar `schema.prisma`:**
```prisma
model Post {
  // ... existentes
  readingTime Int? @map("reading_time")  // minutos estimados
}
```

**2. Crear migración:**
```bash
npx prisma migrate dev --name add_post_reading_time
```

Migración generada:
```sql
ALTER TABLE "posts" ADD COLUMN "reading_time" INTEGER;
```

Campo opcional = sin default → registros existentes tienen `NULL`. Sin data loss.

### Añadir un campo obligatorio con valor por defecto

**1. Editar:**
```prisma
model Post {
  viewCount Int @default(0) @map("view_count")
}
```

**2. Migración:**
```bash
npx prisma migrate dev --name add_post_view_count
```

SQL:
```sql
ALTER TABLE "posts" ADD COLUMN "view_count" INTEGER NOT NULL DEFAULT 0;
```

### ⚠️ Añadir un campo obligatorio SIN default

Esto es destructivo si ya hay datos. Prisma lo detecta y te avisa.

```prisma
model Post {
  featured Boolean   // ❌ sin @default, sin ?
}
```

`prisma migrate dev` te preguntará:
```
⚠ You are about to add a new required column. Existing rows will be rejected.
? We need to reset the database. All data will be lost. Continue? (y/n)
```

**NO confirmar en producción.** Alternativas:
1. Hacerlo opcional: `featured Boolean?`
2. Añadir default: `featured Boolean @default(false)`
3. Migración manual en 3 pasos (añadir opcional → backfill → marcar obligatorio).

### Renombrar un campo

⚠️ **Prisma no detecta renames.** Ve los renames como "delete + add" → data loss.

**Solución:** migración manual:

**1. Crear migración vacía:**
```bash
npx prisma migrate dev --create-only --name rename_post_excerpt_to_summary
```

**2. Editar `migration.sql` manualmente:**
```sql
ALTER TABLE "posts" RENAME COLUMN "excerpt" TO "summary";
```

**3. Actualizar `schema.prisma`:**
```prisma
model Post {
  summary String?  // antes era excerpt
}
```

**4. Aplicar:**
```bash
npx prisma migrate dev
```

**5. Actualizar código TypeScript** para usar `summary` en vez de `excerpt`.

## Aplicar migraciones en diferentes entornos

### Local (development)

```bash
npx prisma migrate dev
```

Interactivo. Si detecta drift (el schema de DB no coincide con las migraciones), te ofrece reset.

### Producción (docker-entrypoint)

**Automático.** El `docker-entrypoint.sh` ejecuta en cada arranque:
```bash
node ./node_modules/prisma/build/index.js migrate deploy --schema=./prisma/schema.prisma
```

`deploy` (vs `dev`):
- No interactivo.
- Solo aplica migraciones no aplicadas.
- No genera nuevas migraciones.
- No resetea la DB.
- Falla si detecta drift.

### Staging (si existiera)

Mismo que producción:
```bash
npx prisma migrate deploy
```

## Estado de las migraciones

### Ver cuáles están aplicadas

```bash
npx prisma migrate status
```

Salida:
```
6 migrations found in prisma/migrations
Database schema is up to date!

Or:

Following migrations have not yet been applied:
- 20260415193000_add_categories
```

### Ver qué hay en la tabla de migraciones

```bash
docker compose exec db psql -U postgres -d kikovargass -c "SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;"
```

## Rollback de migraciones

**Prisma no soporta rollback automático.** Estrategias:

### Opción A — Revert en código y nueva migración forward

1. Editar `schema.prisma` revirtiendo los cambios.
2. `npx prisma migrate dev --name revert_xxx`.
3. Commit.
4. Deploy.

### Opción B — SQL manual

Si urge:
```bash
docker compose exec db psql -U postgres -d kikovargass

# Ejecutar el SQL inverso manualmente
DROP TABLE categories;
ALTER TABLE posts DROP COLUMN category_id;

# Borrar el registro de la migración aplicada
DELETE FROM _prisma_migrations WHERE migration_name = '20260415193000_add_categories';
```

**Luego:** borrar la carpeta de migración en `prisma/migrations/`. Si no, el próximo `prisma migrate` la re-aplicará.

### Opción C — Reset completo (🔥 destructivo)

```bash
# ⚠️ BORRA TODOS LOS DATOS
docker compose down -v
docker compose up -d
# El entrypoint aplica todas las migraciones desde cero en el DB vacío
docker compose exec app npx tsx prisma/seed.ts
```

**Solo en dev.** Nunca en producción con datos reales.

## Cliente Prisma — regenerar

Tras cualquier cambio en `schema.prisma`:

```bash
npx prisma generate
```

Crea/actualiza `src/generated/prisma/`.

**Dónde se regenera automáticamente:**
- `npx prisma migrate dev` lo incluye.
- Docker build (stage 2) incluye `npx prisma generate`.

**Dónde NO se regenera:**
- `npx prisma migrate deploy` (producción) — solo aplica SQL, no regenera.

## Seed (datos iniciales)

### El seed actual

**Archivo:** `prisma/seed.ts`

```typescript
import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@kikovargass.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "changeme12345678";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: "Admin",
      role: "ADMIN"
    }
  });

  console.log(`✓ Admin user created: ${email}`);
  console.log(`  Temp password: ${password}`);
  console.log(`  IMPORTANT: change this immediately after first login!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Ejecutar:**
```bash
npx tsx prisma/seed.ts
```

Idempotente — si el admin ya existe, no hace nada.

### Añadir más seeds

Ejemplo: seedear categorías:

```typescript
// Al final de main(), antes del disconnect:

const categories = [
  { slug: "nutricion", name: "Nutrición" },
  { slug: "entrenamiento", name: "Entrenamiento" },
  { slug: "competiciones", name: "Competiciones" }
];

for (const cat of categories) {
  await prisma.category.upsert({
    where: { slug: cat.slug },
    create: cat,
    update: {}
  });
}
```

### Seed de SiteConfig

No hay seed de config actual. Los defaults del código son el fallback. Si quieres forzar la creación inicial de registros:

```typescript
import { DEFAULT_CONFIG, CONFIG_KEYS } from "../src/lib/config/landing-defaults";

for (const key of CONFIG_KEYS) {
  await prisma.siteConfig.upsert({
    where: { key },
    create: { key, value: DEFAULT_CONFIG[key] },
    update: {}
  });
}
```

## Prisma Studio

GUI web para ver y editar la DB sin SQL.

```bash
npm run db:studio
# o: npx prisma studio
```

Abre http://localhost:5555. Puedes:
- Ver todas las tablas y filas.
- Crear/editar/borrar registros.
- Filtrar por campos.
- Ver relaciones.

**Cuidado:** las operaciones son inmediatas, no hay undo. No úsalo en producción a menos que sepas exactamente qué haces.

## Queries útiles para debug

### Ver tamaño de cada tabla

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;
```

### Contar registros en cada tabla

```sql
SELECT
  'users' AS tbl, COUNT(*) FROM users
UNION ALL SELECT 'posts', COUNT(*) FROM posts
UNION ALL SELECT 'images', COUNT(*) FROM images
UNION ALL SELECT 'contacts', COUNT(*) FROM contacts
UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL SELECT 'subscribers', COUNT(*) FROM subscribers
UNION ALL SELECT 'page_views', COUNT(*) FROM page_views;
```

### Ver configuración cifrada

```sql
SELECT key, value FROM site_config WHERE key IN ('ai', 'email');
```

Los campos sensibles aparecerán como `"enc:<iv>:<tag>:<data>"`.

### Últimos visitantes

```sql
SELECT path, country, device, browser, created_at
FROM page_views
ORDER BY created_at DESC
LIMIT 20;
```

### Leads de una event page

```sql
SELECT el.*, ep.title AS page_title
FROM event_leads el
JOIN event_pages ep ON ep.id = el.page_id
WHERE ep.slug = 'mi-webinar'
ORDER BY el.created_at DESC;
```

## Índices y performance

### Ver índices existentes

```sql
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Añadir un índice

Editar `schema.prisma`:
```prisma
model Post {
  // ...
  @@index([publishedAt, status])  // compuesto
}
```

Crear migración:
```bash
npx prisma migrate dev --name add_post_index
```

### Analizar una query lenta

```sql
EXPLAIN ANALYZE
SELECT * FROM posts
WHERE status = 'PUBLISHED'
ORDER BY published_at DESC
LIMIT 10;
```

Si `Seq Scan` aparece sobre una tabla grande → falta índice.

## Backup antes de cambios importantes

Siempre antes de tocar producción:

```bash
# En el VPS
cd /opt/kikovargas
docker compose exec -T db pg_dump -U postgres kikovargass | gzip > pre-migration-$(date +%Y%m%d-%H%M).sql.gz
```

Si algo sale mal:
```bash
gunzip -c pre-migration-YYYYMMDD-HHMM.sql.gz | docker compose exec -T db psql -U postgres kikovargass
```

## Troubleshooting

### "Environment variable not found: DATABASE_URL"

```bash
cat .env | grep DATABASE_URL
# Si está vacío: rellenar en .env
# Si está bien: reiniciar terminal (las env vars no se recargan automáticamente)
```

### "Drift detected: Your database schema is not in sync with your migration history"

Algo se cambió directamente en DB (via psql/Studio) sin crear una migración.

**Opciones:**
1. Reset (dev): `npx prisma migrate reset`.
2. Crear migración manual que refleje el cambio: `npx prisma migrate dev --create-only`.

### "Cannot find module '@/generated/prisma'"

```bash
npx prisma generate
```

### "Database connection failed"

```bash
# Verifica que el DB está corriendo
docker compose ps
# Si "exited": revisar logs
docker compose logs db

# Verifica que la URL es correcta
echo $DATABASE_URL   # o cat .env | grep DATABASE_URL
# Probar conexión manualmente
docker compose exec db psql -U postgres -d kikovargass -c "SELECT 1"
```

### Migrate pending en producción

```bash
# En el VPS
cd /opt/kikovargas
docker compose exec app npx prisma migrate status

# Aplicar manualmente si el entrypoint falló por algún motivo:
docker compose exec app npx prisma migrate deploy
```

Ver más en [`04-debugging.md`](./04-debugging.md).
