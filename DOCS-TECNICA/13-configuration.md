# 13 · Sistema de configuración

## Concepto

Toda la configuración editable de la app (textos de landing, colores, API keys, modelos de IA, etc.) vive en una **tabla key-value JSON** llamada `SiteConfig`. Esto permite:

- **Edición en caliente** desde el panel admin sin redeploy.
- **Defaults en código** como fallback si la DB no tiene el valor.
- **Cifrado granular** de campos sensibles (API keys).
- **Type safety** via interfaces TypeScript.

## Tabla `site_config`

```sql
CREATE TABLE "site_config" (
    "key"        TEXT      NOT NULL,
    "value"      JSONB     NOT NULL,
    "updated_at" TIMESTAMP NOT NULL,
    CONSTRAINT "site_config_pkey" PRIMARY KEY ("key")
);
```

Una fila por sección. Valor es JSON arbitrario.

## Las 10 claves (secciones)

Definidas en `src/lib/config/landing-defaults.ts`:

```typescript
export const CONFIG_KEYS = [
  "theme",
  "sections",
  "hero",
  "about",
  "stats",
  "contact",
  "social",
  "navbar",
  "ai",
  "email"
] as const;

export type ConfigKey = typeof CONFIG_KEYS[number];
```

## Defaults completos

### `theme` — Paleta de colores

```typescript
interface ThemeConfig {
  accentColor: string;
  accentHover: string;
  bgVoid: string;
  bgSurface: string;
  bgElevated: string;
  textPrimary: string;
  textSecondary: string;
}

const DEFAULT_THEME: ThemeConfig = {
  accentColor:   "#c9a84c",
  accentHover:   "#dfc06a",
  bgVoid:        "#030303",
  bgSurface:     "#070707",
  bgElevated:    "#0f0f0f",
  textPrimary:   "#ededed",
  textSecondary: "#7a7a7a"
};
```

### `sections` — Toggles de visibilidad

```typescript
interface SectionsConfig {
  hero: boolean;
  about: boolean;
  stats: boolean;
  gallery: boolean;
  achievements: boolean;
  blog: boolean;
  newsletter: boolean;
  contact: boolean;
}

const DEFAULT_SECTIONS: SectionsConfig = {
  hero: true, about: true, stats: true, gallery: true,
  achievements: true, blog: true, newsletter: true, contact: true
};
```

La home (`src/app/(landing)/page.tsx`) lee este objeto y renderiza condicionalmente cada sección.

### `hero`
```typescript
{
  title: string,
  titleAccent: string,
  tagline: string,
  ctaText: string,
  ctaHref: string,
  backgroundImage: string
}
```

### `about`
```typescript
{
  heading: string,
  headingAccent: string,
  headingSuffix: string,
  paragraphs: string[],
  portraitImage: string,
  yearLabel: string,
  metrics: { num: string; text: string }[]
}
```

### `stats`
```typescript
{
  items: { value: number; suffix: string; label: string }[]
}
```

### `contact`
```typescript
{
  heading: string,
  headingAccent: string,
  description: string,
  email: string,
  ctaText: string
}
```

### `social`
```typescript
{
  instagram: string,
  instagramHandle: string,
  youtube: string,
  youtubeHandle: string,
  tiktok: string,
  tiktokHandle: string
}
```

### `navbar`
```typescript
{
  brandFirst: string,
  brandSecond: string,
  ctaText: string
}
```

### `ai`
```typescript
interface AIConfig {
  provider: "openai" | "local";
  openaiApiKey: string;     // ← CIFRADO
  openaiModel: string;
  localEndpoint: string;
  localModel: string;
  systemPrompt: string;
}

const DEFAULT_AI: AIConfig = {
  provider: "openai",
  openaiApiKey: "",
  openaiModel: "gpt-4o-mini",
  localEndpoint: "http://localhost:11434",
  localModel: "llama3",
  systemPrompt: "Eres un coach profesional de bodybuilding y fitness..."
};
```

### `email`
```typescript
interface EmailConfig {
  resendApiKey: string;    // ← CIFRADO
  fromName: string;
  fromEmail: string;
  contactEmailTo: string;
}

const DEFAULT_EMAIL: EmailConfig = {
  resendApiKey: "",
  fromName: "Kiko Vargas Web",
  fromEmail: "noreply@kikovargass.com",
  contactEmailTo: "contacto@kikovargass.com"
};
```

## Campos cifrados

```typescript
export const SENSITIVE_FIELDS: Record<ConfigKey, string[]> = {
  theme: [],
  sections: [],
  hero: [],
  about: [],
  stats: [],
  contact: [],
  social: [],
  navbar: [],
  ai: ["openaiApiKey"],
  email: ["resendApiKey"]
};
```

Ver `08-security.md` para detalle del cifrado AES-256-GCM.

## Merge defaults + DB

**Archivo:** `src/lib/config/get-config.ts`

```typescript
import { prisma } from "@/lib/db/prisma";
import { decryptSensitiveFields } from "@/lib/crypto";
import {
  DEFAULT_CONFIG,
  type LandingConfig,
  type ConfigKey
} from "./landing-defaults";

export async function getLandingConfig(): Promise<LandingConfig> {
  const rows = await prisma.siteConfig.findMany();

  const merged: LandingConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

  for (const row of rows) {
    const key = row.key as ConfigKey;
    if (key in merged) {
      const value = row.value as Record<string, unknown>;
      // Descifra campos sensibles antes de mergear
      const decrypted = decryptSensitiveFields(key, value);
      merged[key] = { ...merged[key], ...decrypted };
    }
  }

  return merged;
}
```

**Propiedades:**
- Si la tabla está vacía, retorna defaults exactos.
- Si una fila existe pero le falta algún campo, el campo hereda del default (shallow merge).
- Campos sensibles se descifran automáticamente.
- Siempre retorna objeto completo (nunca `undefined`).

**Server-only:** este helper **nunca** debe ser importado en Client Components (rompería el bundle).

## Uso de la config

### En Server Components

```typescript
// src/app/(landing)/page.tsx
import { getLandingConfig } from "@/lib/config/get-config";

export default async function HomePage() {
  const config = await getLandingConfig();

  return (
    <>
      {config.sections.hero && <HeroSection config={config.hero} />}
      {config.sections.about && <AboutSection config={config.about} />}
      {/* ... */}
    </>
  );
}
```

### En API routes (para AI/Email)

```typescript
// src/app/api/ai/generate/route.ts
const config = await getLandingConfig();
const apiKey = config.ai.openaiApiKey || process.env.OPENAI_API_KEY;
// config.ai.openaiApiKey ya está descifrado
```

## Endpoints

### `GET /api/config`

Auth: Admin
Retorna el config completo con campos sensibles **enmascarados**:

```typescript
export async function GET() {
  await requireAdmin();

  const rows = await prisma.siteConfig.findMany();
  const result = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

  for (const row of rows) {
    const key = row.key as ConfigKey;
    const value = row.value as Record<string, unknown>;
    result[key] = { ...result[key], ...maskSensitiveFields(key, value) };
  }

  return success(result);
}
```

El frontend nunca ve las API keys en plaintext. Solo `sk-a••••••xyz`.

### `PATCH /api/config`

Auth: Admin
Body: `{ key: ConfigKey, value: object }`

Lógica de preservación de secrets:

```typescript
export async function PATCH(req: NextRequest) {
  await requireAdmin();

  const { key, value } = (await req.json()) as {
    key: ConfigKey;
    value: Record<string, unknown>;
  };

  if (!CONFIG_KEYS.includes(key)) return error("Invalid key", 400);

  // 1. Fetch existing
  const existing = await prisma.siteConfig.findUnique({ where: { key } });
  const sensitiveFields = SENSITIVE_FIELDS[key] || [];

  // 2. Si el valor entrante contiene masked (con "••"), preservar el cifrado existente
  for (const field of sensitiveFields) {
    const incoming = value[field];
    if (typeof incoming === "string" && incoming.includes("••")) {
      // El usuario no cambió la clave. Preservamos el valor cifrado.
      if (existing?.value) {
        value[field] = (existing.value as Record<string, unknown>)[field];
      } else {
        delete value[field];  // sin valor previo, no guardar masked
      }
    }
  }

  // 3. Cifrar campos plaintext nuevos
  const encrypted = encryptSensitiveFields(key, value);

  // 4. Upsert
  await prisma.siteConfig.upsert({
    where: { key },
    create: { key, value: encrypted },
    update: { value: encrypted }
  });

  // 5. Revalidar cache de la landing
  revalidatePath("/", "layout");

  return success({ updated: true });
}
```

### Ejemplo: actualizar hero

Request:
```http
PATCH /api/config
Cookie: token=...

{
  "key": "hero",
  "value": {
    "title": "NUEVA",
    "titleAccent": "ERA",
    "tagline": "Coach IFBB Pro 2026",
    "ctaText": "Empezar",
    "ctaHref": "#contact",
    "backgroundImage": "/images/hero-new.jpg"
  }
}
```

Respuesta:
```json
{ "success": true, "data": { "updated": true } }
```

Efectos:
- `site_config.hero.value` actualizado.
- `updated_at` actualizado automáticamente.
- Cache de la landing invalidado → próxima request sirve contenido nuevo.

### Ejemplo: actualizar API key

Request (primera vez — plaintext):
```http
PATCH /api/config
{ "key": "ai", "value": { ..., "openaiApiKey": "sk-proj-real-key-here", ... } }
```

En DB queda:
```json
{
  "openaiApiKey": "enc:a4f3b8...:7e8f9a...:3f4a5b...",
  ...
}
```

Request (segunda vez — el usuario no cambió la clave, GET la devolvió masked):
```http
PATCH /api/config
{ "key": "ai", "value": { ..., "openaiApiKey": "sk-p••••••here", ... } }
```

El handler detecta el `"••"` y **preserva** el valor cifrado previo. No se sobrescribe.

## Revalidación de cache

Next.js con App Router cachea páginas agresivamente. Cuando cambia la config, la home ya renderizada podría servir datos viejos.

Solución: `revalidatePath("/", "layout")` en cada PATCH.

```typescript
import { revalidatePath } from "next/cache";

// Al final del PATCH handler
revalidatePath("/", "layout");
```

Esto invalida todas las rutas bajo el layout raíz. La próxima request re-ejecuta `getLandingConfig()` y renderiza con la data nueva.

**Otra opción:** marcar la home como `dynamic = "force-dynamic"`, que es lo que hace `src/app/(landing)/page.tsx`:

```typescript
export const dynamic = "force-dynamic";
```

Esto fuerza server rendering en cada request. Tradeoff: menos caché, más latencia. Dado que la config cambia poco, `revalidatePath` sería mejor en teoría, pero `force-dynamic` es más simple y seguro.

## Seeding de configuración inicial

**No hay seed automático para `site_config`.** La primera vez que se abre el dashboard de settings, los campos aparecen con los defaults. Al guardar, se crea la fila en DB.

Alternativa: script de seed manual:
```typescript
// prisma/seed-config.ts
import { prisma } from "@/lib/db/prisma";
import { DEFAULT_CONFIG, CONFIG_KEYS } from "@/lib/config/landing-defaults";

for (const key of CONFIG_KEYS) {
  await prisma.siteConfig.upsert({
    where: { key },
    create: { key, value: DEFAULT_CONFIG[key] },
    update: {}
  });
}
```

No está en el repo. Considerar añadir para onboarding.

## Extensibilidad — añadir nueva sección

Ejemplo: añadir sección `"seo"` para metadatos.

1. **Define interface + default** en `landing-defaults.ts`:
   ```typescript
   interface SeoConfig {
     title: string;
     description: string;
     ogImage: string;
     twitterHandle: string;
   }

   const DEFAULT_SEO: SeoConfig = {
     title: "Kiko Vargas | IFBB Pro",
     description: "...",
     ogImage: "/og.jpg",
     twitterHandle: "@kikovargass"
   };
   ```

2. **Añadir a `LandingConfig`, `DEFAULT_CONFIG`, `CONFIG_KEYS`:**
   ```typescript
   export interface LandingConfig {
     // ... existentes
     seo: SeoConfig;
   }

   export const DEFAULT_CONFIG = {
     // ...
     seo: DEFAULT_SEO
   };

   export const CONFIG_KEYS = [
     // ...
     "seo"
   ] as const;
   ```

3. **Si tiene campos sensibles**, añadir a `SENSITIVE_FIELDS` en `src/lib/crypto.ts`.

4. **Crear tab en settings** (`src/app/(admin)/dashboard/settings/settings-editor.tsx`).

5. **Usar en la app:**
   ```typescript
   const config = await getLandingConfig();
   export const metadata = { title: config.seo.title, description: config.seo.description };
   ```

No se requieren migraciones de DB — `site_config` es JSONB.
