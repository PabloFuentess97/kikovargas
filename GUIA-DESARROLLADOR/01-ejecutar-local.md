# 01 · Ejecutar el proyecto en local

Dos opciones según el caso de uso.

## Opción A — Dev puro (recomendado para trabajar)

Solo el DB en Docker. La app Next.js corre nativa con hot reload.

### Setup inicial (una sola vez)

**1. Clonar el repositorio**
```bash
git clone https://github.com/PabloFuentess97/kikovargas.git
cd kikovargas
```

**2. Instalar dependencias de Node**
```bash
npm install
```

Instala ~500 MB en `node_modules/`. Tarda 1-3 minutos la primera vez.

**3. Crear archivo de entorno**
```bash
cp .env.example .env
```

**4. Editar `.env`** (mínimo viable)
```bash
# Para dev local usando el DB de Docker:
DATABASE_URL="postgresql://postgres:devpass@localhost:5432/kikovargass?schema=public"
POSTGRES_PASSWORD="devpass"

# JWT_SECRET obligatorio, min 32 chars. Genéralo con:
#   openssl rand -base64 48
JWT_SECRET="cambiar-por-32-chars-o-mas-obligatorio!!"

# Opcional para dev — sin esto la IA y emails no funcionan pero el resto sí:
RESEND_API_KEY=""
OPENAI_API_KEY=""

NODE_ENV="development"
APP_PORT="3000"
```

**5. Arrancar solo el DB en Docker**
```bash
docker compose up -d db
```

Verifica que está corriendo:
```bash
docker compose ps
# Debería mostrar kikovargas-db en estado "healthy"
```

**6. Aplicar migraciones**
```bash
npx prisma migrate deploy
```

Deberías ver:
```
6 migrations found in prisma/migrations
Applying migration `0_init`
Applying migration `1_add_site_config`
...
The following migration(s) have been applied...
```

**7. Generar el cliente Prisma**
```bash
npx prisma generate
```

Crea `src/generated/prisma/`. Si cambias `schema.prisma` más tarde, ejecuta esto de nuevo.

**8. Crear usuario admin**
```bash
npx tsx prisma/seed.ts
```

Verás los credenciales por defecto impresos. Cámbialos **inmediatamente** después del primer login.

**9. Arrancar el servidor de desarrollo**
```bash
npm run dev
```

Salida esperada:
```
   ▲ Next.js 16.2.3
   - Local:        http://localhost:3000
   - Environments: .env

 ✓ Ready in 1.5s
```

### Workflow diario

**Al empezar a trabajar:**
```bash
# Asegurar DB arriba
docker compose up -d db

# Si has hecho pull reciente, reinstalar deps por si cambiaron
npm install

# Si hay migraciones nuevas
npx prisma migrate deploy
npx prisma generate

# Arrancar dev
npm run dev
```

**Al acabar:**
```bash
# Ctrl+C para parar npm run dev
# DB puede quedar corriendo; consume ~50 MB RAM
# Si quieres parar todo:
docker compose stop db
```

### Hot reload

- Cambios en `src/**/*.tsx` y `src/**/*.ts` → recarga automática.
- Cambios en `src/app/api/**/route.ts` → recarga automática.
- Cambios en `prisma/schema.prisma` → **NO se recargan solos**. Ejecutar `npx prisma migrate dev` (ver `03-base-de-datos.md`).
- Cambios en `.env` → **reiniciar el dev server** (Ctrl+C, `npm run dev`).
- Cambios en `next.config.ts` → reiniciar.
- Cambios en `middleware.ts` → recarga automática pero a veces requiere reinicio para que aplique a todas las rutas.

### Comandos npm útiles

```bash
npm run dev        # Dev server con hot reload
npm run build      # Build de producción (verifica que compila)
npm run start      # Correr el build de producción
npm run lint       # ESLint

npm run db:generate  # Regenerar cliente Prisma
npm run db:migrate   # Crear nueva migración (prompt interactivo)
npm run db:seed      # Ejecutar seed
npm run db:studio    # GUI web de Prisma para ver/editar DB
```

## Opción B — Todo en Docker (producción-like)

Útil para reproducir el entorno de VPS en local, o si no quieres instalar Node.

```bash
docker compose up -d
```

Esto construye la imagen de la app y arranca db + app. Primera vez tarda 3-5 minutos (build).

**Ver logs:**
```bash
docker compose logs -f app
```

**Entrar al contenedor:**
```bash
docker compose exec app sh
# Dentro:
ls -la
cat .next/standalone/server.js   # el servidor de prod
npx prisma studio
```

**Reconstruir tras cambios en código:**
```bash
docker compose build app
docker compose up -d app
```

**Limitación:** no hay hot reload. Para dev real, usar Opción A.

## Acceso a servicios

Con el dev server corriendo:

| Servicio | URL | Credenciales |
|----------|-----|--------------|
| App (landing) | http://localhost:3000 | — |
| Login admin | http://localhost:3000/login | `admin@kikovargass.com` / `changeme12345678` |
| Dashboard | http://localhost:3000/dashboard | (requiere login) |
| Prisma Studio | http://localhost:5555 | `npm run db:studio` |
| PostgreSQL directo | localhost:5432 | `postgres` / `devpass` |

### Conectarse al DB directamente

```bash
# Con psql local (si tienes postgres-client instalado):
psql postgresql://postgres:devpass@localhost:5432/kikovargass

# Con docker exec (sin psql local):
docker compose exec db psql -U postgres -d kikovargass

# Queries útiles:
\dt                        # Listar tablas
\d users                   # Describir tabla
SELECT * FROM users;
SELECT key, value FROM site_config;
\q                         # Salir
```

## Variables de entorno explicadas

| Variable | Obligatoria en local | Uso |
|----------|---------------------|-----|
| `DATABASE_URL` | Sí | Conexión al DB |
| `POSTGRES_PASSWORD` | Sí (docker-compose) | Password del contenedor db |
| `JWT_SECRET` | **Sí, min 32 chars** | Firma de JWT |
| `ENCRYPTION_KEY` | No | Fallback a JWT_SECRET. Mejor definirla distinta |
| `RESEND_API_KEY` | No | Sin esto, emails silenciosamente no se envían |
| `OPENAI_API_KEY` | No | Fallback si no está en DB. IA no funciona sin esto |
| `NODE_ENV` | Sí | `development` en local |
| `APP_PORT` | No | Solo afecta Docker; dev server usa siempre 3000 |

### Generar secretos

```bash
# JWT_SECRET (48 chars random base64)
openssl rand -base64 48

# Si no tienes openssl (Windows sin Git Bash):
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

## Probar funcionalidades

### Crear un post de prueba

1. Login como admin.
2. Dashboard → Posts → "Nuevo post".
3. Si tienes OpenAI configurada:
   - Escribe "nutrición proteica" en el input de topic.
   - Click "Generar artículo".
   - Esperar 5-15s.
4. Sin OpenAI: rellenar título, slug, content manualmente.
5. Cambiar estado a "Publicado".
6. Guardar.
7. Visitar `/blog/{slug}`.

### Probar el sistema de reservas

1. Dashboard → Disponibilidad → click "Lunes-Viernes 15:00-21:00" → Guardar.
2. Dashboard → Reservas > Enlaces → Nuevo: slug=`test`, título=`Test`, duración=30.
3. Abrir `/book/test` en ventana incógnito.
4. Elegir un día, hora, rellenar form.
5. Verificar que llega al admin (Dashboard → Reservas).

### Probar email (requiere Resend)

1. Dashboard → Configuración → tab "Email".
2. Pegar `RESEND_API_KEY` (obtenida en resend.com).
3. Guardar.
4. Enviar un formulario de contacto desde la landing.
5. Revisar bandeja del `contactEmailTo`.

## Performance tips

**Dev server lento en Windows:** evita que el proyecto esté en un directorio con OneDrive/Dropbox sincronizando. Mueve a `C:\Dev\kikovargas` o similar.

**Hot reload lento:** revisa que no tengas otro proceso hogging CPU. `next dev` usa Turbopack por defecto en Next 16 — si no funciona bien, probar:
```bash
npm run dev -- --no-turbo
```

**RAM alta:** el dev server puede usar 1-2 GB. Normal para un proyecto de este tamaño.

## Logout y reset

```bash
# Cerrar sesión del admin (desde el panel o manualmente borra cookies)
# Ctrl+Shift+Delete en el navegador → borrar cookies de localhost

# Resetear password del admin sin password reset flow:
docker compose exec db psql -U postgres -d kikovargass
UPDATE users SET password = '$2a$12$nuevohashbcrypt' WHERE email = 'admin@kikovargass.com';
```

Para generar un hash bcrypt desde CLI:
```bash
node -e "const b=require('bcryptjs');b.hash('nuevapassword', 12).then(console.log)"
```

## Próximos pasos

- Si todo funciona: pasa a [`05-flujo-trabajo.md`](./05-flujo-trabajo.md) para el flujo de desarrollo diario.
- Si algo no funciona: [`04-debugging.md`](./04-debugging.md).
- Si quieres desplegar: [`02-deploy-docker.md`](./02-deploy-docker.md).
