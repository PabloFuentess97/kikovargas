# 14 · Problemas conocidos y riesgos

Inventario honesto de limitaciones actuales, bugs potenciales y casos límite. Usar como checklist de auditoría y priorización.

## Bugs conocidos

### Ninguno en producción a fecha de este documento

El código en `main` está verificado con `npx next build` sin errores ni warnings. No hay bugs abiertos en el repo que bloqueen funcionalidad.

## Limitaciones intencionales (por ahora)

### 1. Sin tests automatizados

**Descripción:** no hay suite de tests (unit, integration, E2E). Todo el QA es manual.

**Riesgo:** un refactor puede introducir regresiones silenciosas.

**Mitigación actual:** TypeScript estricto + Zod en todos los endpoints capturan muchos errores en build.

**Propuesta:** Vitest para unit tests (crypto, validations), Playwright para E2E (flujos críticos: login, crear post, reservar).

### 2. Sin rate limiting

**Descripción:** cualquier endpoint público puede ser llamado sin límite.

**Endpoints vulnerables:**
- `POST /api/auth/login` — ataque de fuerza bruta contra contraseñas.
- `POST /api/contacts` — spam de formularios.
- `POST /api/newsletter/subscribe` — registro masivo de emails falsos.
- `POST /api/bookings/public` — reservas spam que bloquean slots.

**Propuesta:** `@upstash/ratelimit` con Redis, o middleware custom con LRU en memoria.

### 3. Sin CSP headers

**Descripción:** `next.config.ts` no define headers de seguridad. Falta:
- `Content-Security-Policy`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`

**Mitigación parcial:** `X-Content-Type-Options: nosniff` se setea solo en `/api/uploads/`.

**Propuesta:** añadir config en `next.config.ts` con headers globales. CSP requiere nonces (no trivial con Next inline scripts).

### 4. Sin password reset

**Descripción:** si un admin olvida la contraseña, no hay flujo de recuperación.

**Workaround actual:** acceso directo a DB y ejecutar `UPDATE users SET password = '<new_bcrypt_hash>' WHERE email = '...'`.

**Propuesta:** endpoint `POST /api/auth/reset-password-request` que envía email con token de un solo uso. Tabla adicional `password_reset_tokens`.

### 5. Sin 2FA

**Descripción:** solo autenticación password.

**Propuesta:** TOTP via `otplib`. Campo `twoFactorSecret` en `User`. Flujo de enrolment + verificación en login.

### 6. Sin logs estructurados

**Descripción:** errores y eventos se loguean con `console.error` / `console.log`. En producción se pierden.

**Propuesta:** `pino` o `winston` + integración con servicio (Logtail, Datadog, CloudWatch).

### 7. Sin métricas de uso

**Descripción:** no hay instrumentación de latencia de endpoints, errores 5xx, uso de DB connection pool.

**Propuesta:** `/api/metrics` en formato Prometheus + dashboard Grafana.

### 8. Sin magic bytes check en uploads

**Descripción:** la validación de tipo de archivo se hace sobre el `Content-Type` header del navegador, que puede falsearse.

**Riesgo:** archivo malicioso con extensión `.jpg` que realmente es un ejecutable o un SVG con scripts.

**Mitigación actual:** solo se aceptan 3 MIMEs, SVG está deshabilitado, filename sanitizado, no se ejecuta el archivo.

**Propuesta:** leer los primeros bytes del archivo y verificar la magic signature (ej. JPEG: `FF D8 FF`, PNG: `89 50 4E 47`).

## Casos límite (edge cases)

### 1. Doble reserva al mismo slot

**Escenario:** dos clientes cargan el calendario a las 16:55, ambos ven las 17:00 libre, ambos envían POST a las 17:00:00.

**Comportamiento actual:** race condition. Uno gana, otro recibe 409 Conflict.

**Severidad:** baja (el segundo recibe error user-friendly y recarga los slots).

**Mejora:** lock pesimista con `SELECT ... FOR UPDATE` antes del INSERT. O usar un unique constraint sobre `(linkId, date)`.

### 2. Imágenes huérfanas

**Escenario:** usuario sube 5 imágenes al `/api/upload` con éxito. Antes de llamar a `/api/images` para cada una, cierra el navegador.

**Resultado:** 5 archivos en `public/uploads/` sin registro en DB. Consumen disco pero no son accesibles desde el admin.

**Mitigación actual:** ninguna.

**Propuesta:** cron job semanal que compara archivos en disco vs. `Image.key` y borra huérfanos.

### 3. Rotación de ENCRYPTION_KEY

**Escenario:** admin rota `ENCRYPTION_KEY` en el `.env`. Tras el restart, todas las API keys en DB son inaccesibles.

**Comportamiento actual:** `decryptSensitiveFields()` devuelve `""` para campos que fallan. El admin ve los campos vacíos en settings y debe re-introducirlos.

**Riesgo:** si no se da cuenta, la IA y email dejan de funcionar silenciosamente.

**Propuesta:** script `scripts/rotate-encryption-key.ts` que acepta old + new key, descifra con old, cifra con new, actualiza en transacción.

### 4. Timezone del servidor cambia

**Escenario:** VPS migra de `Europe/Madrid` a `UTC`.

**Impacto:** todos los `Availability.startTime`/`endTime` (strings `"HH:mm"` en hora local) se reinterpretan. Las reservas ya agendadas mantienen `date` UTC correcto, pero las nuevas aparecen en horas incorrectas.

**Mitigación actual:** fijar `TZ` en Docker compose.

**Propuesta:** almacenar la timezone del negocio en `SiteConfig`. Convertir explícitamente.

### 5. Payload JSON muy grande en EventBlock

**Escenario:** bloque Gallery con 100 imágenes, cada una con URL y alt largo.

**Impacto:** `EventBlock.data` puede pasar 100 KB. PostgreSQL JSONB aguanta hasta ~1 GB por fila pero la serialización ralentiza.

**Mitigación:** no hay límite enforced.

**Propuesta:** Zod límite de N items en arrays. Extraer galleries a tabla separada con FK.

### 6. Campaign send falla a la mitad

**Escenario:** se envía campaña a 3.000 suscriptores. Resend falla en el email #1500.

**Comportamiento actual:** los primeros 1500 reciben el email. Los siguientes ~1500 fallan. `Campaign.sentCount` refleja los exitosos. Los fallos van a log.

**Sin reintentos automáticos.** El admin ve "sent: 1500, failed: 1500" y debe decidir qué hacer.

**Propuesta:** tabla `campaign_deliveries` con una fila por destinatario y estado. Permite reintento de solo los fallados.

### 7. Slug de post colisiona tras rename

**Escenario:** post A tiene slug `guia-nutricion`. Admin lo cambia a `guia-nutricion-2025`. Post B ahora puede usar `guia-nutricion`. Pero si alguien tiene bookmarked el primer slug, 404.

**Comportamiento actual:** sin redirects.

**Propuesta:** tabla `post_redirects` que mapea slug viejo → slug nuevo. Middleware/404 handler que redirecciona.

### 8. Ollama endpoint no responde

**Escenario:** `ai.provider = "local"` pero Ollama no está corriendo.

**Comportamiento actual:** el fetch lanza error. El handler retorna 500 con mensaje técnico. La UI muestra "Error al generar".

**Mitigación:** mejorar mensaje de error → "No se puede conectar al endpoint local. ¿Ollama está corriendo?".

### 9. DALL-E retorna imagen pero falla la descarga

**Escenario:** DALL-E genera URL temporal, el servidor intenta descargarla pero hay timeout.

**Comportamiento actual:** handler retorna 500. El coste de DALL-E ya se pagó.

**Propuesta:** fallback — retornar la URL temporal al cliente. El cliente la usa hasta que expira (~1h), durante ese tiempo el admin puede decidir re-generar.

### 10. `.env` en Docker host filtrado por logs

**Escenario:** un log accidental con `console.log(process.env)` en un handler.

**Impacto:** JWT_SECRET, POSTGRES_PASSWORD, API keys filtrados a stdout/stderr → potencialmente a sistemas de logs externos.

**Mitigación actual:** ninguna (convención de no hacerlo).

**Propuesta:** lint rule que prohíba `process.env` fuera de `src/lib/**` y `docker-entrypoint.sh`.

## Riesgos operacionales

### Disco saturado por uploads

Subir muchas imágenes HD → `uploads/` puede crecer a GBs. Si el VPS tiene disco limitado, puede provocar caída.

**Detección:** monitor de disco (netdata, node_exporter).

**Mitigación futura:** migrar uploads a S3/R2, con el campo `url` apuntando al bucket.

### Base de datos sin backup

Si el VPS tiene fallo de hardware y no hay backups: pérdida total de datos.

**Mitigación:** ver `12-deployment.md` sección backups. Verificar que el cron corre y que los .gz no están corruptos.

**Mejora:** backup offsite (S3 bucket con versioning).

### Ataque DDoS

Sin rate limiting ni WAF, un atacante puede saturar el servidor.

**Mitigación:** Cloudflare/similar delante del reverse proxy.

### Secret leak via git

Si alguien commit `.env`:
1. Revocar todas las API keys inmediatamente.
2. `git filter-branch` o BFG Repo-Cleaner para limpiar el historial.
3. Force push a todos los remotes.
4. Rotar `JWT_SECRET` y `ENCRYPTION_KEY`.

**Prevención:** `.env` en `.gitignore` (ya está). Pre-commit hook que detecte patterns de secrets.

## Dependencias con vulnerabilidades potenciales

Ejecutar periódicamente:
```bash
npm audit
npm audit fix
```

Y verificar en [https://socket.dev](https://socket.dev) o Snyk.

**Dependencias críticas a monitorear:**
- `next` — crítica, actualizar con cuidado (breaking changes frecuentes)
- `jsonwebtoken` — histórico de CVEs
- `bcryptjs` — estable, pocas actualizaciones
- `@tiptap/*` — XSS en contenido pegado
- `prisma` — nuevas versiones pueden requerir regenerate

## Compatibilidad de navegadores

**Target:** Chrome/Edge/Firefox/Safari últimas 2 versiones.

**No soportado:**
- IE11
- Opera Mini
- Navegadores móviles < iOS 14 / Android 8

**Features usadas que podrían romper en navegadores antiguos:**
- `CSS clamp()` (para typography fluida)
- `CSS Grid` + `subgrid` en algunos sitios
- `IntersectionObserver` (framer-motion y scroll tracking)
- `fetch` con AbortController
- `navigator.clipboard.writeText` (copy buttons)

## Accesibilidad — gaps

- **Contraste:** mayoría cumple WCAG AA, pero algunos texto secundario en muy bajo opacity (0.6) en rgb(122, 122, 122) puede no cumplir.
- **Focus rings:** implementados via `:focus-visible`. OK.
- **Skip links:** no implementados. Un usuario con teclado debe tabear por navbar completo antes de llegar al contenido.
- **Alt text:** se genera auto-desde filename. Los admins deben revisarlo.
- **Form errors:** no siempre anunciados a screen readers (falta `aria-invalid` + `aria-describedby`).
- **Animaciones:** no respetan `prefers-reduced-motion`. Usuarios con vestibular disorder pueden tener problemas con el parallax del hero.

## Seguridad del build

- Docker build usa `DATABASE_URL=dummy` y `JWT_SECRET=placeholder` durante build time. Estos no se propagan al runtime (se sobreescriben en compose). OK.
- `.next/standalone` generado en build time incluye el contenido compilado — si cambia un texto en `landing-defaults.ts`, requiere rebuild completo. El contenido de DB sí se actualiza sin rebuild.

## Riesgo: regeneración de Prisma client

Tras editar `schema.prisma`, es obligatorio `npx prisma generate`. Si no se hace:
- TypeScript podría seguir compilando (tipos viejos).
- En runtime las nuevas columnas fallan.

**Mitigación:** `docker-entrypoint.sh` NO regenera el client (se espera que esté ya en la imagen). El flujo correcto es:
1. Editar `schema.prisma`.
2. `npx prisma migrate dev --name xxx` (localmente).
3. Commit incluyendo `prisma/migrations/`.
4. En deploy, el `Dockerfile` ejecuta `npx prisma generate` en stage de build.

Si se salta el paso 2, el deploy falla porque el migrate deploy no tiene nada que aplicar pero el código espera el schema nuevo.
