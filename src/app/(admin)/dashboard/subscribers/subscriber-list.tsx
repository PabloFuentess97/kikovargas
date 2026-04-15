"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table, TableHead, TableHeader, TableBody, TableRow, TableCell, TableEmpty,
  Badge,
} from "@/components/admin/ui";

interface Subscriber {
  id: string;
  email: string;
  name: string;
  active: boolean;
  createdAt: Date;
  unsubscribedAt: Date | null;
}

export function SubscriberList({ initialSubscribers }: { initialSubscribers: Subscriber[] }) {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = filter === "all" ? subscribers
    : filter === "active" ? subscribers.filter((s) => s.active)
    : subscribers.filter((s) => !s.active);

  async function handleDelete(id: string) {
    if (!confirm("Eliminar este suscriptor?")) return;

    const res = await fetch("/api/newsletter/subscribers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      router.refresh();
    }
  }

  return (
    <div>
      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(["all", "active", "inactive"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? "bg-a-accent text-black"
                : "bg-a-surface border border-border text-muted hover:text-foreground"
            }`}
          >
            {f === "all" ? "Todos" : f === "active" ? "Activos" : "Dados de baja"}
          </button>
        ))}
      </div>

      <Table>
        <TableHead>
          <TableHeader>Email</TableHeader>
          <TableHeader className="hidden sm:table-cell">Nombre</TableHeader>
          <TableHeader>Estado</TableHeader>
          <TableHeader className="hidden md:table-cell">Fecha</TableHeader>
          <TableHeader align="right" />
        </TableHead>
        <TableBody>
          {filtered.length === 0 ? (
            <TableEmpty
              colSpan={5}
              icon={
                <svg className="h-6 w-6 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              }
              message="No hay suscriptores"
            />
          ) : (
            filtered.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <span className="text-sm font-medium">{sub.email}</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-sm text-muted">{sub.name || "—"}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={sub.active ? "success" : "muted"}>
                    {sub.active ? "Activo" : "Baja"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-xs text-muted">
                    {new Date(sub.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </TableCell>
                <TableCell align="right">
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="text-xs text-muted hover:text-danger transition-colors"
                  >
                    Eliminar
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
