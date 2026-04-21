"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card, CardContent,
  Table, TableHead, TableHeader, TableBody, TableRow, TableCell, TableEmpty,
  Badge, Button,
  useToast,
} from "@/components/admin/ui";
import { useCopy } from "@/lib/hooks/use-copy";
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
  const toast = useToast();
  const { copy, copiedKey } = useCopy();
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
    toast.success("Landing page eliminada");
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
    toast.success(newStatus === "PUBLISHED" ? "Landing publicada" : "Landing despublicada");
    router.refresh();
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/event/${slug}`;
    copy(url, { label: "Enlace de evento copiado", key: slug });
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
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/dashboard/event-pages/${page.id}`}
                        className="inline-flex h-10 px-3 items-center rounded-lg text-xs font-medium text-a-accent hover:bg-a-accent/10 active:scale-95 transition-all"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => copyLink(page.slug)}
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-lg transition-all active:scale-90 ${
                          copiedKey === page.slug
                            ? "text-success bg-success/10"
                            : "text-muted hover:text-a-accent hover:bg-card-hover"
                        }`}
                        aria-label="Copiar enlace"
                      >
                        {copiedKey === page.slug ? (
                          <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleToggleStatus(page.id, page.status)}
                        className={`hidden sm:inline-flex h-9 px-2.5 items-center rounded-lg text-xs font-medium transition-all active:scale-95 ${
                          page.status === "PUBLISHED"
                            ? "text-muted hover:text-warning hover:bg-warning/10"
                            : "text-muted hover:text-success hover:bg-success/10"
                        }`}
                      >
                        {page.status === "PUBLISHED" ? "Despublicar" : "Publicar"}
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:text-danger active:bg-danger/10 active:scale-90 transition-all"
                        aria-label="Eliminar"
                      >
                        <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
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
