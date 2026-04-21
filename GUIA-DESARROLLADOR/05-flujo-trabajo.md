# 05 · Flujo de trabajo diario

Cómo se trabaja en el proyecto día a día: añadir features, hacer commits, revisar PRs.

## Inicio de jornada

```bash
cd /ruta/al/kikovargas

# 1. Traer cambios del remoto
git pull

# 2. Instalar si hay nuevas deps
npm install

# 3. Aplicar migraciones si hay nuevas
npx prisma migrate dev
npx prisma generate

# 4. Levantar DB
docker compose up -d db

# 5. Arrancar dev server
npm run dev
```

## Crear una nueva feature

Ejemplo: añadir un sistema de "posts favoritos" para los usuarios.

### 1. Crear una rama

```bash
git checkout main
git pull
git checkout -b feat/post-favorites
```

**Convenciones de nombres de ramas:**
- `feat/<descripcion>` — nueva funcionalidad
- `fix/<descripcion>` — corrección de bug
- `refactor/<descripcion>` — mejora sin cambio de comportamiento
- `docs/<descripcion>` — solo documentación
- `chore/<descripcion>` — dependencias, config, herramientas

### 2. Planificar los cambios

Típicamente un feature involucra 5-7 capas. Para "post favoritos":

1. **Schema DB** — nueva tabla `favorites` o campo en `users`
2. **API** — endpoints POST/DELETE para (des)favoritear
3. **Server code** — función helper en `src/lib/services/`
4. **Server Component** — consulta inicial de favoritos
5. **Client Component** — botón con estado + fetch
6. **UI component** — si se reutiliza (ej. icono de corazón)
7. **Tests** — no aplica actualmente (no tests en repo)

### 3. Modificar la DB (si aplica)

```bash
# Editar prisma/schema.prisma
# Añadir:
model Favorite {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  postId    String   @map("post_id")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId])
  @@index([userId])
  @@map("favorites")
}

# Modelo User y Post necesitan la relación también (ver 03-base-de-datos.md)

# Crear migración
npx prisma migrate dev --name add_favorites
```

### 4. Crear los endpoints API

Archivo `src/app/api/favorites/route.ts`:
```typescript
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

const createSchema = z.object({
  postId: z.string()
});

// Toggle favorite
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return error("Unauthorized", 401);

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const existing = await prisma.favorite.findUnique({
    where: { userId_postId: { userId: session.sub, postId: parsed.data.postId } }
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return success({ favorited: false });
  }

  await prisma.favorite.create({
    data: { userId: session.sub, postId: parsed.data.postId }
  });

  return success({ favorited: true });
}

export async function GET() {
  const session = await getSession();
  if (!session) return error("Unauthorized", 401);

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.sub },
    include: { post: true },
    orderBy: { createdAt: "desc" }
  });

  return success({ favorites });
}
```

**Añadir `/api/favorites` al middleware** si debe ser público — en este caso no lo es.

### 5. Crear el componente cliente

Archivo `src/components/favorite-button.tsx`:
```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FavoriteButton({
  postId,
  initialFavorited
}: {
  postId: string;
  initialFavorited: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);

    // Optimistic update
    setFavorited(f => !f);

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId })
      });

      if (!res.ok) {
        // Rollback
        setFavorited(initialFavorited);
        throw new Error();
      }

      const { data } = await res.json();
      setFavorited(data.favorited);
    } catch {
      setFavorited(initialFavorited);
    }

    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`${favorited ? "text-a-accent" : "text-muted"} hover:text-a-accent transition-colors`}
      aria-label={favorited ? "Quitar de favoritos" : "Añadir a favoritos"}
    >
      {favorited ? "♥" : "♡"}
    </button>
  );
}
```

### 6. Usar en un Server Component

Archivo `src/app/blog/[slug]/page.tsx`:
```typescript
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { FavoriteButton } from "@/components/favorite-button";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || post.status !== "PUBLISHED") notFound();

  const session = await getSession();
  let isFavorited = false;
  if (session) {
    const fav = await prisma.favorite.findUnique({
      where: { userId_postId: { userId: session.sub, postId: post.id } }
    });
    isFavorited = !!fav;
  }

  return (
    <article>
      <h1>{post.title}</h1>
      {session && <FavoriteButton postId={post.id} initialFavorited={isFavorited} />}
      {/* ... */}
    </article>
  );
}
```

### 7. Probar manualmente

- Login como admin.
- Visitar un post del blog.
- Click en el corazón.
- Verificar en DB:
  ```sql
  SELECT * FROM favorites;
  ```
- Recargar la página → el corazón debe seguir lleno.

### 8. Verificar que el build pasa

```bash
npm run build
```

Si aparece algún error de TypeScript, corregir antes de commitear.

### 9. Commit y push

```bash
git add .
git status   # revisa qué va a commitearse

git commit -m "feat: add post favorites system

- New Favorite model with user-post unique constraint
- POST /api/favorites toggles favorite status
- GET /api/favorites lists user favorites
- Heart button in blog post pages
"

git push -u origin feat/post-favorites
```

### 10. Abrir pull request

En GitHub:
- Título claro (el mismo formato que el commit).
- Descripción con: qué cambia, cómo se probó, screenshots si aplica.
- Assign reviewer.
- Labels apropiadas.

## Convenciones de commit

Basado en Conventional Commits:

```
<tipo>: <descripción corta>

<descripción larga opcional>

<BREAKING CHANGE, si aplica>
```

### Tipos

- `feat:` — nueva funcionalidad
- `fix:` — corrección de bug
- `refactor:` — cambio sin alterar comportamiento
- `docs:` — solo documentación
- `style:` — formateo, sin cambio de lógica
- `chore:` — dependencias, config
- `perf:` — mejora de performance
- `test:` — añadir o corregir tests

### Ejemplos

```
feat: add post favorites system
fix: prevent duplicate bookings for the same slot
refactor: extract Prisma queries to service layer
docs: update deployment guide
chore: upgrade next to 16.2.4
perf: add index on posts(status, published_at)
```

### Descripción larga

Útil para features complejas:
```
feat: add post favorites system

- New Favorite model with @@unique([userId, postId])
- POST /api/favorites toggles favorite state
- GET /api/favorites returns user's favorites ordered desc
- FavoriteButton client component with optimistic updates
- Integration in blog post pages for logged-in users
```

## Pull request checklist

Antes de marcar "Ready for review":

- [ ] `npm run build` pasa sin errores
- [ ] `npm run lint` sin warnings nuevos
- [ ] Se probó manualmente el flujo principal
- [ ] Si hay migraciones: `prisma/migrations/` commiteado
- [ ] `schema.prisma` actualizado
- [ ] Variables de entorno nuevas añadidas a `.env.example`
- [ ] Endpoints sensibles usan `requireAdmin()` o `getSession()`
- [ ] Zod schemas para validar inputs
- [ ] Sin `console.log` de debug residual
- [ ] Sin credenciales hardcoded
- [ ] Documentación actualizada si aplica (DOCS-TECNICA)

## Code review

### Como reviewer

**Revisar en este orden:**
1. **Seguridad:** autenticación, autorización, validación de inputs.
2. **Correctness:** casos límite, manejo de errores.
3. **Performance:** N+1 queries, loops con fetch, missing indexes.
4. **DX:** naming, estructura, readability.
5. **Estilo:** convenciones del proyecto, formateo.

**Comentarios constructivos:**
- "Esto podría fallar si `user.role` es `null`." (señalar el problema)
- "Sugiero extraer a un helper porque se repite 3 veces." (proponer solución)
- "¿Qué pasa si la request es concurrente?" (preguntar, no afirmar)

**Evitar:**
- "Esto está mal." (sin explicación)
- "Tiene que ser así." (sin argumento)
- Nitpicking sobre estilo si no hay linter configurado.

### Como author

**Responder a los comentarios:**
- Aceptar y corregir → "Fixed en commit abc123."
- Aceptar pero fuera de alcance → "Good catch. Lo dejo para otra PR."
- No aceptar con argumento → "Prefiero mantenerlo así porque X."

**Nunca tomar personalmente** los comentarios. El código no eres tú.

## Deploy a producción

Cuando un PR se mergea a `main`:

1. GitHub Actions (si estuviera configurado) buildearía la imagen.
2. Manualmente: SSH al VPS.
3. `cd /opt/kikovargas && git pull && docker compose build app && docker compose up -d app`.
4. Verificar:
   ```bash
   docker compose logs -f app
   curl -I https://kikovargass.com
   ```

Ver [`02-deploy-docker.md`](./02-deploy-docker.md) para detalle.

## Hotfix urgente

Bug crítico en producción:

```bash
# 1. Rama desde main
git checkout main
git pull
git checkout -b fix/critical-auth-bug

# 2. Fix mínimo, sin cambios de scope
# ... edit file

# 3. Commit y push
git add .
git commit -m "fix: critical auth bypass when email is empty"
git push

# 4. PR y merge rápido
# 5. Deploy inmediato

# 6. Monitorear logs durante 10 minutos
ssh usuario@vps
cd /opt/kikovargas
docker compose logs -f app
```

**Tras el incidente:** escribir postmortem breve (qué pasó, impacto, causa raíz, qué se hará para prevenir).

## Añadir una nueva dependencia

**Antes de añadir:**
- ¿Se puede hacer con node builtin?
- ¿Es mantenida activamente? (último commit <6 meses)
- ¿Cuántas stars/descargas?
- ¿Tiene vulnerabilidades? `npm info <paquete>`

**Proceso:**
```bash
npm install <paquete>
# O para dev-only:
npm install --save-dev <paquete>

# Verifica que funciona
# Commit con package.json + package-lock.json
git add package.json package-lock.json
git commit -m "chore: add <paquete> for X"
```

## Tareas comunes en el día a día

### Añadir un nuevo endpoint

Ver ejemplo en sección "Crear una nueva feature" arriba. Checklist:
- Ruta en `src/app/api/.../route.ts`
- Schema Zod para validar body
- `requireAdmin()` o `getSession()` según auth
- Retorno con `success()` / `error()`
- Si es público: añadir a `PUBLIC_PATHS` en `src/middleware.ts`
- Documentar en `DOCS-TECNICA/04-api.md`

### Añadir una nueva página admin

1. Crear `src/app/(admin)/dashboard/mi-seccion/page.tsx` (Server Component).
2. `await requireAdmin()` al inicio.
3. Fetch data con Prisma.
4. Pasa a Client Component si necesita interactividad.
5. Añadir entry al sidebar en `src/app/(admin)/admin-sidebar.tsx` (array `NAV_SECTIONS`).

### Añadir un nuevo bloque al event builder

Ver `DOCS-TECNICA/10-landing-builder.md` sección "Extensibilidad — añadir un nuevo tipo de bloque".

### Cambiar el diseño de la landing

1. Textos: desde `/dashboard/settings` (no requiere código).
2. Layout o estructura: editar los componentes en `src/components/landing/`.
3. Colores: desde `/dashboard/settings → Colores` o directamente en `src/lib/config/landing-defaults.ts`.
4. Tokens CSS: `src/app/globals.css`.

### Añadir un idioma

Actualmente solo español. Internacionalización (i18n) requeriría:
1. `next-intl` o `next-i18next`.
2. Mover todos los strings a archivos JSON por locale.
3. Rutas con `[locale]` prefix.
4. Actualizar `<html lang>`.

**Esfuerzo:** 2-3 semanas.

## Trabajo async con el equipo

- **Commits pequeños y frecuentes** > commits enormes al final del día.
- **PRs enfocadas** — una feature = una PR.
- **Comunicar bloqueos** rápido (no esperar a la daily).
- **Documentar decisiones importantes** en el PR description o ADR (architecture decision record).
- **Actualizar DOCS-TECNICA/** si el cambio afecta la arquitectura.

## Recursos útiles

- **Next.js 16 docs:** https://nextjs.org/docs
- **Prisma docs:** https://www.prisma.io/docs
- **Tailwind v4:** https://tailwindcss.com/docs
- **TipTap:** https://tiptap.dev/docs/editor
- **Resend:** https://resend.com/docs
- **OpenAI API:** https://platform.openai.com/docs

## Canales recomendados

- **Slack/Discord interno** para preguntas rápidas.
- **GitHub Issues** para tracking de bugs y features.
- **GitHub Discussions** para arquitectura y decisiones.
- **Linear/Jira** (si se usa) para planning.
