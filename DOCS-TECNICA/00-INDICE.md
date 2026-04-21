# Documentación Técnica — kikovargas.fit

Documento interno para el equipo de desarrollo. No simplificado. No omite detalles.

**Repositorio:** `github.com/PabloFuentess97/kikovargas`
**Stack principal:** Next.js 16.2.3 · React 19.2.4 · PostgreSQL 16 · Prisma 7.7.0 · TypeScript 5
**Última revisión:** Abril 2026

## Índice

| # | Documento | Contenido |
|---|-----------|-----------|
| 01 | [Visión general](./01-overview.md) | Stack, versiones, propósito del proyecto |
| 02 | [Arquitectura](./02-arquitectura.md) | Estructura de carpetas, separación de capas, módulos clave |
| 03 | [Base de datos](./03-database.md) | Esquema Prisma completo, modelos, relaciones |
| 04 | [API](./04-api.md) | 37 endpoints, request/response, autenticación |
| 05 | [Panel de administración](./05-admin-panel.md) | Estructura, secciones, flujos de trabajo |
| 06 | [Sistema de IA](./06-ai-system.md) | OpenAI + Ollama, prompts, flujo de generación |
| 07 | [Carga de archivos](./07-file-upload.md) | Almacenamiento local, validación, volúmenes Docker |
| 08 | [Seguridad](./08-security.md) | JWT, cifrado AES-256-GCM, validación, middleware |
| 09 | [Sistema de email](./09-email-system.md) | Resend, configuración dinámica, disparadores |
| 10 | [Landing builder](./10-landing-builder.md) | Sistema de bloques, 14 tipos, renderizado |
| 11 | [Sistema de reservas](./11-booking-system.md) | Enlaces, disponibilidad, expiración, flujo de email |
| 12 | [Despliegue](./12-deployment.md) | Dockerfile, docker-compose, volúmenes, variables |
| 13 | [Sistema de configuración](./13-configuration.md) | SiteConfig, cifrado, gestión de API keys |
| 14 | [Problemas conocidos y riesgos](./14-known-issues.md) | Bugs potenciales, casos límite, mejoras pendientes |
| 15 | [Mejoras futuras](./15-future-improvements.md) | Ideas de escalabilidad, oportunidades de refactor |

## Convenciones del documento

- Rutas: absolutas desde la raíz del repo (ej. `src/lib/auth/session.ts`)
- Endpoints: formato `MÉTODO /ruta` (ej. `POST /api/posts`)
- Variables de entorno: `UPPER_SNAKE_CASE`
- Modelos de DB: PascalCase en Prisma, snake_case en columnas
- Ejemplos de código: bloques fenced con lenguaje especificado

## Lecturas recomendadas (orden)

Para onboarding de un desarrollador nuevo:
1. `01-overview.md` (15 min)
2. `02-arquitectura.md` (20 min)
3. `12-deployment.md` (leer mientras levantas el entorno local)
4. `03-database.md` (referencia — volver cuando se necesite)
5. `08-security.md` (crítico entender antes de tocar código de auth/config)
6. `04-api.md` (referencia)
7. Resto según el área en la que vayas a trabajar
