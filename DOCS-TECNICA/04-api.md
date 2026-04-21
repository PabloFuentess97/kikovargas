# 04 · API

Total: **37 route handlers** bajo `src/app/api/`.

## Contrato estándar de respuesta

Todos los endpoints retornan un envoltorio consistente via `src/lib/api-response.ts`:

```typescript
// Éxito
{ "success": true, "data": T }

// Error
{ "success": false, "error": string }
```

Status HTTP:
- `200` — éxito
- `201` — creado
- `400` — body inválido (genérico)
- `401` — no autenticado / no admin
- `404` — recurso no encontrado
- `409` — conflicto (ej. slot de booking ocupado)
- `410` — recurso expirado (ej. booking link)
- `422` — validación Zod falló (con mensaje específico)
- `500` — error interno

## Autenticación

3 niveles en los endpoints:

1. **Public** — cualquiera puede llamar. Declarado en `PUBLIC_PATHS` del middleware.
2. **Session** — requiere JWT válido en cookie `token`. No importa el rol.
3. **Admin** — requiere `role: ADMIN`. Implementado via `await requireAdmin()` dentro del handler.

## Endpoints completos

### Autenticación

#### `POST /api/auth/login`
**Auth:** Public
**Body (Zod `loginSchema`):**
```json
{ "email": "admin@example.com", "password": "min8chars" }
```
**Respuesta 200:**
```json
{ "success": true, "data": { "name": "Admin", "email": "...", "role": "ADMIN" } }
```
**Efecto:** setea cookie `token` httpOnly, secure (en prod), sameSite=lax, maxAge=28800 (8h).

**Errores:** `401` credenciales inválidas, `403` usuario inactivo.

#### `POST /api/auth/logout`
**Auth:** Public
**Body:** vacío
**Respuesta:** `{ success: true }`
**Efecto:** limpia cookie `token`.

#### `GET /api/auth/me`
**Auth:** Session
**Respuesta:** `{ success: true, data: { id, email, name, role } }`

### Usuarios

#### `GET /api/users`
**Auth:** Admin
**Respuesta:** lista paginada de usuarios, ordenados por `createdAt desc`.

### Posts

#### `GET /api/posts`
**Auth:** Public (comportamiento cambia con sesión)
**Query params:**
- `page` (default 1)
- `limit` (default 10, max 50)
- `status` (solo válido para admin; público fuerza `PUBLISHED`)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "posts": [...],
    "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
  }
}
```

#### `POST /api/posts`
**Auth:** Admin
**Body (Zod `createPostSchema`):**
```typescript
{
  title: string (1-200),
  slug: string (regex /^[a-z0-9]+(-[a-z0-9]+)*$/),
  excerpt?: string (max 500),
  content: string (min 1),
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" (default "DRAFT"),
  coverId?: string
}
```

**Efectos:**
- Valida unicidad de `slug`.
- Si `status === "PUBLISHED"`, setea `publishedAt = new Date()`.
- Asocia el post al `authorId` del usuario autenticado.

#### `GET /api/posts/:id`
**Auth:** Public (pero público solo ve `PUBLISHED`)
**Param:** `:id` puede ser ID (cuid) o slug — el handler intenta ambos.
**Incluye:** `author`, `cover`, `images` (gallery).

#### `PATCH /api/posts/:id`
**Auth:** Admin
**Body:** partial de `createPostSchema` (`updatePostSchema`).
**Lógica especial:** si el post está en `DRAFT/ARCHIVED` y pasa a `PUBLISHED` y `publishedAt` es null → setea `publishedAt`.

#### `DELETE /api/posts/:id`
**Auth:** Admin
**Respuesta:** `{ success: true, data: { deleted: true } }`

### Contactos

#### `GET /api/contacts`
**Auth:** Admin
**Query:** `status`, `page`, `limit`.

#### `POST /api/contacts`
**Auth:** Public
**Body (Zod `createContactSchema`):**
```typescript
{
  name: string (1-100),
  email: string (email),
  phone?: string (max 20),
  subject: string (1-200),
  message: string (1-5000)
}
```
**Efectos:**
1. Crea registro `Contact` con `status: "PENDING"`.
2. Dispara `sendContactNotification()` en fire-and-forget (no bloquea respuesta).

**Respuesta:** `201` con `{ id }`.

#### `GET /api/contacts/:id`
**Auth:** Admin
**Efecto secundario:** si `status === "PENDING"`, lo actualiza a `"READ"` con `readAt = now()`.

#### `PATCH /api/contacts/:id`
**Auth:** Admin
**Body:** `{ status: "PENDING" | "READ" | "REPLIED" | "ARCHIVED" }`
**Efecto:** si el status pasa a `"REPLIED"`, setea `repliedAt = now()`.

#### `DELETE /api/contacts/:id`
**Auth:** Admin.

### Imágenes y galería

#### `GET /api/images`
**Auth:** Admin
**Query:** `?gallery=true` filtra solo las marcadas como galería.

#### `POST /api/images`
**Auth:** Admin
**Body (Zod `createImageSchema`):**
```typescript
{
  url: string,
  key: string,
  alt?: string (max 300, default ""),
  width?: int,
  height?: int,
  size?: int,
  mime?: string (default "image/jpeg"),
  gallery?: boolean,
  order?: int,
  postId?: string
}
```

#### `PATCH /api/images/:id`
**Auth:** Admin
**Body:** `{ alt?, order?, gallery? }`.

#### `DELETE /api/images/:id`
**Auth:** Admin
**Efecto:** elimina el registro en DB y además intenta borrar el archivo físico si `url` empieza con `/uploads/`.

#### `GET /api/gallery`
**Auth:** Public
**Respuesta:** imágenes con `gallery: true`, ordenadas por `order asc` luego `createdAt desc`.

#### `POST /api/upload`
**Auth:** Admin
**Content-Type:** `multipart/form-data` con field `files` (uno o múltiples).
**Validación:**
- MIME allowlist: `image/jpeg`, `image/png`, `image/webp`
- Max 5 MB por archivo
- Max 10 archivos por request

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "uploaded": [{ "url": "/uploads/1734567-abc.jpg", "key": "...", "width": 1920, ... }],
    "errors": [{ "filename": "bad.svg", "message": "Formato no soportado" }]
  }
}
```

**Nota:** este endpoint NO crea registros en DB. El cliente debe llamar a `POST /api/images` después para cada archivo exitoso.

#### `GET /api/uploads/:filepath`
**Auth:** Public
**Efecto:** sirve el archivo físico desde `public/uploads/`. Usado para bypass del caché de Next.js en archivos subidos dinámicamente.

### Newsletter

#### `POST /api/newsletter/subscribe`
**Auth:** Public
**Body:** `{ email: string, name?: string }`
**Efectos:**
- Crea `Subscriber` o reactiva uno existente (`active = true`, clears `unsubscribedAt`).
- Dispara welcome email (fire-and-forget).

#### `GET /api/newsletter/unsubscribe`
**Auth:** Public
**Query:** `?email=...`
**Respuesta:** HTML (no JSON). Página de confirmación con dark theme.
**Efecto:** marca `active = false`, setea `unsubscribedAt = now()`.

#### `GET /api/newsletter/subscribers`
**Auth:** Admin
**Query:** `status` (active|inactive), `page`, `limit` (max 100).

#### `DELETE /api/newsletter/subscribers`
**Auth:** Admin
**Body:** `{ id: string }`

#### `GET /api/newsletter/campaigns`
**Auth:** Admin
**Respuesta:** últimas 50 campañas.

#### `POST /api/newsletter/campaigns`
**Auth:** Admin
**Body:**
```typescript
{
  subject: string (1-200),
  content: string,
  template?: "custom" | "new_post",
  postId?: string,    // si template === "new_post"
  send?: boolean      // si true, envía inmediatamente
}
```
**Efectos (si `send=true`):**
1. Fetch de todos los subscribers `active=true`.
2. Llama a `sendBatch(emails, subject, htmlFn)` que envía en chunks de 100.
3. Actualiza `status="SENT"`, `sentAt=now()`, `sentCount=N`.

### Reservas

#### `GET /api/bookings`
**Auth:** Admin
**Respuesta:** últimas 200 reservas con `include: { link: true }`.

#### `PATCH /api/bookings/:id`
**Auth:** Admin
**Body:** `{ status?, notes? }`

#### `DELETE /api/bookings/:id`
**Auth:** Admin.

#### `GET /api/bookings/public`
**Auth:** Public
**Query:** `slug`, `date` (YYYY-MM-DD)
**Respuesta:**
```typescript
{
  link: { title, description, duration },
  availability: { startTime: "HH:mm", endTime: "HH:mm" } | null,
  bookedSlots: ["16:00", "17:00"]
}
```

**Lógica:**
1. Busca link por slug; retorna 404 si no existe, no activo, o expirado.
2. Busca `availability` para `date.getDay()`.
3. Busca bookings no cancelados para ese día.
4. Devuelve los slots ya ocupados (formato `"HH:mm"`).

El cliente front calcula los slots libres iterando de `startTime` a `endTime` en incrementos de `duration`.

#### `POST /api/bookings/public`
**Auth:** Public
**Body:**
```typescript
{
  slug: string,
  date: string (ISO 8601 datetime),
  name: string (2-100),
  email: string (email),
  phone?: string (max 30),
  notes?: string (max 500)
}
```
**Validaciones server-side:**
1. Link existe, active, no expirado (404/410).
2. Availability existe para el día y está activa (422).
3. La hora cae dentro del rango startTime-endTime (422).
4. No existe booking conflicto para el mismo link+rango de tiempo (409).

**Efectos secundarios:**
- Crea `Booking` con `status="CONFIRMED"`.
- Crea `Contact` (fire-and-forget) con el mismo email/nombre.
- Dispara email de confirmación al cliente.
- Dispara email de notificación al admin.

### Booking links

#### `GET/POST /api/booking-links`
**Auth:** Admin
**Body (POST):**
```typescript
{
  slug: string (2-100, lowercase-hyphens),
  title?: string (max 200),
  description?: string (max 1000),
  duration?: int (15-480),
  active?: boolean,
  expiresAt?: string (ISO) | null
}
```

#### `GET/PATCH/DELETE /api/booking-links/:id`
**Auth:** Admin.

### Disponibilidad

#### `GET /api/availability`
**Auth:** Public
**Respuesta:** array de filas de `availability` (0-7 filas según configuración).

#### `PUT /api/availability`
**Auth:** Admin
**Body:**
```typescript
{
  slots: [
    { dayOfWeek: 0-6, startTime: "HH:mm", endTime: "HH:mm", active: boolean }
  ]
}
```
**Validación:** `startTime < endTime` (comparación de strings `"HH:mm"`).
**Efecto:** en una **transacción Prisma**, borra todas las filas y crea las nuevas.

### Event Pages

#### `GET/POST /api/event-pages`
**Auth:** Admin
**Body (POST):**
```typescript
{
  slug: string (2-100),
  title: string (1-200),
  description?: string (max 1000),
  template?: "custom" | "webinar" | "fitness" | "coaching"
}
```

#### `GET/PATCH/DELETE /api/event-pages/:id`
**Auth:** Admin.
**GET incluye:** `blocks` (ordenados) y count de `leads`.

#### `POST /api/event-pages/:id/blocks`
**Auth:** Admin
**Body (crear):** `{ type: string, data: object }` — `type` debe ser uno de los 14 tipos (ver `10-landing-builder.md`).
**Body (reordenar):** `{ blockIds: string[] }` — array de IDs en el nuevo orden.

El handler detecta qué body es según las propiedades presentes.

#### `PATCH /api/event-pages/:id/blocks/:blockId`
**Auth:** Admin
**Body:** `{ data: object }` — reemplaza el JSON del bloque.

#### `DELETE /api/event-pages/:id/blocks/:blockId`
**Auth:** Admin
**Efecto:** borra el bloque y reordena los restantes (closes the gap).

### Event Leads

#### `GET /api/event-leads`
**Auth:** Admin
**Query:** `?pageId=...` filtro opcional.

#### `POST /api/event-leads`
**Auth:** Public
**Body:** `{ pageId, name, email, phone?, message? }`
**Pre-condición:** `EventPage.status === "PUBLISHED"` (422 si no).
**Efectos:** crea `EventLead` + `Contact` + dispara email admin.

### AI

#### `POST /api/ai/generate`
**Auth:** Admin
**Body:** `{ topic: string (min 3), context?: string }`
**Settings:** temperature `0.7`, max_tokens `4000`, `response_format: json_object` (OpenAI).
**Respuesta:** `{ title: string, content: string }` (HTML).

#### `POST /api/ai/generate-ideas`
**Auth:** Admin
**Body:** `{ niche?: string, count?: number (1-10) }`
**Settings:** temperature `0.9`, max_tokens `2000`.
**Respuesta:** `{ ideas: [{ title, description, tags: string[] }] }`.

#### `POST /api/ai/generate-image`
**Auth:** Admin
**Body:** `{ topic?: string, title?: string }` (al menos uno)
**Settings:** model `dall-e-3`, size `1792x1024`, quality `standard`.
**Efectos:**
1. Llama OpenAI Images API.
2. Descarga la imagen desde la URL temporal de OpenAI.
3. La guarda en `public/uploads/ai-{timestamp}-{hash}.png`.
4. Crea registro `Image` (`gallery: false`).
5. Retorna `{ imageId, url }`.

**Solo funciona con provider `openai`**. Si provider es `local`, retorna `400`.

### Analítica

#### `POST /api/analytics/track`
**Auth:** Public
**Body:** `{ path: string, referrer?: string }`
**Efectos:** parsea headers para extraer UA, IP, country, city. Crea `PageView`.
**Nunca falla**: cualquier error se loguea y retorna `{ success: true }`.

#### `GET /api/analytics/stats`
**Auth:** Admin
**Respuesta:** agregados para el dashboard de analytics.

### Configuración

#### `GET /api/config`
**Auth:** Admin
**Respuesta:** objeto con las 10 secciones del config. Campos sensibles enmascarados (`sk-a••••••xyz`).

#### `PATCH /api/config`
**Auth:** Admin
**Body:** `{ key: ConfigKey, value: object }`
**Lógica de preservación de secrets:**
- Si un campo sensible en `value` contiene `"••"` (dots de masking), se considera "sin cambios" y se preserva el valor cifrado de DB.
- Si es un string nuevo → se cifra con `encryptSensitiveFields(key, value)` antes de persistir.
- Tras guardar, llama a `revalidatePath("/", "layout")` para invalidar el cache de la landing.

### Knowledge Base

#### `GET /api/kb/articles`
**Auth:** Admin
**Respuesta:** `{ categories: [...], articles: [...] }`.

#### `PATCH /api/kb/articles/:id`
**Auth:** Admin
**Body:** `{ title?, content? }` (al menos uno).

#### `POST /api/kb/seed`
**Auth:** Admin
**Body:** vacío.
**Efecto:** lee `KB_CATEGORIES` del archivo estático `src/app/(admin)/dashboard/knowledge/kb-content.ts` y hace upsert en DB. Idempotente (solo crea los que no existen).
**Respuesta:** `{ seeded: true, categoriesCreated: N, articlesCreated: M, message: "..." }`.

## Paths públicos (middleware)

Exactos (sin comodín):
```
/, /login, /privacy, /cookies, /terms,
/api/auth/login, /api/auth/logout,
/api/contacts, /api/gallery,
/api/analytics/track,
/api/newsletter/subscribe, /api/newsletter/unsubscribe,
/api/bookings/public, /api/availability,
/api/event-leads
```

Prefijos públicos (con `startsWith`):
```
/blog/ /book/ /event/ /gallery /api/uploads/
```

Todo lo demás bajo `/api/` o `/dashboard/` requiere sesión.
