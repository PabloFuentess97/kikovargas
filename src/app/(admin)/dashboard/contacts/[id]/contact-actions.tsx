"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/admin/ui";

interface ContactActionsProps {
  contactId: string;
  currentStatus: string;
  email: string;
}

export function ContactActions({ contactId, currentStatus, email }: ContactActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(status: string) {
    setLoading(status);
    const res = await fetch(`/api/contacts/${contactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert("Error al actualizar el estado");
    }
    setLoading(null);
  }

  async function handleDelete() {
    if (!confirm("Eliminar este mensaje? Esta accion no se puede deshacer.")) return;

    setLoading("DELETE");
    const res = await fetch(`/api/contacts/${contactId}`, { method: "DELETE" });

    if (res.ok) {
      router.push("/dashboard/contacts");
      router.refresh();
    } else {
      alert("Error al eliminar");
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <a
        href={`mailto:${email}?subject=Re: Tu mensaje en kikovargas.fit`}
        onClick={() => {
          if (currentStatus !== "REPLIED") updateStatus("REPLIED");
        }}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-a-accent px-4 py-2.5 text-sm font-medium text-black transition-all hover:bg-a-accent-hover active:scale-[0.97]"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
        Responder por email
      </a>

      {currentStatus !== "ARCHIVED" ? (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => updateStatus("ARCHIVED")}
          disabled={loading !== null}
          loading={loading === "ARCHIVED"}
        >
          Archivar
        </Button>
      ) : (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => updateStatus("READ")}
          disabled={loading !== null}
          loading={loading === "READ"}
        >
          Restaurar
        </Button>
      )}

      <Button
        variant="danger"
        className="w-full"
        onClick={handleDelete}
        disabled={loading !== null}
        loading={loading === "DELETE"}
      >
        Eliminar
      </Button>
    </div>
  );
}
