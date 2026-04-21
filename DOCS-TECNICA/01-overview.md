# 01 · Visión general

## Descripción del proyecto

**kikovargas.fit** es una plataforma digital integral para un profesional del fitness (IFBB Pro). No es una web de presentación — es un ecosistema completo que combina:

- Página pública configurable (landing, blog, galería)
- Panel de administración completo
- Sistema de reservas online con gestión de disponibilidad
- Constructor de landing pages por bloques para eventos/webinars
- CRM básico (contactos + leads de eventos)
- Newsletter con envío de campañas
- Generación de contenido asistida por IA (OpenAI o Ollama local)
- Base de conocimiento editable para el propio cliente
- Analítica de visitas

Todo desplegado como una única aplicación Next.js en modo standalone, dockerizada, con PostgreSQL persistente.

## Propósito técnico

El proyecto demuestra varias decisiones de arquitectura que lo diferencian de un CMS estándar:

- **Configuración sin redeploy**: todo el contenido de la landing vive en `site_config` (JSONB), editable en caliente desde el panel. El código no contiene textos hardcoded.
- **API keys cifradas en DB**: OpenAI y Resend nunca aparecen en texto plano en la base. AES-256-GCM por campo.
- **Sistema de bloques flexible**: 14 tipos de bloque para landing pages de eventos, con `data: JSONB` por bloque y renderizado dinámico.
- **IA con fallback local**: OpenAI como default, Ollama como alternativa local configurable sin cambios de código.
- **Middleware auth estricto**: allowlist de rutas públicas en `src/middleware.ts`; todo lo demás requiere cookie JWT.

## Stack técnico

### Runtime y framework

| Paquete | Versión | Rol |
|---------|---------|-----|
| `next` | `16.2.3` | Framework full-stack (App Router, Server Components, route handlers) |
| `react` | `19.2.4` | UI library |
| `react-dom` | `19.2.4` | Renderizado DOM |
| `typescript` | `^5` | Tipado estricto |
| Node | `20-alpine` | Runtime en Docker |

### Base de datos

| Paquete | Versión | Rol |
|---------|---------|-----|
| `postgres` (Docker) | `16-alpine` | Motor de base de datos |
| `prisma` | `7.7.0` | ORM + migraciones + CLI |
| `@prisma/client` | `7.7.0` | Cliente generado (output: `src/generated/prisma`) |
| `@prisma/adapter-pg` | `7.7.0` | Adaptador Postgres nativo |
| `pg` | `8.20.0` | Driver PostgreSQL |

### Autenticación y cifrado

| Paquete | Versión | Rol |
|---------|---------|-----|
| `jsonwebtoken` | `9.0.3` | Firma/verificación JWT HS256 |
| `bcryptjs` | `3.0.3` | Hash de contraseñas (12 rondas) |
| `crypto` (nodejs builtin) | — | AES-256-GCM + scrypt para cifrado de API keys |

### Validación y contenido

| Paquete | Versión | Rol |
|---------|---------|-----|
| `zod` | `4.3.6` | Validación de schemas en todos los endpoints |
| `@tiptap/react` + 5 extensiones | `3.22.3` | Editor WYSIWYG para posts del blog |

### Email

| Paquete | Versión | Rol |
|---------|---------|-----|
| `resend` | `6.11.0` | SDK oficial para envío transaccional |

### UI / Animación

| Paquete | Versión | Rol |
|---------|---------|-----|
| `framer-motion` | `12.38.0` | Animaciones landing (hero, navbar, mobile menu) |
| `tailwindcss` | `^4` | Utility CSS |
| `@tailwindcss/postcss` | `^4` | Procesador PostCSS |

### Fonts (Google Fonts via `next/font`)

- `Oswald` — display font (títulos, botones CTA)
- `Inter` — body font (texto corriente, formularios)

Ambas con weights `400/500/600/700` y `display: swap`.

### Integraciones AI

- **OpenAI** — Chat Completions API (`gpt-4o-mini` / `gpt-4o` / `gpt-4.1-mini` / `gpt-4.1`) + Images API (DALL-E 3 `1792x1024` quality=standard)
- **Ollama** — endpoint local compatible (`/api/chat`) con modelos `llama3`, `mistral`, `mixtral`, etc.

## Versiones de scripts (package.json)

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "db:generate": "npx prisma generate",
  "db:migrate": "npx prisma migrate dev",
  "db:seed": "npx tsx prisma/seed.ts",
  "db:studio": "npx prisma studio"
}
```

## Configuración de TypeScript

- `target`: `ES2017`
- `module`: `esnext`
- `moduleResolution`: `bundler`
- `strict`: `true`
- `jsx`: `react-jsx`
- Path alias: `@/*` → `./src/*`

## Configuración de Next.js

```typescript
// next.config.ts
export default {
  output: "standalone"
};
```

El modo `standalone` genera en `.next/standalone/` un servidor autocontenido que se copia al contenedor Docker final. No requiere `node_modules` completo en runtime (excepto para Prisma migrate deploy, que sí necesitamos).

## Propiedades no obvias

1. **`.next/standalone` copia solo lo imprescindible**, pero Prisma CLI necesita node_modules completo para ejecutar migraciones. Por eso el Dockerfile copia `node_modules` entero a la imagen final (pese al tamaño).

2. **El cliente Prisma se genera a `src/generated/prisma`**, no al path por defecto. Esta carpeta está en `.gitignore`. Se regenera en cada build.

3. **El tema dual** (landing vs. admin) se activa con el atributo `data-theme="admin"` en el layout admin. Ambos temas comparten el mismo CSS pero con variables distintas mapeadas a Tailwind via `@theme inline`.

4. **Turbopack no se usa explícitamente**; Next.js 16 lo usa por defecto en `next dev`.

5. **No hay tests automatizados en el repo** (oportunidad de mejora — ver `15-future-improvements.md`).
