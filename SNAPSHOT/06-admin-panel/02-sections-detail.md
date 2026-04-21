# Admin Panel — Sections in Detail

## Dashboard (/dashboard)

Overview with:
- 4 StatCards (total posts published, total contacts, active subscribers, upcoming bookings)
- Recent activity feed (last 5 contacts, last 5 bookings)
- Quick action buttons: New post, Generate article, New booking link, New campaign

## Analytics (/dashboard/analytics)

Charts and metrics from `/api/analytics/stats`:
- Total views (today/week/month/all-time)
- Top 10 most visited pages
- Top 10 countries
- Device breakdown (desktop/mobile/tablet) — pie chart
- Browser breakdown — bar chart
- Daily views for last 30 days — line chart

## Posts (/dashboard/posts)

### Listing
Table columns: Title, Status, Date, Actions.
Filter tabs: All, Draft, Published, Archived.

### New post (/dashboard/posts/new)
Form with:
- Title field (auto-slug)
- Slug field (editable)
- Excerpt textarea
- Cover image picker (from gallery or AI generate)
- TipTap editor
- Status select (default Draft)
- AI panel (shown when no content yet):
  - Topic input
  - Context textarea (optional)
  - "Generar articulo" button

### Edit post (/dashboard/posts/[id])
Same form, pre-filled. Plus "Delete" button.

## Ideas IA (/dashboard/ideas)

Client component: `IdeasGenerator`

### UI
- Niche input: "e.g., nutrición para mujeres"
- Count selector: 3 / 5 / 7 / 10
- "Generar ideas" button
- Results list: each idea shows title, description, tags
- Actions per idea: "Copiar título", "Guardar", "Crear post"
- "Saved ideas" panel reads from `localStorage.getItem("kv-saved-ideas")`

### "Crear post" flow
Navigates to `/dashboard/posts/new?idea={encoded title}`. The new-post page reads the URL parameter and pre-fills the AI panel.

## Gallery (/dashboard/gallery)

Client component: `GalleryManager`

### Upload zone
Drag/drop or click to pick files.
Progress indicators per file.

### Grid
Masonry grid of images with hover overlay:
- Star icon (toggle gallery flag)
- Pencil icon (edit alt text)
- Trash icon (delete)

### Filter
- All
- En landing (`gallery: true`)
- Ocultas (`gallery: false`)

### Drag reorder
Active only in "En landing" filter; updates order via batch PATCH.

## Newsletter (/dashboard/newsletter)

### Two Tabs

**Nuevo post publicado:**
- Post selector (shows PUBLISHED posts)
- Auto-generated subject: "Nuevo articulo: {title}"
- Preview card with cover, title, excerpt, "Leer articulo" button
- Send button → "Enviar a {N} suscriptores activos"

**Campaña personalizada:**
- Subject input
- HTML content textarea
- Hint: "Se envuelve con branding automaticamente"
- Send button

### Campaign history table
Last 50 campaigns: Subject, Type, Status, Count sent, Date.

## Subscribers (/dashboard/subscribers)

Table: Email, Name, Status (active/inactive), Confirmed, Subscribed date, Actions.
Toggle active, delete. Filter by active/inactive.

## Booking Links (/dashboard/booking-links)

### Create form (modal or inline)
Fields: slug, title, description, duration (15-480), expiresAt.

### Table
Columns: Title, Slug (clickable → copies), Duration, Active toggle, Bookings count, Actions.

### Actions
- Copy link (full URL with domain)
- Toggle active (patch)
- Delete (with confirmation + cascade warning)

## Bookings (/dashboard/bookings)

Table: Name, Email, Date, Time, Service, Status, Actions.
Filter by status: All / Confirmed / Pending / Cancelled.

### Actions per booking
- Change status dropdown
- Reactivate (if cancelled)
- Delete

## Availability (/dashboard/availability)

Client component: `AvailabilityEditor`

### UI
7 rows (Sunday → Saturday):
```
[toggle] [Lunes]    [15:00] [21:00]
[toggle] [Martes]   [15:00] [21:00]
...
```

### Preset buttons
- "Lunes-Viernes 15:00-21:00"
- "Fines de semana 10:00-14:00"
- "Todos los dias 9:00-18:00"

### Save
Calls `PUT /api/availability` with full slots array (transactional replacement).

## Event Pages (/dashboard/event-pages)

### Listing
Table: Title, Slug, Blocks count, Leads count, Status, Actions.

### Create form
Fields: title, slug. Template selector with emoji cards:
- 📄 En blanco (custom)
- 🎓 Webinar (11 blocks)
- 🏋️ Evento Fitness (12 blocks)
- 💪 Coaching (12 blocks)

After creation, if template != custom, calls blocks API N times to create template blocks.

### Editor (/dashboard/event-pages/[id])
See `04-features/05-landing-builder.md` for full editor details.

## Knowledge Base (/dashboard/knowledge)

See `04-features/06-knowledge-base.md`.

## Contacts (/dashboard/contacts)

### Listing
Table: Name, Email, Subject, Status, Date, Actions.
Filter: All / Pending / Read / Replied / Archived.

### Detail (/dashboard/contacts/[id])
- Reads message (marks READ automatically if PENDING)
- Sidebar with name, email (mailto link), phone (tel link), status badge
- Actions:
  - "Responder por email" → opens `mailto:email?subject=Re: original` → marks REPLIED
  - "Archivar" → status = ARCHIVED
  - "Eliminar" → confirmation + delete

## Users (/dashboard/users)

Read-only table: Name, Email, Role badge, Active dot, Created.
(No editing in UI — managed via direct DB access or seed script.)

## Settings (/dashboard/settings)

Client component: `SettingsEditor` with 10 tabs.

See `06-admin-panel/03-settings-tabs.md` for each tab's fields.

## Sidebar badges

The sidebar can optionally show badges (implemented as `span`):
- Pending contacts count (red)
- Unread leads count (gold)

(Currently minimal badges; expand as needed.)

## Shared Patterns

- **Server component** fetches initial data, passes to client
- **Client components** use `useState`, `useRouter`, `router.refresh()` after mutations
- **Optimistic updates**: `setState` first, then API call, revert on error
- **Confirmation dialogs**: native `window.confirm()` for simple, custom modal for complex
- **Auto-save**: 800ms debounce via `useRef<Record<string, NodeJS.Timeout>>`
- **Toast notifications**: not in current implementation; uses inline success/error states
