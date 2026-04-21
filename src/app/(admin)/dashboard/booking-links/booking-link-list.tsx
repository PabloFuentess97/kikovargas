"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardContent,
  Table, TableHead, TableHeader, TableBody, TableRow, TableCell, TableEmpty,
  Badge, Button,
  useToast,
} from "@/components/admin/ui";
import { useCopy } from "@/lib/hooks/use-copy";

interface BookingLink {
  id: string;
  slug: string;
  title: string;
  description: string;
  duration: number;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
  _count: { bookings: number };
}

export function BookingLinkList({ initialLinks }: { initialLinks: BookingLink[] }) {
  const router = useRouter();
  const toast = useToast();
  const { copy, copiedKey } = useCopy();
  const [links, setLinks] = useState(initialLinks);
  const [showForm, setShowForm] = useState(false);

  // Create form state
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("Reserva tu cita");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(60);
  const [expiresAt, setExpiresAt] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");

    const res = await fetch("/api/booking-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        title,
        description,
        duration,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "Error al crear enlace");
      setCreating(false);
      return;
    }

    setShowForm(false);
    setSlug("");
    setTitle("Reserva tu cita");
    setDescription("");
    setDuration(60);
    setExpiresAt("");
    setCreating(false);
    router.refresh();
  }

  async function handleToggle(id: string, active: boolean) {
    await fetch(`/api/booking-links/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });

    setLinks((prev) => prev.map((l) => l.id === id ? { ...l, active: !active } : l));
    toast.success(active ? "Enlace desactivado" : "Enlace activado");
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminar este enlace y todas sus reservas?")) return;

    await fetch(`/api/booking-links/${id}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((l) => l.id !== id));
    toast.success("Enlace eliminado");
    router.refresh();
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/book/${slug}`;
    copy(url, { label: "Enlace de reserva copiado", key: slug });
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div>
      {/* Create button / form */}
      {!showForm ? (
        <div className="mb-6">
          <Button onClick={() => setShowForm(true)}>+ Nuevo enlace</Button>
        </div>
      ) : (
        <Card className="mb-6">
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <h3 className="text-sm font-semibold text-white mb-2">Nuevo enlace de reserva</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Slug (URL) *</label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted">/book/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                      required
                      className="flex-1 rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
                      placeholder="mi-consulta"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Titulo</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Duracion (minutos)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    min={15}
                    max={480}
                    className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Expiracion (opcional)</label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Descripcion (opcional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm focus:border-a-accent focus:outline-none resize-none"
                  placeholder="Breve descripcion de la sesion..."
                />
              </div>

              {error && <p className="text-xs text-danger">{error}</p>}

              <div className="flex gap-2">
                <Button type="submit" disabled={creating}>
                  {creating ? "Creando..." : "Crear enlace"}
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

      {/* Links table */}
      <Table>
        <TableHead>
          <TableHeader>Enlace</TableHeader>
          <TableHeader className="hidden sm:table-cell">Duracion</TableHeader>
          <TableHeader>Estado</TableHeader>
          <TableHeader className="hidden md:table-cell">Reservas</TableHeader>
          <TableHeader className="hidden md:table-cell">Expiracion</TableHeader>
          <TableHeader align="right" />
        </TableHead>
        <TableBody>
          {links.length === 0 ? (
            <TableEmpty
              colSpan={6}
              icon={
                <svg className="h-6 w-6 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-3.07a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.343 8.93" />
                </svg>
              }
              message="No hay enlaces de reserva"
            />
          ) : (
            links.map((link) => (
              <TableRow key={link.id}>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{link.title}</p>
                    <p className="text-xs text-muted">/book/{link.slug}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted">{link.duration} min</span>
                </TableCell>
                <TableCell>
                  {isExpired(link.expiresAt) ? (
                    <Badge variant="danger">Expirado</Badge>
                  ) : link.active ? (
                    <Badge variant="success">Activo</Badge>
                  ) : (
                    <Badge variant="muted">Inactivo</Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm text-muted">{link._count.bookings}</span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-xs text-muted">
                    {link.expiresAt
                      ? new Date(link.expiresAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
                      : "Sin expiracion"
                    }
                  </span>
                </TableCell>
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => copyLink(link.slug)}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg transition-all active:scale-90 ${
                        copiedKey === link.slug
                          ? "text-success bg-success/10"
                          : "text-muted hover:text-a-accent hover:bg-card-hover"
                      }`}
                      title="Copiar enlace"
                      aria-label="Copiar enlace"
                    >
                      {copiedKey === link.slug ? (
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
                      onClick={() => handleToggle(link.id, link.active)}
                      className={`hidden sm:inline-flex px-2.5 h-9 items-center rounded-lg text-xs font-medium transition-all active:scale-95 ${
                        link.active ? "text-muted hover:text-warning hover:bg-warning/10" : "text-muted hover:text-success hover:bg-success/10"
                      }`}
                    >
                      {link.active ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="hidden sm:inline-flex px-2.5 h-9 items-center rounded-lg text-xs font-medium text-muted hover:text-danger hover:bg-danger/10 transition-all active:scale-95"
                    >
                      Eliminar
                    </button>
                    {/* Mobile: overflow menu */}
                    <button
                      onClick={() => {
                        const action = confirm(link.active ? "¿Desactivar este enlace?" : "¿Activar este enlace?");
                        if (action) handleToggle(link.id, link.active);
                      }}
                      className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted active:bg-card-hover active:scale-90 transition-all"
                      aria-label="Toggle activo"
                    >
                      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        {link.active ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        )}
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:text-danger active:bg-danger/10 active:scale-90 transition-all"
                      aria-label="Eliminar"
                    >
                      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
