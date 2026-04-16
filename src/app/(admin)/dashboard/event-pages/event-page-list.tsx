"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card, CardContent,
  Table, TableHead, TableHeader, TableBody, TableRow, TableCell, TableEmpty,
  Badge, Button,
} from "@/components/admin/ui";
import { EVENT_TEMPLATES } from "@/lib/event-templates";

interface EventPageItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  template: string;
  createdAt: string;
  _count: { blocks: number; leads: number };
}

const STATUS_MAP: Record<string, { text: string; variant: "success" | "warning" | "muted" }> = {
  DRAFT: { text: "Borrador", variant: "warning" },
  PUBLISHED: { text: "Publicada", variant: "success" },
  ARCHIVED: { text: "Archivada", variant: "muted" },
};

export function EventPageList({ initialPages }: { initialPages: EventPageItem[] }) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState("custom");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      // 1. Create page
      const res = await fetch("/api/event-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, title, template }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Error al crear");
        setCreating(false);
        return;
      }

      const pageId = json.data.id;

      // 2. If template selected, create blocks from template
      if (template !== "custom") {
        const tpl = EVENT_TEMPLATES.find((t) => t.id === template);
        if (tpl) {
          for (const block of tpl.blocks) {
            await fetch(`/api/event-pages/${pageId}/blocks`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: block.type, data: block.data }),
            });
          }
        }
      }

      setShowForm(false);
      setSlug("");
      setTitle("");
      setTemplate("custom");
      setCreating(false);
      router.refresh();
    } catch {
      setError("Error de conexion");
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminar esta pagina y todos sus bloques?")) return;
    await fetch(`/api/event-pages/${id}`, { method: "DELETE" });
    setPages((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  }

  async function handleToggleStatus(id: string, current: string) {
    const newStatus = current === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await fetch(`/api/event-pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setPages((prev) => prev.map((p) => p.id === id ? { ...p, status: newStatus } : p));
    router.refresh();
  }

  function copyLink(slug: string) {
    navigator.clipboard.writeText(`${window.location.origin}/event/${slug}`);
  }

  return (
    <div>
      {/* Create form */}
      {!showForm ? (
        <div className="mb-6">
          <Button onClick={() => setShowForm(true)}>+ Nueva landing page</Button>
        </div>
      ) : (
        <Card className="mb-6">
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <h3 className="text-sm font-semibold text-white mb-2">Nueva landing page</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Titulo *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
                    placeholder="Nombre del evento"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Slug (URL) *</label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted">/event/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      required
                      className="flex-1 rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
                      placeholder="mi-evento"
                    />
                  </div>
                </div>
              </div>

              {/* Template selection */}
              <div>
                <label className="block text-xs font-medium text-muted mb-2">Plantilla</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTemplate("custom")}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      template === "custom"
                        ? "border-a-accent bg-a-accent/5"
                        : "border-border hover:border-a-accent/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">📄</span>
                      <p className="text-xs font-medium text-foreground">En blanco</p>
                    </div>
                    <p className="text-[0.6rem] text-muted">Empieza desde cero y agrega bloques manualmente</p>
                  </button>
                  {EVENT_TEMPLATES.map((tpl) => {
                    const icons: Record<string, string> = { webinar: "🎓", fitness: "🏋️", coaching: "💪" };
                    return (
                      <button
                        type="button"
                        key={tpl.id}
                        onClick={() => setTemplate(tpl.id)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          template === tpl.id
                            ? "border-a-accent bg-a-accent/5"
                            : "border-border hover:border-a-accent/30"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{icons[tpl.id] || "📄"}</span>
                          <p className="text-xs font-medium text-foreground">{tpl.name}</p>
                          <span className="text-[0.55rem] text-muted bg-card-hover px-1.5 py-0.5 rounded">{tpl.blocks.length} bloques</span>
                        </div>
                        <p className="text-[0.6rem] text-muted">{tpl.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && <p className="text-xs text-danger">{error}</p>}

              <div className="flex gap-2">
                <Button type="submit" disabled={creating}>
                  {creating ? "Creando..." : "Crear pagina"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(""); }}
                  className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pages table */}
      <Table>
        <TableHead>
          <TableHeader>Pagina</TableHeader>
          <TableHeader className="hidden sm:table-cell">Bloques</TableHeader>
          <TableHeader className="hidden md:table-cell">Leads</TableHeader>
          <TableHeader>Estado</TableHeader>
          <TableHeader align="right" />
        </TableHead>
        <TableBody>
          {pages.length === 0 ? (
            <TableEmpty
              colSpan={5}
              icon={
                <svg className="h-6 w-6 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              }
              message="No hay landing pages"
            />
          ) : (
            pages.map((page) => {
              const status = STATUS_MAP[page.status] || STATUS_MAP.DRAFT;
              return (
                <TableRow key={page.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{page.title}</p>
                      <p className="text-xs text-muted">/event/{page.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-muted">{page._count.blocks}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted">{page._count.leads}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.text}</Badge>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/event-pages/${page.id}`}
                        className="text-xs text-a-accent hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => copyLink(page.slug)}
                        className="text-xs text-muted hover:text-a-accent transition-colors"
                      >
                        Copiar
                      </button>
                      <button
                        onClick={() => handleToggleStatus(page.id, page.status)}
                        className={`text-xs ${page.status === "PUBLISHED" ? "text-muted hover:text-warning" : "text-muted hover:text-success"} transition-colors`}
                      >
                        {page.status === "PUBLISHED" ? "Despublicar" : "Publicar"}
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="text-xs text-muted hover:text-danger transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
