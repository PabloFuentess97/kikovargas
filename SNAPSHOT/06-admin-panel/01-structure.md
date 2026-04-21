# Admin Panel — Structure & Navigation

## Layout

**File:** `src/app/(admin)/layout.tsx`

```tsx
<div data-theme="admin" className="min-h-screen bg-background text-foreground">
  <AdminSidebar userName={user.name} userEmail={user.email} />
  <main className="md:ml-0 md:pl-0 md:pt-0 pt-14 md:pb-0 pb-4 flex-1">
    <div className="p-4 md:p-6">{children}</div>
  </main>
</div>
```

Admin layout:
- Server component that calls `requireAdmin()` on every request
- Applies `data-theme="admin"` attribute to swap theme variables
- Wraps children in flex layout with sidebar

## Sidebar

**File:** `src/app/(admin)/admin-sidebar.tsx`

### Desktop (md+)
- Fixed left sidebar, 250px wide
- Brand header (KV logo + "KikoVargas Admin Panel")
- Scrollable nav with 7 sections
- User footer with logout

### Mobile (<md)
- Top bar with brand + hamburger
- Drawer slides from left (280px wide)
- Backdrop with blur
- Closes on route change and Esc

### Navigation Sections

```typescript
const NAV_SECTIONS = [
  {
    label: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: <svg /> },
      { href: "/dashboard/analytics", label: "Analytics", icon: <svg /> }
    ]
  },
  {
    label: "Contenido",
    items: [
      { href: "/dashboard/posts", label: "Posts", icon: <svg /> },
      { href: "/dashboard/ideas", label: "Ideas IA", icon: <svg /> },
      { href: "/dashboard/gallery", label: "Galeria", icon: <svg /> }
    ]
  },
  {
    label: "Newsletter",
    items: [
      { href: "/dashboard/newsletter", label: "Campanas", icon: <svg /> },
      { href: "/dashboard/subscribers", label: "Suscriptores", icon: <svg /> }
    ]
  },
  {
    label: "Reservas",
    items: [
      { href: "/dashboard/booking-links", label: "Enlaces", icon: <svg /> },
      { href: "/dashboard/bookings", label: "Reservas", icon: <svg /> },
      { href: "/dashboard/availability", label: "Disponibilidad", icon: <svg /> }
    ]
  },
  {
    label: "Eventos",
    items: [
      { href: "/dashboard/event-pages", label: "Landing Pages", icon: <svg /> }
    ]
  },
  {
    label: "Ayuda",
    items: [
      { href: "/dashboard/knowledge", label: "Guia de uso", icon: <svg /> }
    ]
  },
  {
    label: "Gestion",
    items: [
      { href: "/dashboard/contacts", label: "Contactos", icon: <svg /> },
      { href: "/dashboard/users", label: "Usuarios", icon: <svg /> },
      { href: "/dashboard/settings", label: "Configuracion", icon: <svg /> }
    ]
  }
];
```

### Active State
Uses `isActive()` helper:
```typescript
const isActive = (href: string) => {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
};
```

Active nav item gets:
- Gold text (`text-a-accent`)
- Subtle gold background (`bg-admin-accent-dim`)
- Gold bar on left edge (3px × 20px pseudo-element)

### Logout
```typescript
async function handleLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
  router.push("/login");
  router.refresh();
}
```

## Page Structure Convention

Each admin page follows this pattern:

```tsx
// src/app/(admin)/dashboard/[section]/page.tsx
export default async function SectionPage() {
  await requireAdmin();

  // Fetch data via Prisma
  const data = await prisma.thing.findMany(...);

  return (
    <div className="admin-fade-in space-y-6">
      <PageHeader title="Section Title" subtitle="Description" action={<Button>...</Button>} />
      <SectionManagerClient initialData={data} />  {/* Client component */}
    </div>
  );
}
```

**Pattern:**
1. Server component fetches initial data
2. Passes to client component as `initialData`
3. Client component handles interactivity, API calls, optimistic updates

## Common Layout Elements

### Main Dashboard (`/dashboard`)
- 4 StatCards (Posts, Contacts, Subscribers, Bookings)
- "Actividad reciente" card
- "Accesos rapidos" card with buttons to common actions

### Page Header Pattern
```tsx
<PageHeader
  title="Posts"
  subtitle="Gestiona los articulos del blog"
  eyebrow="Blog"
  action={<LinkButton href="/dashboard/posts/new">+ Nuevo post</LinkButton>}
  breadcrumb={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Posts" }
  ]}
/>
```

### Table Pattern
```tsx
<Table>
  <TableHead>
    <TableHeader>Columna 1</TableHeader>
    <TableHeader>Columna 2</TableHeader>
    <TableHeader align="right" />
  </TableHead>
  <TableBody>
    {items.length === 0 ? (
      <TableEmpty
        colSpan={3}
        icon={<MyIcon />}
        message="No hay elementos"
        action={<Button>Crear el primero</Button>}
      />
    ) : (
      items.map(item => (
        <TableRow key={item.id}>...</TableRow>
      ))
    )}
  </TableBody>
</Table>
```

### Filter Tabs Pattern
```tsx
<div className="flex gap-1 p-1 rounded-lg bg-card border border-border">
  {filters.map(f => (
    <button
      key={f.id}
      onClick={() => setFilter(f.id)}
      className={clsx(
        "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
        filter === f.id
          ? "bg-a-accent/10 text-a-accent"
          : "text-muted hover:text-foreground"
      )}
    >
      {f.label}
    </button>
  ))}
</div>
```
