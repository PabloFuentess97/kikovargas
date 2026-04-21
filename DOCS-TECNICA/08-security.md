# 08 · Seguridad

## Autenticación

### Algoritmo

- **JWT HS256** con `jsonwebtoken`
- **Secret:** `process.env.JWT_SECRET` (obligatorio, mínimo 32 chars — validado al startup)
- **Expiración:** 8 horas
- **Payload:**
  ```typescript
  {
    sub: string,       // user ID
    email: string,
    role: "ADMIN" | "USER",
    iat: number,
    exp: number
  }
  ```

### Archivo `src/lib/auth/jwt.ts`

```typescript
import jwt from "jsonwebtoken";

export interface JwtPayload {
  sub: string;
  email: string;
  role: "ADMIN" | "USER";
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    algorithm: "HS256",
    expiresIn: "8h"
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch {
    return null;
  }
}
```

**Importante:** `verifyToken` nunca lanza. Devuelve `null` si:
- Token malformado
- Firma inválida
- Token expirado
- Algoritmo no coincide

### Cookie session

Nombre: **`token`**

Opciones al setear (en `/api/auth/login/route.ts`):
```typescript
cookies().set("token", token, {
  httpOnly: true,                          // no accesible vía JS
  secure: process.env.NODE_ENV === "prod", // solo HTTPS en producción
  sameSite: "lax",                         // protección CSRF básica
  maxAge: 60 * 60 * 8,                     // 8 horas en segundos
  path: "/"
});
```

Al logout: `maxAge: 0`.

### Password hashing

**bcryptjs** con **12 rondas**.

Setup (seed):
```typescript
import bcrypt from "bcryptjs";
const hashed = await bcrypt.hash(plaintext, 12);
```

Verificación (login):
```typescript
const valid = await bcrypt.compare(attempt, user.password);
```

12 rondas es un compromiso razonable (~250ms por hash en hardware moderno). Lo suficientemente lento para disuadir fuerza bruta, lo suficientemente rápido para UX de login.

### Guardián `requireAdmin()`

**Archivo:** `src/lib/auth/session.ts`

```typescript
import { cookies } from "next/headers";
import { verifyToken, JwtPayload } from "./jwt";

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(): Promise<JwtPayload> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}
```

**Uso:**
- Server Components: `await requireAdmin()` al inicio.
- Route handlers: `await requireAdmin()` al inicio del try.

Si lanza, Next.js convierte a 500. El middleware redirige al login en el siguiente request.

## Middleware

**Archivo:** `src/middleware.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

const PUBLIC_PATHS = [
  "/", "/login", "/privacy", "/cookies", "/terms",
  "/api/auth/login", "/api/auth/logout",
  "/api/contacts", "/api/gallery",
  "/api/analytics/track",
  "/api/newsletter/subscribe", "/api/newsletter/unsubscribe",
  "/api/bookings/public", "/api/availability",
  "/api/event-leads"
];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/blog/") || pathname.startsWith("/book/") || pathname.startsWith("/event/"))
    return true;
  if (pathname.startsWith("/api/uploads/")) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;
  const session = token ? verifyToken(token) : null;

  // Logged-in user visitando /login → redirige a dashboard
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (isPublic(pathname)) return NextResponse.next();

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"]
};
```

**El matcher excluye:**
- Assets estáticos de Next.js
- Favicon
- Rutas con extensión de archivo

Por lo tanto el middleware corre en TODAS las rutas normales.

## Cifrado de API keys

### Algoritmo

**AES-256-GCM** (autenticado, con tag de integridad).

**Key derivation:** `scrypt` desde `ENCRYPTION_KEY` (o fallback `JWT_SECRET`).
**Salt estático:** `"kikovargas-config-salt"` (constante — rotar el env key invalida todos los cifrados).
**IV:** 16 bytes random por cifrado.
**Auth tag:** generado por GCM (16 bytes).

### Formato del ciphertext

```
enc:<iv-hex>:<authTag-hex>:<ciphertext-hex>
```

Ejemplo real:
```
enc:a4f3b8c9...:7e8f9a0b...:3f4a5b6c...
```

### Archivo `src/lib/crypto.ts`

```typescript
import crypto from "crypto";

const SALT = "kikovargas-config-salt";
const ALGORITHM = "aes-256-gcm";
const PREFIX = "enc:";

function deriveKey(): Buffer {
  const password = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET!;
  return crypto.scryptSync(password, SALT, 32);
}

export function encrypt(plaintext: string): string {
  if (!plaintext) return "";
  const key = deriveKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(ciphertext: string): string {
  if (!ciphertext || !ciphertext.startsWith(PREFIX)) return ciphertext;
  const [, ivHex, tagHex, dataHex] = ciphertext.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(dataHex, "hex");
  const key = deriveKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

export function isEncrypted(value: string): boolean {
  return typeof value === "string" && value.startsWith(PREFIX);
}

export function maskSecret(value: string): string {
  if (!value) return "";
  if (value.length <= 8) return "••••••••";
  return `${value.slice(0, 4)}${"•".repeat(6)}${value.slice(-4)}`;
}
```

### Campos sensibles

```typescript
export const SENSITIVE_FIELDS: Record<string, string[]> = {
  ai: ["openaiApiKey"],
  email: ["resendApiKey"]
};
```

### Helpers de alto nivel

```typescript
// Al guardar en DB
export function encryptSensitiveFields(key: string, data: Record<string, unknown>) {
  const fields = SENSITIVE_FIELDS[key] || [];
  const result = { ...data };
  for (const field of fields) {
    const val = result[field];
    if (typeof val === "string" && val && !isEncrypted(val)) {
      result[field] = encrypt(val);
    }
  }
  return result;
}

// Al leer de DB (para uso real: llamadas a OpenAI/Resend)
export function decryptSensitiveFields(key: string, data: Record<string, unknown>) {
  const fields = SENSITIVE_FIELDS[key] || [];
  const result = { ...data };
  for (const field of fields) {
    const val = result[field];
    if (typeof val === "string" && isEncrypted(val)) {
      try {
        result[field] = decrypt(val);
      } catch {
        result[field] = "";  // key rotated o data corrupta
      }
    }
  }
  return result;
}

// Al retornar al frontend (masked)
export function maskSensitiveFields(key: string, data: Record<string, unknown>) {
  const fields = SENSITIVE_FIELDS[key] || [];
  const result = { ...data };
  for (const field of fields) {
    const val = result[field];
    if (typeof val === "string" && val) {
      result[field] = isEncrypted(val) ? maskSecret(decrypt(val)) : maskSecret(val);
    }
  }
  return result;
}
```

### Flujo en `PATCH /api/config`

```typescript
const { key, value } = body;

// 1. Si el cliente envía un campo con '••' (masked), preservamos el valor cifrado de DB
const existing = await prisma.siteConfig.findUnique({ where: { key } });
const sensitiveFields = SENSITIVE_FIELDS[key] || [];

for (const field of sensitiveFields) {
  if (typeof value[field] === "string" && value[field].includes("••")) {
    if (existing?.value) {
      value[field] = (existing.value as Record<string, unknown>)[field];
    }
  }
}

// 2. Encripta los campos plaintext nuevos
const encrypted = encryptSensitiveFields(key, value);

// 3. Upsert
await prisma.siteConfig.upsert({
  where: { key },
  create: { key, value: encrypted },
  update: { value: encrypted }
});
```

### Rotación de clave

Cambiar `ENCRYPTION_KEY` **invalida todos los valores cifrados**. El sistema lo maneja gracefully: al fallar decrypt, el campo retorna `""` (string vacío). El usuario debe volver a introducir las API keys.

**Procedimiento seguro de rotación:**
1. Script que lee todos los `SiteConfig`, decrypta con key vieja.
2. Cambia `ENCRYPTION_KEY` en el env.
3. Re-guarda todos los registros (se encriptan con la key nueva).

Actualmente **no hay script de rotación**. Mejora pendiente.

## Validación de inputs

### Zod en todos los endpoints

Schemas en `src/lib/validations/`:
- `auth.ts` — `loginSchema`
- `post.ts` — `createPostSchema`, `updatePostSchema`
- `contact.ts` — `createContactSchema`, `updateContactStatusSchema`
- `image.ts` — `createImageSchema`

Y muchos inline en los route handlers (booking, event-page, newsletter, etc.).

**Pattern estándar:**
```typescript
const parsed = schema.safeParse(body);
if (!parsed.success) {
  return error(parsed.error.issues[0].message, 422);
}
const data = parsed.data;
```

### Coerción segura

- **Número:** `z.coerce.number().int().positive()`
- **Booleano:** `z.coerce.boolean()`
- **Fecha:** `z.string().datetime()` (ISO 8601) → parse a `new Date()` después
- **Enum:** `z.enum(["A", "B", "C"])`

### SQL injection

**No aplicable** — Prisma parametriza todas las queries. Nunca usamos `$queryRaw` con string concatenation en el código.

## Protección de uploads

Ver `07-file-upload.md`. Resumen:

- Admin-only endpoint
- MIME allowlist (`jpeg/png/webp`)
- Max 5 MB por archivo
- Max 10 archivos por request
- Filename sanitizado (timestamp + hash, no aceptamos el nombre del usuario)
- `X-Content-Type-Options: nosniff` en respuesta
- Path traversal prevenido (validación regex sobre filepath)
- SVG deshabilitado (vector XSS)

## Rate limiting

**NO implementado en el código actual.**

Mejora pendiente. Opciones:
- `@upstash/ratelimit` (Redis)
- Middleware custom con in-memory LRU
- Reverse proxy (Caddy, Nginx) con rate limit módulo

**Endpoints críticos que deberían tener rate limit:**
- `POST /api/auth/login` (brute force)
- `POST /api/contacts` (spam)
- `POST /api/newsletter/subscribe` (spam)
- `POST /api/bookings/public` (booking spam)

## Headers de seguridad

**No configurados en `next.config.ts`.** Mejora pendiente. Deberían setearse:

```typescript
{
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
      ]
    }];
  }
}
```

CSP (Content-Security-Policy) pendiente — requiere nonces para los inline scripts de Next.js.

## Variables críticas

```bash
JWT_SECRET        # MIN 32 chars. Generar con: openssl rand -base64 48
ENCRYPTION_KEY    # Opcional. Fallback a JWT_SECRET si no está.
POSTGRES_PASSWORD # Contraseña del DB
```

**Nunca:**
- Commitear `.env` al repo.
- Usar el mismo `JWT_SECRET` en dev, staging y prod.
- Rotar `JWT_SECRET` sin invalidar todas las sesiones (es OK, solo hay que volver a loguearse).
- Rotar `ENCRYPTION_KEY` sin un plan de migración (invalida API keys guardadas).

## Checklist antes de producción

- [ ] `JWT_SECRET` generado con `openssl rand -base64 48`
- [ ] `ENCRYPTION_KEY` distinto de `JWT_SECRET`
- [ ] `POSTGRES_PASSWORD` fuerte (16+ chars mixed)
- [ ] HTTPS configurado (reverse proxy con Let's Encrypt)
- [ ] `NODE_ENV=production`
- [ ] Headers de seguridad añadidos
- [ ] Rate limiting en endpoints públicos críticos
- [ ] Backups automatizados de DB + uploads
- [ ] Monitorización de logs (detectar ataques)
