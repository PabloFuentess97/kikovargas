# 03 · Base de datos

## Configuración

- **Motor:** PostgreSQL 16 (Alpine en Docker)
- **ORM:** Prisma 7.7.0
- **Migraciones:** `prisma/migrations/` (6 migraciones a fecha de este documento)
- **Generated client:** `src/generated/prisma/` (gitignored, regenerado en build)
- **Schema file:** `prisma/schema.prisma`
- **Connection string:** `DATABASE_URL` env var

## Esquema Prisma completo

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ─── Enums ──────────────────────────────────────────

enum Role {
  ADMIN
  USER
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum ContactStatus {
  PENDING
  READ
  REPLIED
  ARCHIVED
}

enum CampaignStatus {
  DRAFT
  SENT
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
}

enum EventPageStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

// ─── User ───────────────────────────────────────────

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcryptjs hash, 12 rondas
  name      String
  role      Role     @default(USER)
  active    Boolean  @default(true)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  posts Post[] @relation("PostAuthor")

  @@map("users")
}

// ─── Post ───────────────────────────────────────────

model Post {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique
  excerpt     String?
  content     String     // HTML generado por TipTap
  status      PostStatus @default(DRAFT)
  publishedAt DateTime?  @map("published_at")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  authorId String @map("author_id")
  author   User   @relation("PostAuthor", fields: [authorId], references: [id], onDelete: Restrict)

  coverId String? @unique @map("cover_id")
  cover   Image?  @relation("PostCover", fields: [coverId], references: [id], onDelete: SetNull)

  images Image[] @relation("PostGallery")

  @@index([status, publishedAt])
  @@index([authorId])
  @@map("posts")
}

// ─── Image ──────────────────────────────────────────

model Image {
  id        String   @id @default(cuid())
  url       String
  key       String   @unique // nombre de archivo en storage
  alt       String   @default("")
  width     Int?
  height    Int?
  size      Int?     // bytes
  mime      String   @default("image/jpeg")
  gallery   Boolean  @default(false)  // true = aparece en galería de landing
  order     Int      @default(0)      // orden para galería
  createdAt DateTime @default(now()) @map("created_at")

  coverOf Post? @relation("PostCover")

  postId String? @map("post_id")
  post   Post?   @relation("PostGallery", fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId])
  @@index([gallery, order])
  @@map("images")
}

// ─── PageView ──────────────────────────────────────

model PageView {
  id        String   @id @default(cuid())
  path      String
  referrer  String   @default("")
  userAgent String   @default("") @map("user_agent")
  ip        String   @default("")
  country   String   @default("")
  city      String   @default("")
  device    String   @default("")
  browser   String   @default("")
  os        String   @default("")
  createdAt DateTime @default(now()) @map("created_at")

  @@index([createdAt])
  @@index([path])
  @@map("page_views")
}

// ─── SiteConfig ─────────────────────────────────────

model SiteConfig {
  key       String   @id
  value     Json
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("site_config")
}

// ─── Subscriber ─────────────────────────────────────

model Subscriber {
  id             String    @id @default(cuid())
  email          String    @unique
  name           String    @default("")
  active         Boolean   @default(true)
  confirmedAt    DateTime? @map("confirmed_at")
  unsubscribedAt DateTime? @map("unsubscribed_at")
  createdAt      DateTime  @default(now()) @map("created_at")

  @@index([active])
  @@index([createdAt])
  @@map("subscribers")
}

// ─── Campaign ───────────────────────────────────────

model Campaign {
  id        String         @id @default(cuid())
  subject   String
  content   String         // HTML
  template  String         @default("custom")  // "new_post" | "custom"
  postId    String?        @map("post_id")
  status    CampaignStatus @default(DRAFT)
  sentAt    DateTime?      @map("sent_at")
  sentCount Int            @default(0) @map("sent_count")
  createdAt DateTime       @default(now()) @map("created_at")
  updatedAt DateTime       @updatedAt @map("updated_at")

  @@index([status])
  @@index([createdAt])
  @@map("campaigns")
}

// ─── BookingLink ────────────────────────────────────

model BookingLink {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String    @default("Reserva tu cita")
  description String    @default("")
  duration    Int       @default(60)  // minutos
  active      Boolean   @default(true)
  expiresAt   DateTime? @map("expires_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  bookings Booking[]

  @@index([active])
  @@index([expiresAt])
  @@map("booking_links")
}

// ─── Booking ────────────────────────────────────────

model Booking {
  id        String        @id @default(cuid())
  date      DateTime
  duration  Int           @default(60)
  name      String
  email     String
  phone     String        @default("")
  notes     String        @default("")
  status    BookingStatus @default(CONFIRMED)
  createdAt DateTime      @default(now()) @map("created_at")
  updatedAt DateTime      @updatedAt @map("updated_at")

  linkId String      @map("link_id")
  link   BookingLink @relation(fields: [linkId], references: [id], onDelete: Cascade)

  @@index([linkId])
  @@index([date])
  @@index([status])
  @@index([email])
  @@map("bookings")
}

// ─── Availability ───────────────────────────────────

model Availability {
  id        String   @id @default(cuid())
  dayOfWeek Int      // 0 = domingo ... 6 = sábado
  startTime String   // "HH:mm"
  endTime   String   // "HH:mm"
  active    Boolean  @default(true)
  createdAt DateTime @default(now()) @map("created_at")

  @@unique([dayOfWeek])
  @@index([active])
  @@map("availability")
}

// ─── EventPage ──────────────────────────────────────

model EventPage {
  id          String          @id @default(cuid())
  slug        String          @unique
  title       String
  description String          @default("")
  status      EventPageStatus @default(DRAFT)
  template    String          @default("custom")  // "custom" | "webinar" | "fitness" | "coaching"
  createdAt   DateTime        @default(now()) @map("created_at")
  updatedAt   DateTime        @updatedAt @map("updated_at")

  blocks EventBlock[]
  leads  EventLead[]

  @@index([status])
  @@index([slug])
  @@map("event_pages")
}

model EventBlock {
  id    String @id @default(cuid())
  type  String // uno de los 14 tipos
  data  Json   // payload del bloque
  order Int    @default(0)

  pageId String    @map("page_id")
  page   EventPage @relation(fields: [pageId], references: [id], onDelete: Cascade)

  @@index([pageId, order])
  @@map("event_blocks")
}

model EventLead {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String   @default("")
  message   String   @default("")
  createdAt DateTime @default(now()) @map("created_at")

  pageId String    @map("page_id")
  page   EventPage @relation(fields: [pageId], references: [id], onDelete: Cascade)

  @@index([pageId])
  @@index([email])
  @@index([createdAt])
  @@map("event_leads")
}

// ─── KnowledgeBase ──────────────────────────────────

model KbArticle {
  id         String   @id   // formato "categoryId/articleId"
  categoryId String   @map("category_id")
  title      String
  content    String   // HTML
  sortOrder  Int      @default(0) @map("sort_order")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@index([categoryId, sortOrder])
  @@map("kb_articles")
}

model KbCategory {
  id          String   @id
  label       String
  icon        String   @default("📄")
  description String   @default("")
  sortOrder   Int      @default(0) @map("sort_order")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@index([sortOrder])
  @@map("kb_categories")
}

// ─── Contact ────────────────────────────────────────

model Contact {
  id        String        @id @default(cuid())
  name      String
  email     String
  phone     String?
  subject   String
  message   String
  status    ContactStatus @default(PENDING)
  readAt    DateTime?     @map("read_at")
  repliedAt DateTime?     @map("replied_at")
  createdAt DateTime      @default(now()) @map("created_at")

  @@index([status])
  @@index([createdAt])
  @@map("contacts")
}
```

## Modelos explicados

### `User` (tabla `users`)
Autenticación y autoría de posts.

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | `cuid` | PK |
| `email` | `String @unique` | Usado en login |
| `password` | `String` | **Hash bcryptjs, 12 rondas** |
| `role` | `Role` | `ADMIN` o `USER` — solo `ADMIN` accede al dashboard |
| `active` | `Boolean` | Soft disable, verificado en login |
| `createdAt/updatedAt` | `DateTime` | Auditoría |

**Seeding**: `prisma/seed.ts` crea un usuario `ADMIN` inicial si no existe.

### `Post` (tabla `posts`)
Artículos del blog.

| Campo | Tipo | Notas |
|-------|------|-------|
| `slug` | `String @unique` | URL friendly; regex validation en Zod |
| `excerpt` | `String?` | Max 500 chars (validado en Zod) |
| `content` | `String` | HTML de TipTap |
| `status` | `PostStatus` | `DRAFT` / `PUBLISHED` / `ARCHIVED` |
| `publishedAt` | `DateTime?` | Se setea automáticamente al pasar a `PUBLISHED` la primera vez |
| `coverId` | `String? @unique` | FK a `Image`, 1:1 |

**Cascade rules:**
- `author` → `Restrict` (no se puede borrar un User si tiene posts)
- `cover` → `SetNull` (si se borra la Image, el Post pierde cover pero persiste)
- `images` → `Cascade` (si se borra el Post, se borran sus imágenes de galería)

### `Image` (tabla `images`)
Archivos subidos.

| Campo | Tipo | Notas |
|-------|------|-------|
| `url` | `String` | Path público (ej. `/uploads/1734567-abc.jpg`) |
| `key` | `String @unique` | Nombre del archivo en disco |
| `gallery` | `Boolean` | `true` → aparece en galería pública de la landing |
| `order` | `Int` | Orden dentro de la galería |
| `postId` | `String?` | Opcional, si pertenece al array `images[]` de un post |

**Nota**: una imagen puede ser cover de un post (1:1 via `coverOf`) **y** estar en la galería del mismo o de otro post (1:N via `post`). O no estar asociada a ningún post.

### `PageView` (tabla `page_views`)
Telemetría de visitas.

Escritura via `POST /api/analytics/track` (público, fire-and-forget). Lectura via `GET /api/analytics/stats` (admin). Parsea UA con expresiones regulares simples (ver `src/app/api/analytics/track/route.ts`).

### `SiteConfig` (tabla `site_config`)
**KV store para configuración de landing y servicios**. Clave = sección (`theme`, `hero`, `about`, `ai`, `email`, etc.). Valor = JSON estructurado.

Claves conocidas (ver `src/lib/config/landing-defaults.ts`):
- `theme` — colores de marca
- `sections` — toggles on/off de secciones de landing
- `hero`, `about`, `stats`, `contact`, `social`, `navbar` — contenido
- `ai` — provider, API keys (cifradas), modelo, systemPrompt
- `email` — resendApiKey (cifrada), remitente, destinatario

**Importante**: los campos sensibles se cifran con `AES-256-GCM` antes de guardar, y se enmascaran en las respuestas del API. Ver `08-security.md`.

### `Subscriber` (tabla `subscribers`)
Lista de email newsletter.

- `active = false` indica que el usuario se desuscribió (via `GET /api/newsletter/unsubscribe`).
- No hay doble opt-in implementado (campo `confirmedAt` preparado pero sin uso).

### `Campaign` (tabla `campaigns`)
Campañas de newsletter.

- `template = "new_post"` → el render usa cover+titulo+excerpt del post referido por `postId`.
- `template = "custom"` → usa `content` HTML directamente.
- `status = "SENT"` + `sentCount` se actualiza después de un envío exitoso.

### `BookingLink` (tabla `booking_links`)
Servicios reservables.

- `slug` único → URL pública `/book/{slug}`.
- `duration` en minutos (15-480 validado en Zod).
- `expiresAt` opcional: si se supera, el slug devuelve error.
- `active = false` también desactiva el link.

### `Booking` (tabla `bookings`)
Citas individuales.

- `date`: `DateTime` con fecha+hora de inicio (UTC).
- `status = "CONFIRMED"` por defecto (no hay pending en el flujo actual).
- `linkId` → FK con `Cascade` (borrar el link elimina sus reservas).

### `Availability` (tabla `availability`)
Horario semanal recurrente.

- `dayOfWeek` (0-6) con `@@unique` → máximo 7 filas.
- `startTime`/`endTime` como strings `"HH:mm"` (no `Time` nativo, por simplicidad de parseo).
- PUT `/api/availability` reemplaza todas las filas en una transacción.

### `EventPage` / `EventBlock` / `EventLead`
Sistema de landing builder.

- `EventPage` puede tener N `EventBlock` ordenados por `order`.
- `EventBlock.type` es uno de los 14 tipos (hero, text, image, cta, etc.).
- `EventBlock.data` es JSON con el payload específico del tipo.
- `EventLead` guarda submisiones de formularios en event pages.

### `KbCategory` / `KbArticle`
Base de conocimiento editable.

- IDs no son `cuid()`, son strings deterministas (`"getting-started"`, `"getting-started/welcome"`).
- Contenido inicial en `src/app/(admin)/dashboard/knowledge/kb-content.ts` (archivo estático).
- Endpoint `POST /api/kb/seed` upserta el contenido estático en DB. Tras eso, el admin puede editar los artículos.
- El frontend lee DB si existe, con fallback al contenido estático.

### `Contact` (tabla `contacts`)
CRM simplificado.

- `source` NO está modelado explícitamente — todos los contactos entran por el mismo formulario público.
- Los leads de landing pages (`EventLead`) se duplican también a `Contact` como fire-and-forget.

## Relaciones (diagrama lógico)

```
User 1─────N Post
             │ 1
             │
             N Image (como gallery)
             │ 1:1
             │
             └ Image (como cover, @unique)

BookingLink 1─────N Booking

EventPage 1─────N EventBlock
          1─────N EventLead

(KbCategory ←── KbArticle, relación por categoryId sin FK real)

Todos los demás modelos son standalone:
Subscriber, Campaign, Availability, SiteConfig, PageView, Contact
```

## Cascades resumen

| Borrado de | Consecuencia |
|------------|--------------|
| `User` | **Restrict** — no se puede si tiene posts |
| `Post` | `images` (gallery) se borran; `cover` image se preserva con `coverId = null` |
| `Image` | Si era cover de un Post, el Post pierde cover (SetNull) |
| `BookingLink` | Todas sus `Booking` se borran (Cascade) |
| `EventPage` | Sus `EventBlock` y `EventLead` se borran (Cascade) |

## Reglas de integridad

- **Slugs únicos:** `posts`, `booking_links`, `event_pages`
- **Email único:** `users`, `subscribers`
- **DayOfWeek único:** `availability` (una fila por día máximo)
- **Cover único:** `Post.coverId @unique` (una imagen solo puede ser cover de un post)

## Migraciones

| Número | Nombre | Contenido |
|--------|--------|-----------|
| 0 | `0_init` | Schema inicial (users, posts, images, page_views, contacts + enums) |
| 1 | `1_add_site_config` | Tabla `site_config` |
| 2 | `2_add_newsletter_system` | `subscribers`, `campaigns`, enum `CampaignStatus` |
| 3 | `3_add_booking_system` | `booking_links`, `bookings`, `availability`, enum `BookingStatus` |
| 4 | `4_add_event_pages` | `event_pages`, `event_blocks`, `event_leads`, enum `EventPageStatus` |
| 5 | `5_add_knowledge_base` | `kb_categories`, `kb_articles` |

Aplicación automática: `docker-entrypoint.sh` ejecuta `prisma migrate deploy` con 5 reintentos.

## Acceso al cliente

```typescript
// Importar siempre desde el singleton
import { prisma } from "@/lib/db/prisma";

// Uso
const posts = await prisma.post.findMany({ where: { status: "PUBLISHED" } });
```

**NUNCA** crear una nueva instancia con `new PrismaClient()` en el código de la app. Rompe el pooling en hot reload y puede generar connection leaks.
