# 05 · Panel de administración

## Arquitectura

**Ruta:** `/dashboard` (todo bajo el route group `(admin)/`).

**Guard:** `src/app/(admin)/layout.tsx` invoca `await requireAdmin()` al inicio. Si no hay sesión o el rol no es `ADMIN`, se lanza un error que Next.js convierte en `401` → redirige a `/login` via middleware en el siguiente request.

**Tema:** el layout aplica `data-theme="admin"` al `<div>` raíz, activando las variables CSS del tema admin (ver `src/app/globals.css`).

## Estructura del sidebar

Definido en `src/app/(admin)/admin-sidebar.tsx` como un array `NAV_SECTIONS`:

```typescript
const NAV_SECTIONS = [
  { label: "Principal",  items: [Dashboard, Analytics] },
  { label: "Contenido",  items: [Posts, "Ideas IA", Galeria] },
  { label: "Newsletter", items: [Campanas, Suscriptores] },
  { label: "Reservas",   items: ["Enlaces", Reservas, Disponibilidad] },
  { label: "Eventos",    items: ["Landing Pages"] },
  { label: "Ayuda",      items: ["Guia de uso"] },
  { label: "Gestion",    items: [Contactos, Usuarios, Configuracion] },
];
```

**Responsive:**
- Desktop (md+): sidebar fijo 250px.
- Mobile (<md): top bar con hamburger, drawer de 280px desde la izquierda.

**Active state** marcado con `pathname.startsWith(href)` (excepto `/dashboard` exact match).

## Secciones

### `/dashboard` — Dashboard principal

**Archivo:** `src/app/(admin)/dashboard/page.tsx` (Server Component)

Fetchea en paralelo con `Promise.all()`:
- Count de posts (total, published, draft)
- Count de contactos (total, pending)
- Count de imágenes de galería
- Count de usuarios
- Últimos 5 posts
- Últimos 5 contactos

Layout:
- `<PageHeader>` con saludo dinámico por hora del día.
- Grid de 4 `<StatCard>` con iconos SVG inline.
- Grid de 2 `<Card>` ("Posts recientes" / "Mensajes recientes") con lista de últimos 5 items cada uno.

### `/dashboard/analytics`

Server Component que fetchea `/api/analytics/stats`. Render:
- Stats globales (total, hoy, semana, mes)
- Top 10 páginas
- Top 10 países
- Desglose por dispositivo / browser / OS
- Gráfico de visitas últimos 30 días

### `/dashboard/posts`

**Server Component** carga todos los posts ordenados por `createdAt desc`.
Pasa a `<PostsListClient>` (client) que:
- Renderiza `<PageHeader>` con botón "+ Nuevo post".
- Tabs de filtro: Todos / Borradores / Publicados / Archivados.
- Tabla con columnas: Título, Estado, Fecha, Acciones.
- Empty state si no hay posts.

### `/dashboard/posts/new` y `/dashboard/posts/[id]`

Ambos renderizan `<PostForm>` (client component):

**Stack del editor:** TipTap con extensiones:
- `StarterKit` (básicos + heading levels [2, 3])
- `Image` (inserción de imágenes)
- `Link` (con URL modal)
- `Placeholder` ("Empieza a escribir...")
- `Underline`

**Toolbar:** bold, italic, underline, strike, H2, H3, bulleted list, ordered list, blockquote, link, image upload, undo/redo.

**AI panel (client):**
- Input "Topic"
- Textarea "Context adicional"
- Botón "Generar artículo" → POST `/api/ai/generate` → rellena title + content
- Botón "Generar imagen" → POST `/api/ai/generate-image` → setea coverId

**Submit:** POST `/api/posts` (create) o PATCH `/api/posts/[id]` (edit).

### `/dashboard/ideas`

`<IdeasGenerator>` (client):
- Input "Nicho"
- Select count (3 / 5 / 7 / 10)
- Botón "Generar ideas" → POST `/api/ai/generate-ideas`
- Lista de resultados con 3 acciones por idea:
  - "Copiar título" → `navigator.clipboard.writeText(title)`
  - "Guardar" → `localStorage.getItem("kv-saved-ideas")` ++ push
  - "Crear post" → `router.push("/dashboard/posts/new?idea=" + encodeURIComponent(title))`
- Panel "Saved ideas" lee de `localStorage`.

### `/dashboard/gallery`

`<GalleryManager>` (client):

**Zona de subida:** drag-drop + file picker. On drop:
1. `POST /api/upload` con multipart `files`.
2. Para cada archivo exitoso: `POST /api/images` con metadata.
3. Refresh del grid.

**Grid:** columnas `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`. Cada celda muestra la imagen con overlay al hover:
- Icono estrella → `PATCH /api/images/[id]` `{ gallery: !gallery }`
- Icono lápiz → modal para editar `alt`
- Icono papelera → `DELETE /api/images/[id]` con confirmación

**Filtros:** tabs "Todas / En landing / Ocultas" filtrando `gallery` boolean.

### `/dashboard/newsletter`

`<NewsletterManager>` (client) con 2 tabs:

**Tab "Nuevo post publicado":**
- Select de posts (solo los `PUBLISHED`).
- Subject auto: `"Nuevo articulo: {title}"`.
- Preview render con cover + título + excerpt + botón "Leer artículo".
- Botón "Enviar a {N} suscriptores" → `POST /api/newsletter/campaigns` `{ template: "new_post", postId, send: true }`.

**Tab "Campaña personalizada":**
- Subject input.
- Content textarea (HTML). Se renderiza dentro de un layout base con header + footer unsubscribe.
- Botón "Enviar" → `POST /api/newsletter/campaigns` `{ template: "custom", send: true }`.

**Historial:** tabla con últimas 50 campañas (subject, tipo, status, count, fecha).

### `/dashboard/subscribers`

Tabla con columnas: Email, Nombre, Estado (active/inactive), Confirmado, Fecha suscripción, Acciones.
- Toggle activo → PATCH.
- Eliminar → DELETE.
- Filtros por active/inactive.

### `/dashboard/booking-links`

`<BookingLinkList>` (client). Tabla + formulario inline:

**Crear:**
- Slug (solo lowercase + números + guiones), título, descripción, duración (15-480), fecha de expiración.

**Acciones por fila:**
- Copiar enlace: `navigator.clipboard.writeText(window.location.origin + "/book/" + slug)`.
- Toggle activo: `PATCH` con `{ active: !active }`.
- Eliminar: `DELETE` con confirmación ("también borra todas las reservas").

### `/dashboard/bookings`

Tabla con: Cliente, Email, Fecha, Hora, Servicio, Estado, Acciones.
Filtros: All / Confirmed / Pending / Cancelled.
Acciones: Cambiar estado (dropdown), Eliminar.

### `/dashboard/availability`

`<AvailabilityEditor>` (client):
- 7 filas (domingo → sábado), cada una con toggle + `<input type="time" startTime>` + `<input type="time" endTime>`.
- Botones preset: "L-V 15-21", "Fin de semana 10-14", "Todos 9-18".
- Botón "Guardar" → `PUT /api/availability` con el array completo.

### `/dashboard/event-pages`

`<EventPageList>` (client). Similar pattern que booking-links.

**Crear:**
- Título, slug, selector de template (4 cards: custom / webinar 🎓 / fitness 🏋️ / coaching 💪).
- On submit: `POST /api/event-pages` con slug+title+template.
- Si template !== "custom": obtiene definición de `EVENT_TEMPLATES` (src/lib/event-templates.ts) y hace N `POST /api/event-pages/{id}/blocks` secuenciales para crear los bloques.

**Acciones por fila:**
- Editar → navega a `/dashboard/event-pages/[id]`.
- Copiar enlace.
- Toggle publicar/despublicar.
- Eliminar (cascades blocks + leads).

### `/dashboard/event-pages/[id]`

Editor de bloques. **Archivo ~1100 líneas** — el más complejo del admin.

Componentes clave:
- `<VisualBlockPreview>` — renderiza miniatura visual por tipo (con data actual).
- `<InlineBlockEditor>` — campos de edición específicos por tipo.
- `<InlinePreviewText>` — texto resumen para el header colapsado.
- Sub-editores: `GalleryEditor`, `FormFieldsEditor`, `FaqEditor`, `TestimonialsEditor`, `PricingEditor`, `StatsEditor`, `FeaturesEditor`.

**Auto-save:**
```typescript
const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

function saveBlock(blockId, newData) {
  if (timers.current[blockId]) clearTimeout(timers.current[blockId]);
  timers.current[blockId] = setTimeout(async () => {
    setSavingIds(s => new Set([...s, blockId]));
    await fetch(`/api/event-pages/${pageId}/blocks/${blockId}`, {
      method: "PATCH",
      body: JSON.stringify({ data: newData })
    });
    setSavingIds(s => new Set([...s].filter(id => id !== blockId)));
    setSavedIds(s => new Set([...s, blockId]));
    setTimeout(() => setSavedIds(s => new Set([...s].filter(id => id !== blockId))), 2000);
  }, 800);
}
```

**Drag-drop:**
- Nativo HTML5 (`onDragStart`, `onDragOver`, `onDrop`).
- Al soltar: reorder del array local + `POST /api/event-pages/{id}/blocks` con `{ blockIds: newOrder }`.

**Duplicar:**
```typescript
async function duplicateBlock(blockId) {
  const block = blocks.find(b => b.id === blockId);
  const res = await fetch(`/api/event-pages/${pageId}/blocks`, {
    method: "POST",
    body: JSON.stringify({ type: block.type, data: block.data })
  });
  // newBlock se añade al final; refresh.
}
```

**Picker de bloque** (categorías):
- Contenido: hero, text, image, video, gallery
- Conversion: cta, form, pricing, countdown
- Social proof: testimonials, stats, faq, features
- Layout: divider

### `/dashboard/knowledge`

Ver `10-landing-builder.md`... no, **ver el detalle completo en `SNAPSHOT/04-features/06-knowledge-base.md`**. Resumen:

`<KnowledgeBase>` (client component de ~600 líneas). Estados:
- Home view (cards de categorías + search con Ctrl+K).
- Article view (sidebar + main + TOC auto-extraído + prev/next).
- Edit modal (si el DB tiene contenido — "DB mode").

Carga: `GET /api/kb/articles` on mount. Si DB vacío, muestra banner "Sincronizar con DB" → `POST /api/kb/seed`.

### `/dashboard/contacts`

Tabla con filtros de status. Detalle en `/dashboard/contacts/[id]`:
- Layout 2/3 + 1/3 (main + sidebar).
- Main: mensaje en `<pre>` preformat.
- Sidebar: `<InfoRow>` con nombre, email (mailto), teléfono (tel), status badge, timestamps.
- Acciones: Responder (abre mailto + marca REPLIED), Archivar, Eliminar.

Al cargar la página, si el status era `PENDING`, el Server Component lo actualiza a `READ` con `readAt=now()`.

### `/dashboard/users`

Read-only. Tabla: Name, Email, Role, Active dot, Created. No hay CRUD en UI.

### `/dashboard/settings`

`<SettingsEditor>` (client) con 10 tabs.

Cada tab es un sub-componente que:
1. Recibe `initialData` del `SiteConfig` correspondiente.
2. Tiene su propio state local.
3. Tiene botón "Guardar" que hace `PATCH /api/config` con `{ key, value }`.
4. Opción "Restablecer valores por defecto" → PATCH con el default de `landing-defaults.ts`.

Tabs:
1. **Colores (theme)** — 7 color pickers con live preview.
2. **Secciones** — 8 toggles (hero/about/stats/gallery/achievements/blog/newsletter/contact).
3. **Hero** — title, titleAccent, tagline, ctaText, ctaHref, backgroundImage.
4. **Sobre mí** — heading split, paragraphs array, portrait, yearLabel, metrics array.
5. **Estadísticas** — items array (value, suffix, label).
6. **Contacto** — heading, description, email, ctaText.
7. **Redes** — 3 platforms × (URL + handle).
8. **Navbar** — brandFirst, brandSecond, ctaText.
9. **IA** — provider radio, openaiApiKey (masked), model, localEndpoint, localModel, systemPrompt.
10. **Email** — resendApiKey (masked), fromName, fromEmail, contactEmailTo.

**Campos sensibles:** el input muestra el valor masked (`sk-a••••••xyz`). Si el usuario no lo modifica, el PATCH envía el masked value tal cual, y el backend lo preserva. Si el usuario lo cambia, envía el nuevo plaintext que se cifra server-side.

## Flujos de trabajo típicos

### Publicar un post con IA
1. `/dashboard/ideas` → generar ideas → "Crear post".
2. Editor abre con title pre-rellenado.
3. "Generar artículo" → espera 5-20s.
4. Content generado aparece en TipTap editor.
5. Cover image generado en paralelo y asignado.
6. Revisar, editar, cambiar status a "PUBLISHED", guardar.
7. `router.refresh()` → landing page actualiza cache (ISR via `revalidatePath`).

### Crear landing page de webinar
1. `/dashboard/event-pages` → "+ Nueva landing page".
2. Título, slug, template "Webinar".
3. Crear → al volver al editor, los 11 bloques del template ya están creados.
4. Editar cada bloque inline (auto-save).
5. Cambiar status a "PUBLISHED".
6. "Vista previa" abre `/event/{slug}` en nueva pestaña.

### Configurar disponibilidad
1. `/dashboard/availability`.
2. Activar días de la semana, setear horarios.
3. O click en preset.
4. "Guardar" → `PUT /api/availability` en transacción.
5. `/book/{slug}` ya refleja los horarios.

## Convenciones

- **Server Component fetchea, Client Component interactúa.** Siempre.
- **`<PageHeader>` siempre primer hijo** dentro del `<div className="admin-fade-in">`.
- **Responsive tables:** columnas de status/fecha usan `hidden sm:table-cell` / `hidden md:table-cell`.
- **Empty states con icono + mensaje + action opcional.** Via `<TableEmpty>` o `<EmptyState>`.
- **Confirmaciones destructivas con `window.confirm()`.** No hay custom modal para esto.
- **Refresh tras mutación:** `router.refresh()` para Server Components, o update local state.
