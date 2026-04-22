"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/ui/toast";
import { AreaToggleList, DEFAULT_AREAS } from "@/components/admin/area-toggle-list";

export function AccessConfigForm({ initial }: { initial: Record<string, boolean> }) {
  const router = useRouter();
  const toast = useToast();
  const [access, setAccess] = useState(initial);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch("/api/inactive-client-access", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(access),
    });
    const json = await res.json();
    setSaving(false);

    if (json.success) {
      toast.success("Configuracion guardada");
      router.refresh();
    } else {
      toast.error(json.error || "Error al guardar");
    }
  }

  function reset() {
    setAccess({
      home: true,
      workouts: false,
      tasks: false,
      diet: false,
      recipes: false,
      progress: false,
      documents: true,
      invoices: true,
    });
  }

  return (
    <div className="space-y-5">
      {/* Info card */}
      <div className="rounded-xl border border-a-accent/20 bg-a-accent/5 p-5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-a-accent mb-2">
          Como funciona
        </p>
        <p className="text-sm text-foreground leading-relaxed">
          Cuando desactivas a un cliente desde su ficha, sigue pudiendo acceder a su panel
          pero <strong className="text-foreground">solo a las secciones que marques aqui</strong>.
          Los clientes <strong className="text-foreground">activos</strong> siempre tienen acceso
          completo independientemente de esta configuracion.
          <br />
          <span className="text-muted text-xs">
            Puedes sobrescribir estos accesos por cliente desde su ficha → pestaña <strong>Accesos</strong>.
          </span>
        </p>
      </div>

      <AreaToggleList value={access} onChange={setAccess} />

      {/* Preview summary */}
      <div className="rounded-xl border border-border bg-a-surface/50 p-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted mb-2">
          Resumen
        </p>
        <p className="text-sm text-foreground leading-relaxed">
          Un cliente inactivo podra ver:{" "}
          <strong className="text-a-accent">
            {DEFAULT_AREAS.filter((a) => access[a.key]).map((a) => a.label).join(", ") || "nada"}
          </strong>
          .
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="px-5 h-11 rounded-lg bg-a-accent text-black text-sm font-medium hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        <button
          onClick={reset}
          className="px-4 h-11 rounded-lg text-sm text-muted hover:text-foreground active:scale-[0.97]"
        >
          Restablecer
        </button>
      </div>
    </div>
  );
}
