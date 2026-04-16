"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableHead, TableHeader, TableBody, TableRow, TableCell, TableEmpty,
  Badge,
} from "@/components/admin/ui";

interface Booking {
  id: string;
  date: string;
  duration: number;
  name: string;
  email: string;
  phone: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  link: { slug: string; title: string };
}

const STATUS_MAP: Record<string, { text: string; variant: "warning" | "success" | "danger" | "muted" }> = {
  PENDING: { text: "Pendiente", variant: "warning" },
  CONFIRMED: { text: "Confirmada", variant: "success" },
  CANCELLED: { text: "Cancelada", variant: "danger" },
};

export function BookingList({ initialBookings }: { initialBookings: Booking[] }) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState<"all" | "CONFIRMED" | "CANCELLED" | "PENDING">("all");

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  async function handleStatusChange(id: string, status: "CONFIRMED" | "CANCELLED") {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      router.refresh();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminar esta reserva?")) return;

    const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBookings((prev) => prev.filter((b) => b.id !== id));
      router.refresh();
    }
  }

  return (
    <div>
      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {(["all", "CONFIRMED", "PENDING", "CANCELLED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
              filter === f
                ? "bg-a-accent text-black"
                : "bg-a-surface border border-border text-muted hover:text-foreground"
            }`}
          >
            {f === "all" ? "Todas" : STATUS_MAP[f]?.text || f}
          </button>
        ))}
      </div>

      <Table>
        <TableHead>
          <TableHeader>Cliente</TableHeader>
          <TableHeader className="hidden sm:table-cell">Fecha</TableHeader>
          <TableHeader className="hidden md:table-cell">Hora</TableHeader>
          <TableHeader>Estado</TableHeader>
          <TableHeader className="hidden lg:table-cell">Enlace</TableHeader>
          <TableHeader align="right" />
        </TableHead>
        <TableBody>
          {filtered.length === 0 ? (
            <TableEmpty
              colSpan={6}
              icon={
                <svg className="h-6 w-6 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              }
              message="No hay reservas"
            />
          ) : (
            filtered.map((booking) => {
              const date = new Date(booking.date);
              const status = STATUS_MAP[booking.status] || STATUS_MAP.PENDING;

              return (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{booking.name}</p>
                      <p className="text-xs text-muted">{booking.email}</p>
                      {booking.phone && <p className="text-xs text-muted">{booking.phone}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm text-muted capitalize">
                      {date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm font-medium text-a-accent">
                      {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.text}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs text-muted">{booking.link.title}</span>
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-2">
                      {booking.status !== "CANCELLED" && (
                        <button
                          onClick={() => handleStatusChange(booking.id, "CANCELLED")}
                          className="text-xs text-muted hover:text-danger transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                      {booking.status === "CANCELLED" && (
                        <button
                          onClick={() => handleStatusChange(booking.id, "CONFIRMED")}
                          className="text-xs text-muted hover:text-success transition-colors"
                        >
                          Reactivar
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(booking.id)}
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
