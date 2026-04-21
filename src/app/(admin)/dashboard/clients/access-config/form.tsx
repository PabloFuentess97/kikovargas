"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/ui/toast";

const AREAS: { key: string; label: string; description: string; icon: string; locked?: boolean }[] = [
  { key: "home",       label: "Inicio del panel", description: "Dashboard con resumen. Siempre activo.", icon: "🏠", locked: true },
  { key: "workouts",   label: "Entrenamientos",   description: "Ver rutinas y marcar ejercicios como completados.", icon: "💪" },
  { key: "tasks",      label: "Checklist",        description: "Lista de tareas diarias/semanales.", icon: "✅" },
  { key: "diet",       label: "Dieta",            description: "Plan nutricional con comidas y macros.", icon: "🥗" },
  { key: "progress",   label: "Progreso",         description: "Check-ins semanales: peso, IMC, fotos antes/despues.", icon: "📈" },
  { key: "documents",  label: "Documentos",       description: "Archivos compartidos entre Kiko y el cliente.", icon: "📎" },
  { key: "invoices",   label: "Facturas",         description: "Historial de facturacion y pagos.", icon: "💶" },
];

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
        </p>
      </div>

      {/* Area toggles */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
        {AREAS.map((area) => (
          <label
            key={area.key}
            className={`flex items-start gap-4 px-5 py-4 transition-colors ${
              area.locked ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-card-hover"
            }`}
          >
            <span className="shrink-0 text-2xl" aria-hidden>{area.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{area.label}</p>
                {area.locked && (
                  <span className="text-[0.55rem] font-semibold uppercase tracking-widest text-muted bg-muted/10 px-1.5 py-0.5 rounded">
                    Fijo
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-0.5 leading-relaxed">{area.description}</p>
            </div>

            {/* Toggle switch */}
            <div className="shrink-0">
              <input
                type="checkbox"
                checked={access[area.key] ?? false}
                disabled={area.locked}
                onChange={(e) => setAccess({ ...access, [area.key]: e.target.checked })}
                className="peer sr-only"
              />
              <span
                onClick={() => {
                  if (!area.locked) setAccess({ ...access, [area.key]: !access[area.key] });
                }}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  access[area.key] ? "bg-a-accent" : "bg-background border border-border"
                } ${area.locked ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                    access[area.key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </span>
            </div>
          </label>
        ))}
      </div>

      {/* Preview summary */}
      <div className="rounded-xl border border-border bg-a-surface/50 p-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted mb-2">
          Resumen
        </p>
        <p className="text-sm text-foreground leading-relaxed">
          Un cliente inactivo podra ver:{" "}
          <strong className="text-a-accent">
            {AREAS.filter((a) => access[a.key]).map((a) => a.label).join(", ") || "nada"}
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
