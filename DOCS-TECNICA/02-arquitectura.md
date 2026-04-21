# 02 · Arquitectura

## Estructura de carpetas

```
kikovargass/
├── .claude/                    # Configuración de Claude Code (skills, settings)
├── .env                        # Variables de entorno (gitignored)
├── .env.example                # Plantilla de variables
├── .dockerignore
├── .gitignore
├── AGENTS.md                   # Notas para Claude Code
├── CLAUDE.md                   # Alias a AGENTS.md
├── Dockerfile                  # Multi-stage build (deps, builder, runner)
├── docker-compose.yml          # Servicios db + app
├── docker-entrypoint.sh        # Pre-start: validación env + wait DB + migrate deploy
├── DEPLOYMENT.md               # Notas de despliegue manual
├── README.md
├── eslint.config.mjs
├── next.config.ts              # { output: "standalone" }
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── prisma.config.ts            # Cargado por Prisma CLI
├── tsconfig.json
├── tsconfig.tsbuildinfo        # Cache de TypeScript
│
├── prisma/
│   ├── schema.prisma           # Única fuente de verdad del schema
│   ├── seed.ts                 # Seed inicial (crea usuario admin)
│   └── migrations/
│       ├── migration_lock.toml # provider = "postgresql"
│       ├── 0_init/migration.sql
│       ├── 1_add_site_config/migration.sql
│       ├── 2_add_newsletter_system/migration.sql
│       ├── 3_add_booking_system/migration.sql
│       ├── 4_add_event_pages/migration.sql
│       └── 5_add_knowledge_base/migration.sql
│
├── public/
│   ├── images/                 # Imágenes estáticas (hero-bg, about-portrait)
│   └── uploads/                # Destino de uploads (volumen Docker)
│
├── uploads/                    # Bind mount de host → /app/public/uploads
│
└── src/
    ├── app/                    # App Router (Next.js 16)
    │   ├── layout.tsx          # Root layout (fuentes, metadata, PageTracker)
    │   ├── globals.css         # Design system completo
    │   ├── icon.svg            # Favicon
    │   ├── not-found.tsx
    │   │
    │   ├── (landing)/          # Route group — layout público
    │   │   ├── layout.tsx      # Navbar + Footer
    │   │   ├── page.tsx        # Home
    │   │   ├── blog/
    │   │   ├── gallery/
    │   │   ├── privacy/
    │   │   ├── cookies/
    │   │   └── terms/
    │   │
    │   ├── (admin)/            # Route group — layout admin
    │   │   ├── layout.tsx      # requireAdmin() + AdminSidebar + data-theme="admin"
    │   │   ├── admin-sidebar.tsx
    │   │   └── dashboard/
    │   │       ├── page.tsx    # Dashboard principal
    │   │       ├── analytics/
    │   │       ├── posts/
    │   │       ├── ideas/
    │   │       ├── gallery/
    │   │       ├── newsletter/
    │   │       ├── subscribers/
    │   │       ├── booking-links/
    │   │       ├── bookings/
    │   │       ├── availability/
    │   │       ├── event-pages/
    │   │       ├── knowledge/
    │   │       ├── contacts/
    │   │       ├── users/
    │   │       └── settings/
    │   │
    │   ├── (auth)/             # Route group — layout minimal
    │   │   └── login/
    │   │
    │   ├── book/[slug]/        # Página pública de reserva
    │   ├── event/[slug]/       # Página pública de evento (landing builder)
    │   │
    │   └── api/                # Route handlers
    │       ├── auth/
    │       ├── users/
    │       ├── posts/
    │       ├── contacts/
    │       ├── images/
    │       ├── gallery/
    │       ├── upload/
    │       ├── uploads/[...path]/
    │       ├── newsletter/
    │       ├── bookings/
    │       ├── booking-links/
    │       ├── availability/
    │       ├── event-pages/
    │       ├── event-leads/
    │       ├── ai/
    │       ├── analytics/
    │       ├── config/
    │       └── kb/
    │
    ├── components/
    │   ├── analytics/          # PageTracker client-side
    │   ├── cookie-banner/
    │   ├── admin/
    │   │   └── ui/             # Primitivos UI admin (Button, Card, Badge, Table, Form, StatCard, PageHeader, EmptyState, ProgressBar, InfoRow, index)
    │   ├── landing/            # Secciones de la landing pública
    │   │   ├── hero-section.tsx
    │   │   ├── navbar.tsx
    │   │   ├── footer.tsx
    │   │   ├── about-section.tsx
    │   │   ├── stats-bar.tsx
    │   │   ├── gallery-section.tsx
    │   │   ├── gallery-grid.tsx
    │   │   ├── achievements-section.tsx
    │   │   ├── blog-section.tsx
    │   │   ├── blog-cards.tsx
    │   │   ├── contact-section.tsx
    │   │   ├── newsletter-section.tsx
    │   │   ├── divider.tsx
    │   │   ├── section-wrapper.tsx
    │   │   ├── legal-layout.tsx
    │   │   └── theme-provider.tsx
    │   └── event-blocks/       # Sistema de bloques para event pages
    │       ├── types.ts        # BLOCK_TYPES, BLOCK_LABELS, BLOCK_DEFAULTS, interfaces
    │       ├── block-renderer.tsx
    │       └── blocks/         # 14 componentes de bloque
    │
    ├── generated/              # GITIGNORED
    │   └── prisma/             # Cliente Prisma generado
    │
    ├── lib/
    │   ├── api-response.ts     # helpers success() / error()
    │   ├── animations.ts       # cubic-bezier compartido
    │   ├── crypto.ts           # AES-256-GCM encrypt/decrypt/mask
    │   ├── event-templates.ts  # Plantillas webinar/fitness/coaching
    │   ├── auth/
    │   │   ├── jwt.ts          # signToken / verifyToken
    │   │   └── session.ts      # getSession / requireAdmin
    │   ├── config/
    │   │   ├── landing-defaults.ts   # Defaults para las 10 secciones
    │   │   └── get-config.ts         # Merge defaults + DB + decrypt
    │   ├── db/
    │   │   └── prisma.ts       # Singleton del cliente
    │   ├── email/              # Templates y sender Resend
    │   └── validations/        # Schemas Zod (auth, post, contact, image)
    │
    └── middleware.ts           # Matcher + allowlist de rutas públicas
```

## Separación frontend / backend

Todo vive en el mismo proyecto Next.js. No hay servidor Express separado. Pero sí hay una separación lógica estricta:

### Backend (server-side)
- **Route handlers** en `src/app/api/*` — puros endpoints HTTP. Cada `route.ts` exporta funciones nombradas (`GET`, `POST`, `PATCH`, `DELETE`, `PUT`).
- **Server Components** en `src/app/**/page.tsx` (excepto los marcados `"use client"`).
- **Librerías server-only** en `src/lib/` — acceso a DB via Prisma, cifrado, JWT, envío de email.
- **Middleware** en `src/middleware.ts` — se ejecuta en Edge runtime (`next-server/middleware`).

### Frontend (client-side)
- Componentes marcados con `"use client"` en la primera línea.
- Interactividad: formularios, drag-and-drop, modales, TipTap editor, mobile menu, lightbox.
- Fetch calls a `/api/*` para mutaciones.
- Animaciones con framer-motion.

### Convención
Server Components fetchean datos y los pasan como props a Client Components. Los Client Components nunca importan de `src/lib/db/*` ni de `src/lib/auth/session.ts` (fallarían en build).

## Módulos clave

### `src/middleware.ts`
Gate de autenticación. Ejecuta JWT verification en cada request no listado en `PUBLIC_PATHS`. Redirige a `/login?callbackUrl=<original>` si no hay sesión. Redirige a `/dashboard` si un usuario autenticado visita `/login`.

### `src/lib/db/prisma.ts`
Singleton del cliente Prisma. Previene múltiples instancias en desarrollo (hot reload) via `globalThis.__prisma`.

```typescript
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };
export const prisma = globalForPrisma.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.__prisma = prisma;
```

### `src/lib/auth/session.ts`
```typescript
export async function getSession(): Promise<JwtPayload | null>;
export async function requireAdmin(): Promise<JwtPayload>;  // throws si no ADMIN
```

Se importa en todas las páginas admin (Server Components) y en todos los route handlers admin.

### `src/lib/api-response.ts`
Contrato estándar de respuesta:
```typescript
export function success<T>(data: T, status = 200);  // { success: true, data }
export function error(message: string, status = 400);  // { success: false, error }
```

### `src/lib/crypto.ts`
AES-256-GCM con scrypt-derived key. Expone: `encrypt`, `decrypt`, `isEncrypted`, `maskSecret`, `encryptSensitiveFields`, `decryptSensitiveFields`, `maskSensitiveFields`.

### `src/lib/config/get-config.ts`
```typescript
export async function getLandingConfig(): Promise<LandingConfig>;
```
Lee los 10 registros de `site_config`, los mergea con los defaults de `landing-defaults.ts`, descifra campos sensibles (API keys). Server-only.

### `src/components/event-blocks/block-renderer.tsx`
Dispatcher central que mapea `type: string` a componente React. Usado en `/event/[slug]/page.tsx` para renderizar landing pages dinámicamente.

## Flujo de datos típico

Ejemplo: usuario rellena el formulario de contacto en la landing.

```
1. Usuario envía POST /api/contacts (client-side fetch)
2. middleware.ts — ruta pública, pass-through
3. Route handler (src/app/api/contacts/route.ts):
   a. Valida body con createContactSchema (Zod)
   b. prisma.contact.create(...)
   c. Dispara email de notificación (fire-and-forget)
   d. Retorna { success: true, data: { id } }
4. Client component muestra pantalla de éxito
5. Background: sendContactNotification() llega al admin
```

Ejemplo: admin publica un post.

```
1. Server Component /dashboard/posts/[id] carga post via Prisma
2. Pasa data a <PostForm mode="edit" initialData={post} /> (client)
3. Usuario edita. Submit → PATCH /api/posts/[id]
4. middleware.ts — protegida, verifica token cookie
5. Route handler:
   a. requireAdmin() — lanza si no es admin
   b. Valida body con updatePostSchema
   c. prisma.post.update(...) — si pasa a PUBLISHED, set publishedAt
   d. Retorna data actualizada
6. Client component llama router.refresh()
7. Server Component re-ejecuta fetch, UI actualizada
```

## Route groups (Next.js App Router)

Usamos 3 route groups con paréntesis:

- `(landing)` — Layout público con Navbar y Footer. Incluye `/`, `/blog`, `/gallery`, legales.
- `(admin)` — Layout con sidebar y guard `requireAdmin()`. Todo el dashboard.
- `(auth)` — Layout minimal centrado. Solo `/login`.

Rutas fuera de route groups: `book/[slug]`, `event/[slug]` (sin navbar/footer, solo contenido).

## Cómo se testea localmente

Sin tests automatizados. El flujo manual:

```bash
cp .env.example .env       # completar valores
docker compose up -d db    # solo la DB
npx prisma migrate deploy
npx tsx prisma/seed.ts
npm run dev                # http://localhost:3000
```

O todo el stack con Docker:
```bash
docker compose up -d
docker compose logs -f app
```
