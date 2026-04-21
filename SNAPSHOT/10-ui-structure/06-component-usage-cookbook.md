# UI Structure — Component Usage Cookbook

Ready-to-copy recipes for every common UI situation. Use these as templates.

## Recipe 1: Create an admin listing page

```tsx
// src/app/(admin)/dashboard/[section]/page.tsx
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader, LinkButton } from "@/components/admin/ui";
import { MyListClient } from "./my-list-client";

export default async function MySectionPage() {
  await requireAdmin();

  const items = await prisma.myModel.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="admin-fade-in">
      <PageHeader
        title="Mi sección"
        subtitle="Descripción de la sección"
        action={
          <LinkButton href="/dashboard/my-section/new" size="md">
            + Nuevo
          </LinkButton>
        }
      />

      <MyListClient initialItems={items} />
    </div>
  );
}
```

## Recipe 2: Filter tabs + table

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table, TableHead, TableHeader, TableBody, TableRow, TableCell, TableEmpty,
  PostStatusBadge,
} from "@/components/admin/ui";

export function MyListClient({ initialItems }) {
  const [filter, setFilter] = useState("ALL");

  const filtered = initialItems.filter((item) =>
    filter === "ALL" ? true : item.status === filter
  );

  return (
    <>
      {/* Filter tabs */}
      <div className="inline-flex gap-1 p-1 rounded-lg bg-card border border-border mb-6">
        {[
          { id: "ALL", label: "Todos" },
          { id: "DRAFT", label: "Borradores" },
          { id: "PUBLISHED", label: "Publicados" },
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
          <TableHeader>Título</TableHeader>
          <TableHeader className="hidden sm:table-cell">Estado</TableHeader>
          <TableHeader className="hidden md:table-cell">Fecha</TableHeader>
          <TableHeader align="right" />
        </TableHead>
        <TableBody>
          {filtered.length === 0 ? (
            <TableEmpty
              colSpan={4}
              icon={<MyIcon className="h-6 w-6 text-a-accent" />}
              message="No hay elementos"
            />
          ) : (
            filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="text-sm font-medium">{item.title}</p>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <PostStatusBadge status={item.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-xs text-muted">
                    {new Date(item.createdAt).toLocaleDateString("es-MX")}
                  </span>
                </TableCell>
                <TableCell align="right">
                  <Link
                    href={`/dashboard/my-section/${item.id}`}
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

## Recipe 3: Form with validation

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardContent,
  FormField, FormLabel, FormInput, FormTextarea, FormSelect, FormError, FormActions,
  Button,
} from "@/components/admin/ui";

export function MyForm({ initialData, mode }) {
  const router = useRouter();
  const [data, setData] = useState(initialData || {
    title: "",
    slug: "",
    status: "DRAFT"
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    const url = mode === "create"
      ? "/api/my-section"
      : `/api/my-section/${initialData.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!json.success) {
      setErrors({ _root: json.error });
      setSaving(false);
      return;
    }

    router.push("/dashboard/my-section");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent>
          <div className="space-y-5">
            <FormField>
              <FormLabel htmlFor="title">Título</FormLabel>
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
                onChange={(e) => setData({
                  ...data,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
                })}
                error={errors.slug}
                required
              />
            </FormField>

            <FormField>
              <FormLabel htmlFor="excerpt" optional>
                Extracto
              </FormLabel>
              <FormTextarea
                id="excerpt"
                rows={3}
                value={data.excerpt || ""}
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

## Recipe 4: Confirmation dialog before destructive action

```tsx
async function handleDelete(id: string) {
  if (!confirm("¿Eliminar este elemento? Esta acción no se puede deshacer.")) {
    return;
  }

  const res = await fetch(`/api/my-section/${id}`, { method: "DELETE" });
  const json = await res.json();

  if (json.success) {
    setItems(prev => prev.filter(i => i.id !== id));
    router.refresh();
  }
}

// In the row:
<button
  onClick={() => handleDelete(item.id)}
  className="text-xs text-muted hover:text-danger transition-colors"
>
  Eliminar
</button>
```

## Recipe 5: Stats grid on dashboard

```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <StatCard
    label="Posts publicados"
    value={publishedCount}
    sub="45 total"
    href="/dashboard/posts"
    icon={<IconDoc />}
  />
  <StatCard
    label="Contactos pendientes"
    value={pendingContacts}
    sub={`${totalContacts} total`}
    href="/dashboard/contacts"
    accent={pendingContacts > 0}   {/* Makes value amber when > 0 */}
    icon={<IconMail />}
  />
  {/* ... more cards */}
</div>
```

## Recipe 6: Card with header action + divided list

```tsx
<Card className="overflow-hidden">
  <CardHeader
    title="Elementos recientes"
    action={
      <Link
        href="/dashboard/my-section"
        className="text-xs font-medium text-a-accent hover:text-a-accent-hover transition-colors"
      >
        Ver todos &rarr;
      </Link>
    }
  />
  <div className="divide-y divide-border">
    {items.length === 0 ? (
      <EmptyState
        icon={<IconDoc />}
        message="No hay elementos todavía"
      />
    ) : (
      items.map((item) => (
        <Link
          key={item.id}
          href={`/dashboard/my-section/${item.id}`}
          className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-card-hover"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.title}</p>
            <p className="mt-0.5 text-xs text-muted">{item.subtitle}</p>
          </div>
          <PostStatusBadge status={item.status} />
        </Link>
      ))
    )}
  </div>
</Card>
```

## Recipe 7: Detail page with sidebar

```tsx
<div className="admin-fade-in">
  <PageHeader
    title={item.title}
    breadcrumb={[
      { label: "Mi sección", href: "/dashboard/my-section" },
      { label: item.title }
    ]}
    action={<PostStatusBadge status={item.status} />}
  />

  <div className="grid gap-6 lg:grid-cols-3">
    {/* Main column (takes 2/3) */}
    <div className="lg:col-span-2">
      <Card>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap text-foreground/90">
            {item.content}
          </p>
        </CardContent>
      </Card>
    </div>

    {/* Sidebar (takes 1/3) */}
    <div className="space-y-4">
      <Card>
        <CardHeader title="Detalles" />
        <CardContent>
          <InfoRow label="Creado" value={formatDate(item.createdAt)} />
          <InfoRow label="Autor" value={item.author.name} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Acciones" />
        <CardContent>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" size="sm">Acción 1</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>Eliminar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
```

## Recipe 8: Landing section (with section-py and container)

```tsx
export function MySection({ config }) {
  return (
    <section id="my-section" className="section-py bg-surface">
      <div className="container-landing">
        {/* Eyebrow label */}
        <div className="section-label mb-6">
          My Section
        </div>

        {/* Two-tone heading */}
        <h2 className="section-heading text-primary mb-12">
          Texto principal
          <br />
          <span className="text-accent">texto acento</span>
        </h2>

        {/* Content */}
        <p className="text-secondary max-w-2xl">
          Contenido de la sección...
        </p>
      </div>
    </section>
  );
}
```

## Recipe 9: Copy-to-clipboard button

```tsx
function CopyButton({ text, label = "Copiar" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-muted hover:text-a-accent transition-colors"
    >
      {copied ? (
        <>
          <CheckIcon className="h-3 w-3 text-success" />
          Copiado!
        </>
      ) : (
        <>
          <CopyIcon className="h-3 w-3" />
          {label}
        </>
      )}
    </button>
  );
}
```

## Recipe 10: Auto-save with debounce

```tsx
"use client";

import { useRef, useState } from "react";

export function AutoSaveEditor({ itemId, initialContent }) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  function handleChange(newContent: string) {
    setContent(newContent);
    setSaved(false);

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setSaving(true);
      await fetch(`/api/my-section/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  }

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-2">
        {saving && (
          <span className="flex items-center gap-1.5 text-xs text-a-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-a-accent animate-pulse" />
            Guardando
          </span>
        )}
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-success">
            <CheckIcon className="h-3 w-3" />
            Guardado
          </span>
        )}
      </div>

      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        rows={10}
        className="w-full"
      />
    </div>
  );
}
```

## Recipe 11: Modal dialog

```tsx
"use client";

function Modal({ isOpen, onClose, children, title }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
```

## Recipe 12: Tab-based page

```tsx
"use client";

const TABS = [
  { id: "general", label: "General" },
  { id: "advanced", label: "Avanzado" },
  { id: "billing", label: "Facturación" },
];

export function TabbedPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="admin-fade-in">
      <PageHeader title="Configuración" />

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

      {/* Tab panels */}
      <Card>
        <CardContent>
          {activeTab === "general" && <GeneralTab />}
          {activeTab === "advanced" && <AdvancedTab />}
          {activeTab === "billing" && <BillingTab />}
        </CardContent>
      </Card>
    </div>
  );
}
```
