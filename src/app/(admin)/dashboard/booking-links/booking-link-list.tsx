"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardContent,
  Table, TableHead, TableHeader, TableBody, TableRow, TableCell, TableEmpty,
  Badge, Button,
} from "@/components/admin/ui";

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
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminar este enlace y todas sus reservas?")) return;

    await fetch(`/api/booking-links/${id}`, { method: "DELETE" });
    setLinks((prev) => prev.filter((l) => l.id !== id));
    router.refresh();
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/book/${slug}`;
    navigator.clipboard.writeText(url);
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
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => copyLink(link.slug)}
                      className="text-xs text-muted hover:text-a-accent transition-colors"
                      title="Copiar enlace"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H6M15.75 18h2.25m-2.25 0v3M12 2.25c-1.892 0-3.758.11-5.593.322C5.318 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleToggle(link.id, link.active)}
                      className={`text-xs ${link.active ? "text-muted hover:text-warning" : "text-muted hover:text-success"} transition-colors`}
                    >
                      {link.active ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="text-xs text-muted hover:text-danger transition-colors"
                    >
                      Eliminar
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
