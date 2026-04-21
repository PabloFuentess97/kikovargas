# UI Structure — Admin Page Composition Patterns

How admin pages compose from the UI primitives. These are the exact patterns used.

## Pattern 1: Dashboard Page (Stats + Activity)

Shows the composition for the main dashboard. This is the canonical example.

```tsx
// src/app/(admin)/dashboard/page.tsx
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  Card, CardHeader,
  PageHeader, StatCard,
  PostStatusBadge, ContactStatusBadge, EmptyState,
} from "@/components/admin/ui";

export default async function DashboardPage() {
  const session = await requireAdmin();

  const [
    totalPosts, publishedPosts, draftPosts,
    totalContacts, pendingContacts,
    galleryImages, totalUsers,
    recentPosts, recentContacts,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.contact.count(),
    prisma.contact.count({ where: { status: "PENDING" } }),
    prisma.image.count({ where: { gallery: true } }),
    prisma.user.count(),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, status: true, createdAt: true },
    }),
    prisma.contact.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, subject: true, status: true, createdAt: true },
    }),
  ]);

  const greeting = getGreeting();

  return (
    <div className="admin-fade-in">
      <PageHeader title="Dashboard" subtitle={session.email} eyebrow={greeting} />

      {/* 4-column stat grid → 2 on tablet → 1 on mobile */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Posts publicados"
          value={publishedPosts}
          sub={`${draftPosts} borradores · ${totalPosts} total`}
          href="/dashboard/posts"
          icon={<IconDoc />}
        />
        <StatCard
          label="Contactos pendientes"
          value={pendingContacts}
          sub={`${totalContacts} total`}
          href="/dashboard/contacts"
          accent={pendingContacts > 0}
          icon={<IconMail />}
        />
        <StatCard
          label="Galeria"
          value={galleryImages}
          sub="imagenes"
          href="/dashboard/gallery"
          icon={<IconImage />}
        />
        <StatCard
          label="Usuarios"
          value={totalUsers}
          sub="registrados"
          href="/dashboard/users"
          icon={<IconUsers />}
        />
      </div>

      {/* Two-column activity grid → 1 on mobile */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader
            title="Posts recientes"
            action={
              <Link href="/dashboard/posts" className="text-xs font-medium text-a-accent hover:text-a-accent-hover transition-colors">
                Ver todos &rarr;
              </Link>
            }
          />
          <div className="divide-y divide-border">
            {recentPosts.length === 0 ? (
              <EmptyState
                icon={<IconDoc />}
                message="No hay posts todavia"
                action={
                  <Link href="/dashboard/posts/new" className="text-xs font-medium text-a-accent hover:text-a-accent-hover">
                    Crear el primero &rarr;
                  </Link>
                }
              />
            ) : (
              recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/dashboard/posts/${post.id}`}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-card-hover"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{post.title}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {new Date(post.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <PostStatusBadge status={post.status} />
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader
            title="Mensajes recientes"
            action={
              <Link href="/dashboard/contacts" className="text-xs font-medium text-a-accent hover:text-a-accent-hover transition-colors">
                Ver todos &rarr;
              </Link>
            }
          />
          <div className="divide-y divide-border">
            {recentContacts.length === 0 ? (
              <EmptyState icon={<IconMail />} message="No hay mensajes todavia" />
            ) : (
              recentContacts.map((contact) => (
                <Link
                  key={contact.id}
                  href={`/dashboard/contacts/${contact.id}`}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-card-hover"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{contact.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted">{contact.subject}</p>
                  </div>
                  <ContactStatusBadge status={contact.status} />
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos dias";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

// SVG icon components (each 20x20, stroke currentColor, strokeWidth 1.5)
function IconDoc()   { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>; }
function IconMail()  { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>; }
function IconImage() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" /></svg>; }
function IconUsers() { return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>; }
```

### Key patterns

1. **`<div className="admin-fade-in">`** wraps the entire page for entry animation
2. **`<PageHeader>`** always first child — provides title, subtitle, optional eyebrow
3. **Responsive grid** for stats: `grid gap-4 sm:grid-cols-2 lg:grid-cols-4`
4. **Mobile-first breakpoints** — default 1 col, `sm:` 2 cols, `lg:` 4 cols
5. **Two-column activity grid** below stats: `grid gap-6 lg:grid-cols-2`
6. **Card with CardHeader action** — link on right of header
7. **divide-y divide-border** on list items inside card
8. **Inline icon functions** — no external icon library, just SVGs

## Pattern 2: List Page (Table with Filters)

Posts / Contacts / Bookings all follow this pattern.

```tsx
// src/app/(admin)/dashboard/posts/page.tsx (conceptual)
export default async function PostsPage() {
  await requireAdmin();
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="admin-fade-in">
      <PageHeader
        title="Posts"
        subtitle="Gestiona los articulos del blog"
        action={
          <LinkButton href="/dashboard/posts/new" size="md">
            + Nuevo post
          </LinkButton>
        }
      />

      <PostListClient initialPosts={posts} />
    </div>
  );
}
```

### Client component pattern (`post-list.tsx`)

```tsx
"use client";

export function PostListClient({ initialPosts }) {
  const [filter, setFilter] = useState("ALL");

  const filtered = initialPosts.filter((p) =>
    filter === "ALL" ? true : p.status === filter
  );

  return (
    <>
      {/* Filter tabs */}
      <div className="inline-flex gap-1 p-1 rounded-lg bg-card border border-border mb-6">
        {[
          { id: "ALL", label: "Todos" },
          { id: "DRAFT", label: "Borradores" },
          { id: "PUBLISHED", label: "Publicados" },
          { id: "ARCHIVED", label: "Archivados" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === tab.id
                ? "bg-a-accent/10 text-a-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableHeader>Titulo</TableHeader>
          <TableHeader className="hidden sm:table-cell">Estado</TableHeader>
          <TableHeader className="hidden md:table-cell">Fecha</TableHeader>
          <TableHeader align="right" />
        </TableHead>
        <TableBody>
          {filtered.length === 0 ? (
            <TableEmpty
              colSpan={4}
              icon={<IconDoc className="h-6 w-6 text-a-accent" />}
              message="No hay posts"
              action={<LinkButton href="/dashboard/posts/new" size="sm">Crear el primero</LinkButton>}
            />
          ) : (
            filtered.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{post.title}</p>
                    <p className="text-xs text-muted">/blog/{post.slug}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <PostStatusBadge status={post.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-xs text-muted">
                    {new Date(post.createdAt).toLocaleDateString("es-MX")}
                  </span>
                </TableCell>
                <TableCell align="right">
                  <Link
                    href={`/dashboard/posts/${post.id}`}
                    className="text-xs text-a-accent hover:underline"
                  >
                    Editar
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
```

### Responsive table column hiding

Standard pattern across all list pages:
- `Table column 1` — always visible (title/name)
- `Table column 2` — `className="hidden sm:table-cell"` (status)
- `Table column 3` — `className="hidden md:table-cell"` (date)
- `Table column 4 (actions)` — always visible, right-aligned

## Pattern 3: Form Page (Create/Edit)

```tsx
export function FormClient({ initialData, mode }) {
  const [data, setData] = useState(initialData || defaults);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    // ... POST/PATCH
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent>
          <div className="space-y-5">
            <FormField>
              <FormLabel htmlFor="title">Titulo</FormLabel>
              <FormInput
                id="title"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                error={errors.title}
                required
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="slug">Slug</FormLabel>
              <FormInput
                id="slug"
                value={data.slug}
                onChange={(e) => setData({ ...data, slug: e.target.value })}
                error={errors.slug}
                required
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="excerpt" optional>Extracto</FormLabel>
              <FormTextarea
                id="excerpt"
                rows={3}
                value={data.excerpt}
                onChange={(e) => setData({ ...data, excerpt: e.target.value })}
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="status">Estado</FormLabel>
              <FormSelect
                id="status"
                value={data.status}
                onChange={(e) => setData({ ...data, status: e.target.value })}
              >
                <option value="DRAFT">Borrador</option>
                <option value="PUBLISHED">Publicado</option>
                <option value="ARCHIVED">Archivado</option>
              </FormSelect>
            </FormField>

            {errors._root && <FormError message={errors._root} />}
          </div>

          <FormActions>
            <Button type="submit" loading={saving}>
              {mode === "create" ? "Crear" : "Guardar cambios"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
          </FormActions>
        </CardContent>
      </Card>
    </form>
  );
}
```

## Pattern 4: Detail Page with Sidebar

Contacts detail, booking detail, etc.

```tsx
<div className="admin-fade-in">
  <PageHeader
    title={contact.subject}
    breadcrumb={[
      { label: "Contactos", href: "/dashboard/contacts" },
      { label: contact.name }
    ]}
    action={<ContactStatusBadge status={contact.status} />}
  />

  <div className="grid gap-6 lg:grid-cols-3">
    {/* Main column */}
    <div className="lg:col-span-2">
      <Card>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap text-foreground/90">{contact.message}</p>
        </CardContent>
      </Card>
    </div>

    {/* Sidebar */}
    <div className="space-y-4">
      <Card>
        <CardHeader title="Detalles" />
        <CardContent>
          <InfoRow label="Nombre" value={contact.name} />
          <InfoRow label="Email" value={contact.email} href={`mailto:${contact.email}`} />
          {contact.phone && <InfoRow label="Teléfono" value={contact.phone} href={`tel:${contact.phone}`} />}
          <InfoRow label="Fecha" value={new Date(contact.createdAt).toLocaleString("es-MX")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Acciones" />
        <CardContent>
          <ContactActions contactId={contact.id} status={contact.status} email={contact.email} />
        </CardContent>
      </Card>
    </div>
  </div>
</div>
```

## Pattern 5: Tab-based Settings

```tsx
const TABS = [
  { id: "theme", label: "Colores" },
  { id: "sections", label: "Secciones" },
  // ...
];

<div className="admin-fade-in">
  <PageHeader title="Configuración" subtitle="Personaliza tu sitio" />

  {/* Tab bar */}
  <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto scrollbar-hide">
    {TABS.map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 -mb-px ${
          activeTab === tab.id
            ? "border-a-accent text-a-accent"
            : "border-transparent text-muted hover:text-foreground"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>

  {/* Active tab content */}
  <Card>
    <CardContent>
      {activeTab === "theme" && <ThemeEditor ... />}
      {activeTab === "sections" && <SectionsEditor ... />}
      {/* ... */}
    </CardContent>
  </Card>
</div>
```
