# 04 · Debugging de problemas comunes

Catálogo de problemas frecuentes y cómo resolverlos. Organizado por síntoma.

## Problemas de instalación

### `npm install` falla con "EACCES" o "permission denied"

**Causa:** estás ejecutando como root en Linux, o tienes un `node_modules` creado por otro usuario.

**Solución:**
```bash
sudo chown -R $(whoami) .
rm -rf node_modules package-lock.json
npm install
```

### `npm install` falla con errores de peer dependencies

**Causa:** conflictos entre versiones. Next 16 + React 19 es una combinación reciente.

**Solución:**
```bash
npm install --legacy-peer-deps
```

Si persiste, eliminar `package-lock.json` y reinstalar.

### "Prisma Client not found" / "Cannot find module '@/generated/prisma'"

**Causa:** el cliente Prisma no se ha generado.

**Solución:**
```bash
npx prisma generate
```

Si sigue fallando:
```bash
rm -rf src/generated
npx prisma generate
```

## Problemas al arrancar el dev server

### "Port 3000 already in use"

**Causa:** otro proceso usa el puerto (otro dev server, otro proyecto).

**Solución A — matar el proceso:**
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows (PowerShell)
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

**Solución B — cambiar puerto:**
```bash
PORT=3001 npm run dev
```

### "JWT_SECRET is not set" al arrancar

**Causa:** `.env` sin esa variable, o tiene valor muy corto.

**Solución:**
```bash
# Verifica que existe
cat .env | grep JWT_SECRET

# Si falta, genera uno:
echo "JWT_SECRET=\"$(openssl rand -base64 48)\"" >> .env

# Reinicia el dev server (Ctrl+C, npm run dev)
```

### Hot reload no funciona

**Causas posibles:**
- Archivos en directorio con Dropbox/OneDrive sincronizando.
- Watcher de archivos limit excedido en Linux.

**Solución Linux (aumentar watchers):**
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**Solución general:** mover el proyecto a una ruta simple tipo `C:\Dev\` o `~/dev/`.

### Cambios en `.env` no se aplican

`.env` se lee solo al arrancar. Cambios requieren **reinicio del dev server**.

```bash
# Ctrl+C
npm run dev
```

## Problemas de base de datos

### "Database connection failed" / "ECONNREFUSED"

**Causa 1:** DB no está corriendo.
```bash
docker compose ps
# Si "exited" o no aparece:
docker compose up -d db
```

**Causa 2:** puerto incorrecto o hostname mal.
```bash
# Verifica la URL
cat .env | grep DATABASE_URL

# Para dev local con DB en Docker:
# ✅ postgresql://postgres:PASS@localhost:5432/kikovargass?schema=public
# ❌ postgresql://postgres:PASS@db:5432/kikovargass?schema=public  (solo funciona dentro de Docker)
```

**Causa 3:** password incorrecto.
```bash
docker compose exec db psql -U postgres -d kikovargass
# Si pide password → la contraseña del .env no coincide con POSTGRES_PASSWORD
```

### "Drift detected: Your database schema is not in sync"

**Causa:** alguien tocó la DB manualmente sin crear migración (ej. Studio o `psql ALTER TABLE`).

**Solución en dev (pierde datos):**
```bash
npx prisma migrate reset
```

**Solución sin perder datos:**
```bash
# 1. Ver qué está drifteado
npx prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma \
  --script

# 2. Crear migración manual con el SQL de la diferencia:
npx prisma migrate dev --create-only --name fix_drift
# editar el SQL generado para invertir el drift

# 3. Aplicar
npx prisma migrate dev
```

### "Unique constraint failed on the fields: (slug)"

**Causa:** intentas crear un registro con un slug que ya existe (post, booking-link, event-page).

**Debug:**
```sql
-- Buscar el duplicado
SELECT * FROM posts WHERE slug = 'mi-slug';
```

**Solución:** usar un slug diferente en la creación, o borrar/renombrar el existente.

### Migración se quedó "failed" en la tabla `_prisma_migrations`

```sql
SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;
-- Una tiene finished_at=NULL → está colgada
```

**Solución:**
```bash
# Marcarla como rolled-back
npx prisma migrate resolve --rolled-back 20260415193000_migration_name

# Volver a aplicar
npx prisma migrate deploy
```

## Problemas de auth

### Login devuelve "Invalid credentials" aunque la password es correcta

**Causa 1:** usuario no activo (`active = false`).
```sql
SELECT email, active FROM users WHERE email = 'admin@kikovargass.com';
UPDATE users SET active = true WHERE email = 'admin@kikovargass.com';
```

**Causa 2:** password en DB no fue hasheada correctamente.
```sql
SELECT password FROM users WHERE email = '...';
-- Debería empezar por $2a$12$ o $2b$12$ (bcrypt)
-- Si es plaintext → re-seed
```

Regenerar hash:
```bash
node -e "require('bcryptjs').hash('nuevapass', 12).then(h => console.log(h))"
# Copiar el resultado
docker compose exec db psql -U postgres -d kikovargass
UPDATE users SET password = '<hash>' WHERE email = '...';
```

### Me loguea pero me redirige al login inmediatamente

**Causa 1:** `JWT_SECRET` cambió entre el login y el siguiente request. Todas las sesiones quedan inválidas.
```bash
# Verificar que el .env no cambió recientemente
# Solución: login de nuevo
```

**Causa 2:** cookie no se está seteando bien.
- Verifica en DevTools → Application → Cookies que `token` existe en `localhost`.
- Si no aparece: el browser está bloqueando cookies (settings, extensiones).

**Causa 3 (HTTPS):** cookie con `secure: true` en dev sin HTTPS.
```typescript
// src/app/api/auth/login/route.ts — revisar
secure: process.env.NODE_ENV === "production"
// Si está forzado a true en dev, la cookie no se envía
```

### "You must be admin" aunque mi usuario es admin

**Causa:** el role en la DB no es exactamente `"ADMIN"` (case sensitive).

```sql
SELECT email, role FROM users WHERE role = 'ADMIN';
-- Si devuelve vacío:
UPDATE users SET role = 'ADMIN' WHERE email = 'tu@email.com';
```

## Problemas de API

### Todas las llamadas retornan 401

**Causa:** cookie no se envía. Pasa al usar `fetch` sin `credentials: "include"`.

**Solución:** Next.js envía cookies automáticamente en same-origin. Si llamas desde otro dominio, asegurar:
```typescript
fetch("/api/...", { credentials: "include" })
```

### Error 422 con "Invalid body" genérico

Los schemas Zod dan mensajes específicos. Si ves el mensaje genérico, el request probablemente no llegó con JSON válido.

**Debug:**
- Browser DevTools → Network → ver el request body.
- Verificar header `Content-Type: application/json`.
- Verificar que el body no es `undefined`.

### Error 500 en producción sin detalles

**Ver logs:**
```bash
# En el VPS
docker compose logs app --tail 200

# Filtrar errores
docker compose logs app 2>&1 | grep -i error
```

En desarrollo, los errores aparecen en el terminal de `npm run dev`.

### Slow API (>2s por request)

**Debug:**
1. Ver qué ruta está lenta (DevTools → Network → Time column).
2. Medir tiempo de DB:
   ```typescript
   console.time("prisma-query");
   const result = await prisma.post.findMany(...);
   console.timeEnd("prisma-query");
   ```
3. Ver EXPLAIN ANALYZE en SQL (ver [`03-base-de-datos.md`](./03-base-de-datos.md)).
4. Si hay muchas queries → usar `include` para hacer join.

## Problemas con uploads

### "Failed to upload" genérico

**Causa 1:** directorio `public/uploads/` no existe o no es writable.
```bash
# En local
mkdir -p public/uploads

# En Docker (VPS)
ls -la ./uploads
sudo chown -R 1001:1001 ./uploads
```

**Causa 2:** archivo excede 5 MB.
- Verificar tamaño: `ls -lh ./archivo.jpg`
- Comprimir con https://squoosh.app

**Causa 3:** MIME no permitido.
```
Allowed: image/jpeg, image/png, image/webp
Not allowed: SVG, HEIC, GIF, BMP
```

**Causa 4:** body payload excede límite del reverse proxy.

Nginx:
```nginx
client_max_body_size 10M;
```

Caddy no tiene límite por defecto.

### Imágenes subidas devuelven 404

**Causa 1:** URL incorrecta. Ver qué URL se guardó:
```sql
SELECT url, key FROM images ORDER BY created_at DESC LIMIT 5;
```

**Causa 2:** volumen Docker no montado.
```bash
docker compose exec app ls /app/public/uploads/
# Si está vacío pero en el host sí hay archivos → volumen mal
# Revisar docker-compose.yml
```

**Causa 3:** permisos.
```bash
docker compose exec app ls -la /app/public/uploads/ | head -5
# User debe ser nextjs (UID 1001)
```

### Imagen aparece en admin pero no en landing

**Causa:** `gallery: false`. Solo las marcadas como galería aparecen en `/gallery` pública.

```sql
UPDATE images SET gallery = true WHERE id = '...';
```

O desde el admin: star icon en la galería.

## Problemas con IA

### "No OpenAI API key configured"

**Causa 1:** ni en DB ni en env var.

```bash
# Verificar en config
docker compose exec app node -e "require('./src/lib/db/prisma').prisma.siteConfig.findUnique({ where: { key: 'ai' } }).then(r => console.log(r?.value))"
# Si el campo openaiApiKey está vacío o no empieza por "enc:" → no está configurada
```

**Solución:** ir a Dashboard → Configuración → IA → pegar la key.

### La IA genera contenido pero muy mal

**Causa:** `systemPrompt` genérico.

**Solución:** editar en Dashboard → Configuración → IA → System Prompt.

Ejemplo bueno:
```
Eres el asistente de contenido de Kiko Vargas, IFBB Pro especializado en
culturismo y nutrición deportiva. Escribe en español con tono profesional
pero cercano. Publico objetivo: atletas intermedios y avanzados interesados
en competir.
```

### Generación tarda >30s

**Causa 1 (OpenAI):** modelo pesado (`gpt-4o`, `gpt-4.1`). Cambiar a `gpt-4o-mini`.

**Causa 2 (Ollama):** primera ejecución (carga el modelo en RAM). Segunda y posteriores son más rápidas.

**Causa 3 (Ollama):** modelo muy grande para el hardware. Probar `llama3` en vez de `llama3:70b`.

### DALL-E genera imagen pero no se guarda

**Ver logs del servidor:**
```bash
docker compose logs app | grep -i "generate-image"
```

**Causa común:** permisos del directorio uploads.

**Otra causa:** la URL temporal de OpenAI expiró antes de la descarga (poco probable, son ~60 min).

## Problemas con emails

### "Email no se envió" silenciosamente

**Debug:**
```bash
# En producción
docker compose logs app | grep -i "email\|resend"

# En local
# Los logs aparecen en el terminal de npm run dev
```

**Causas típicas:**
1. Resend API key no configurada.
2. Dominio `fromEmail` no verificado en Resend.
3. Rate limit de Resend excedido.

### Emails llegan a spam

**Causa:** dominio sin verificar en Resend → se envía desde `onboarding@resend.dev`.

**Solución:**
1. Resend → Domains → Add Domain.
2. Configurar DNS (MX, SPF, DKIM, DMARC).
3. Esperar verificación.
4. En panel → Configuración → Email → cambiar `fromEmail` a `noreply@tudominio.com`.

### Newsletter con 1000 destinatarios tarda minutos

Normal. Los batches de 100 se envían en serie. Mejora pendiente: queue con BullMQ (ver `DOCS-TECNICA/15-future-improvements.md`).

## Problemas con el build

### `npm run build` falla con "Type error"

Next 16 + React 19 + TypeScript estricto = errores de tipos aparecen en build pero no siempre en dev.

**Solución:** leer el error, corregir el tipo.

Error común:
```
Type 'X' is not assignable to type 'Y'
  at src/app/api/...
```

### `npm run build` falla con "Cannot find module"

```bash
# Regenerar Prisma
npx prisma generate

# Limpiar cache
rm -rf .next
npm run build
```

### Docker build falla en "npm ci"

**Causa:** `package-lock.json` desactualizado.

**Solución:**
```bash
# En local
rm package-lock.json
npm install
git add package-lock.json
git commit -m "update package-lock"

# Luego en el VPS
git pull
docker compose build app
```

### Docker build OOM (out of memory)

El build de Next.js necesita ~1 GB de RAM.

**Solución VPS pequeño:** añadir swap.
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Problemas Docker

### "kikovargas-db" exits immediately

```bash
docker compose logs db
```

Causa común: volumen con datos de una versión anterior de Postgres.

**Solución:**
```bash
# ⚠️ BORRA DATOS
docker compose down -v
docker compose up -d db
```

### "kikovargas-app" unhealthy

```bash
docker compose logs app
# Buscar la causa en los logs del entrypoint
```

**Causas frecuentes:**
- DB no arrancó a tiempo (aumentar `DB_WAIT_RETRIES` en .env).
- Migraciones fallaron.
- Puerto 3000 ocupado.

### "Cannot connect to Docker daemon"

```bash
# Linux
sudo systemctl status docker
sudo systemctl start docker

# Añadir usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### docker-compose vs docker compose

Versión 1 (legacy): `docker-compose` con guion.
Versión 2 (moderna): `docker compose` sin guion.

Verifica:
```bash
docker compose version
```

Si no funciona, instalar:
```bash
sudo apt install docker-compose-plugin
```

## Problemas específicos de Next.js

### Hydration mismatch

```
Warning: Text content did not match. Server: "X" Client: "Y"
```

**Causa:** un componente renderiza diferente en server y cliente.

**Causas típicas:**
- `new Date()` o `Math.random()` en Server Component.
- `window` o `localStorage` accedido directamente (sin `useEffect`).
- Traductores de navegador modificando el DOM.

**Solución:** mover código dependiente del cliente a `useEffect()`.

### "use client" vs Server Components

- **Server Component (default):** no puede usar `useState`, `useEffect`, event handlers, hooks.
- **Client Component (`"use client"` en primera línea):** sí puede, pero no puede usar `async/await` directo ni importar server-only libs.

Error típico:
```
Error: useState only works in Client Components
```

Añadir `"use client";` al principio del archivo.

### `router.refresh()` no actualiza la UI

**Causa:** el Server Component está cacheado.

**Solución:** usar `revalidatePath` en la API después de la mutación:
```typescript
import { revalidatePath } from "next/cache";
// ...
revalidatePath("/dashboard/posts");
```

## Herramientas de debug

### Logs del servidor

```bash
# Dev
# aparecen en el terminal de npm run dev

# Docker local
docker compose logs -f app

# Docker VPS
ssh usuario@vps
cd /opt/kikovargas
docker compose logs -f app
```

### Inspeccionar requests

Browser DevTools → Network:
- Status code
- Request headers (cookie presente?)
- Response body
- Timing

### Base de datos

```bash
# CLI
docker compose exec db psql -U postgres -d kikovargass

# GUI
npx prisma studio
# → http://localhost:5555
```

### Estado del sistema

```bash
# Memoria
docker stats

# Disco
df -h
docker system df

# Procesos Node
ps aux | grep node
```

## Cuándo pedir ayuda

Si tras 30-60 min no encuentras la causa:

1. **Capturar el error completo** — stack trace, status code, request body.
2. **Entorno:** dev local / Docker / producción VPS.
3. **Pasos para reproducir** — cuanto más concreto, mejor.
4. **Qué has intentado** — evita que te manden a hacer lo mismo.
5. **Logs relevantes** — `docker compose logs app --tail 100`.

Con esa info, otro dev puede diagnosticar en minutos lo que a ti te tomó una tarde.
