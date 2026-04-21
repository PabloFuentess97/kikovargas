# 15 · Mejoras futuras

Roadmap técnico de oportunidades de refactor, escalabilidad y nuevas features. Organizado por prioridad y tipo.

## Prioridad alta — Necesario antes de scale

### 1. Tests automatizados

**Por qué:** sin tests, cualquier refactor es arriesgado. El código ya tiene complejidad (crypto, availability conflict, event blocks) que amerita verificación.

**Propuesta:**
- **Unit** con Vitest:
  - `src/lib/crypto.ts` — round-trip encrypt/decrypt, masking.
  - `src/lib/validations/*` — schemas con inputs válidos e inválidos.
  - `src/lib/config/get-config.ts` — merge defaults + DB.
  - Utilidades de availability (cálculo de slots libres).
- **Integration** con Vitest + test DB:
  - Endpoints de auth, posts, bookings.
  - Workflow de campaña (crear → enviar → status).
- **E2E** con Playwright:
  - Login → navegar dashboard → crear post → publicar → verificar en landing.
  - Flujo completo de booking desde página pública.

**Esfuerzo:** 2-3 semanas.

### 2. Rate limiting

Ver `14-known-issues.md` sección 2. Esencial para producción.

**Propuesta concreta:**
```typescript
// src/lib/ratelimit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const authLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 m"),   // 5 intentos / 10 min
  analytics: true
});

export const contactLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 h")     // 3 formularios / hora por IP
});
```

Aplicar en endpoints críticos:
```typescript
const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
const { success } = await authLimiter.limit(ip);
if (!success) return error("Demasiados intentos. Espera 10 min.", 429);
```

**Esfuerzo:** 2-3 días (+ setup Upstash).

### 3. Headers de seguridad

Añadir a `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }
      ]
    }];
  }
};
```

CSP por separado (requiere nonces — complejo).

**Esfuerzo:** 1 día.

### 4. Password reset flow

Endpoints:
- `POST /api/auth/request-password-reset` — body `{ email }`. Crea token en tabla `password_reset_tokens`, envía email.
- `POST /api/auth/reset-password` — body `{ token, newPassword }`. Valida token, actualiza password, invalida token.

Tabla nueva:
```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  @@index([token])
}
```

**Esfuerzo:** 2-3 días.

### 5. Magic bytes check en uploads

```typescript
async function validateMagicBytes(buffer: Buffer, mime: string): Promise<boolean> {
  const header = buffer.subarray(0, 12);

  const signatures: Record<string, number[][]> = {
    "image/jpeg": [[0xff, 0xd8, 0xff]],
    "image/png":  [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    "image/webp": [[0x52, 0x49, 0x46, 0x46]] // RIFF at offset 0 + "WEBP" at offset 8
  };

  const sigs = signatures[mime];
  if (!sigs) return false;
  return sigs.some(sig => sig.every((byte, i) => header[i] === byte));
}
```

Aplicar en `POST /api/upload` antes de escribir al disco.

**Esfuerzo:** 1 día.

## Prioridad media — Calidad de vida

### 6. Background jobs / queue

**Por qué:** envíos de newsletter con 3.000+ destinatarios bloquean el handler HTTP (timeout del reverse proxy). Los fire-and-forget actuales tampoco son robustos.

**Propuesta:**
- **BullMQ** sobre Redis.
- Workers separados para: envío de newsletters, generación batch de IA, limpieza de uploads huérfanos.
- Endpoint `POST /api/newsletter/campaigns/send` encola el job y retorna 202 Accepted.
- Admin UI consulta estado del job.

**Esfuerzo:** 1 semana.

### 7. Logs estructurados

```typescript
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: process.env.NODE_ENV === "production"
    ? undefined
    : { target: "pino-pretty" }
});

// Uso:
logger.info({ userId, action: "post.create" }, "Post created");
logger.error({ err, postId }, "Failed to publish post");
```

Integrar con Logtail, Datadog o similar para centralización.

**Esfuerzo:** 2 días (+ config de servicio externo).

### 8. Métricas y observabilidad

Endpoint `/api/metrics` en formato Prometheus:
```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/api/posts",status="200"} 1247

# HELP http_request_duration_seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{route="/api/posts",le="0.1"} 1100
```

Setup Grafana dashboard.

**Esfuerzo:** 3-5 días.

### 9. Cleanup de archivos huérfanos

Cron job:
```typescript
// scripts/cleanup-orphan-uploads.ts
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db/prisma";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

async function main() {
  const filesOnDisk = await fs.readdir(UPLOAD_DIR);
  const images = await prisma.image.findMany({ select: { key: true } });
  const imageKeys = new Set(images.map(i => i.key));

  for (const file of filesOnDisk) {
    if (!imageKeys.has(file) && !file.startsWith(".")) {
      const stat = await fs.stat(path.join(UPLOAD_DIR, file));
      // Solo borra archivos de >7 días (por si acaban de subirse)
      if (Date.now() - stat.mtimeMs > 7 * 86400000) {
        await fs.unlink(path.join(UPLOAD_DIR, file));
        console.log(`Deleted orphan: ${file}`);
      }
    }
  }
}

main();
```

Ejecutar semanal via cron.

**Esfuerzo:** 1 día.

### 10. Redirects de slugs antiguos

Tabla:
```prisma
model PostRedirect {
  id         String   @id @default(cuid())
  oldSlug    String   @unique
  postId     String
  post       Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())

  @@index([oldSlug])
}
```

Al renombrar un post, crear registro automáticamente. En `middleware.ts` o en `/blog/[slug]/page.tsx`, si el slug no existe buscar en redirects y hacer 301.

**Esfuerzo:** 2 días.

## Prioridad media-baja — Optimización

### 11. Migrar uploads a S3/R2

**Por qué:** escalabilidad, CDN integrado, menos dependencia del disco del VPS.

**Propuesta:**
- AWS S3 o Cloudflare R2 (S3-compatible, más barato).
- `@aws-sdk/client-s3` + signed URLs.
- Cambiar `POST /api/upload` para subir directo a S3 y guardar solo la URL en DB.
- Mantener compatibilidad con URLs antiguas `/uploads/*`.
- Migración gradual: script que mueve archivos del disco a S3.

**Esfuerzo:** 1 semana.

### 12. Imagen optimization

Actualmente Next.js sirve las imágenes del upload tal cual. No hay resize, no hay formato conversion (WebP/AVIF).

**Propuesta:**
- `next/image` con `<Image>` component en el frontend (ya lo hacemos en algunos sitios).
- Configurar `remotePatterns` en `next.config.ts` para permitir imágenes de dominio propio.
- Al subir, generar thumbnails (250px, 500px, 1000px) con `sharp`.

**Esfuerzo:** 3-5 días.

### 13. Full-text search en posts

Búsqueda en blog pública:
- PostgreSQL `tsvector` + GIN index.
- O integración con Algolia/Meilisearch (más rápido, pero externo).

Endpoint `GET /api/posts/search?q=...`.

**Esfuerzo:** 3 días (PostgreSQL) / 1 semana (Algolia).

### 14. Caché Redis para `getLandingConfig`

**Por qué:** cada request a la home hace `prisma.siteConfig.findMany()` (~10-50ms). En alta carga acumula.

**Propuesta:**
- Caché en memoria con TTL de 60s en el proceso Node.
- O Redis compartido entre réplicas.
- Invalidar caché en `PATCH /api/config`.

**Esfuerzo:** 2 días.

### 15. Batch endpoint para crear bloques

Actualmente crear un event page con template hace N `POST /api/event-pages/:id/blocks` secuenciales. Un UX flash observable.

Propuesta:
```http
POST /api/event-pages/:id/blocks/batch
Body: { blocks: [{ type, data }, ...] }
```

Una sola transacción Prisma, respuesta con todos los IDs creados.

**Esfuerzo:** 1 día.

## Features nuevas

### 16. Coaching online (zona privada de clientes)

**Alcance grande.** Nuevas tablas:
- `CoachingProgram` (nombre, descripción, plan, coachId)
- `CoachingClient` (userId, programId, startDate, status)
- `CoachingCheckIn` (clientId, date, weight, measurements, photo, notes)
- `WorkoutPlan` (clientId, week, exercises, sets, reps)
- `NutritionPlan` (clientId, meals, macros)

Nuevas rutas:
- `/coaching/*` — zona privada protegida por rol `CLIENT`.
- `/dashboard/coaching/*` — gestión desde admin.

**Esfuerzo:** 4-6 semanas.

### 17. Productos digitales

Para vender ebooks, planes, cursos.

Modelos:
- `Product` (title, description, price, type, fileUrl, coverUrl)
- `Order` (userId, productId, amount, status, paidAt)

Integración con Stripe.

Gating: `/products/{slug}` públicamente visible; `/download/{orderId}/{productId}` solo para comprador.

**Esfuerzo:** 2-3 semanas.

### 18. Membresía / suscripción

Modelo recurrente con Stripe Subscriptions.

- `Membership` (name, price, features, stripePriceId)
- `User.membershipId` + `User.membershipUntil`

Contenido protegido: check en Server Components.

**Esfuerzo:** 2-3 semanas.

### 19. Zona de comunidad privada

Foro o chat para miembros.

Opciones:
- Integración con Discord/Circle (externo, rápido).
- Implementación propia con Prisma + Socket.io (control total, más trabajo).

**Esfuerzo:** 2 semanas (external) / 2 meses (propio).

### 20. App móvil

Cuando el volumen lo justifique.

**Alternativas:**
- PWA (web app instalable) — la app actual ya podría ser PWA con mínimo esfuerzo.
- React Native con Expo — reutiliza lógica pero UI nueva.
- Capacitor — envoltorio de la web actual.

**Esfuerzo:** 1 mes (PWA) / 4-6 meses (React Native).

## Refactoring técnico

### 21. Abstraer Prisma queries a services

Actualmente, los route handlers llaman a `prisma.*` directamente. Para testing y reuso, separar:

```typescript
// src/lib/services/post.service.ts
export const postService = {
  async list(opts: { status?: PostStatus; page: number; limit: number }) { ... },
  async create(data: CreatePostInput, authorId: string) { ... },
  async update(id: string, data: UpdatePostInput) { ... },
  // ...
};
```

Beneficios: mockable, reusable, lógica de negocio separada del transport layer.

**Esfuerzo:** 1-2 semanas.

### 22. Validaciones Zod centralizadas

Mover schemas inline de los handlers a `src/lib/validations/` para todos los modelos (booking, event-page, etc.).

**Esfuerzo:** 2 días.

### 23. Error handling unificado

Wrapper para todos los handlers:
```typescript
export function withErrorHandling(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (err) {
      logger.error({ err, url: req.url });
      if (err instanceof UnauthorizedError) return error("Unauthorized", 401);
      if (err instanceof NotFoundError) return error("Not found", 404);
      return error("Internal server error", 500);
    }
  };
}
```

Clases de error custom en `src/lib/errors.ts`.

**Esfuerzo:** 3 días.

### 24. Server Actions para mutaciones admin

Next.js 16 soporta Server Actions como alternativa a fetch a route handlers.

Ventajas: menos código cliente, tipo-safe, progressive enhancement.

**Esfuerzo:** migrar gradualmente, 2-4 semanas.

## Escalabilidad a futuro

### Arquitectura actual: monolito single-container

**OK para:**
- Hasta ~10.000 visitas/día
- Cliente único (Kiko Vargas)
- Operación de una sola persona admin

**Requiere cambios si:**
- \>100k visitas/día → escalar DB, añadir CDN, caché Redis.
- Múltiples tenants → multi-tenancy en todos los modelos.
- HA / zero-downtime → múltiples réplicas de la app + load balancer + DB master-replica.

### Migración a microservicios

**No recomendada en el corto/medio plazo.** El overhead operativo supera los beneficios para este tipo de app. Si algún día:
- Servicio separado de emails (jobs + workers).
- Servicio separado de IA (async, con rate limiting propio).
- Frontend landing estático + CMS headless (Decap/Strapi) si el cliente quiere más autonomía.

## Tracking de estas mejoras

Crear issues en GitHub con labels:
- `priority:high` / `priority:medium` / `priority:low`
- `type:feature` / `type:refactor` / `type:security` / `type:performance`
- `area:auth` / `area:blog` / `area:booking` / etc.

Revisar cada trimestre.
