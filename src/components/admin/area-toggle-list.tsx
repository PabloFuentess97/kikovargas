"use client";

export interface AreaDescriptor {
  key: string;
  label: string;
  description: string;
  icon: string;
  locked?: boolean;
}

/** Default catalog — matches ALL_AREAS (see src/lib/auth/client-access.ts) */
export const DEFAULT_AREAS: AreaDescriptor[] = [
  { key: "home",      label: "Inicio del panel", description: "Dashboard con resumen. Siempre activo.", icon: "🏠", locked: true },
  { key: "workouts",  label: "Entrenamientos",   description: "Ver rutinas y marcar ejercicios como completados.", icon: "💪" },
  { key: "tasks",     label: "Checklist",        description: "Lista de tareas diarias/semanales.", icon: "✅" },
  { key: "diet",      label: "Dieta",            description: "Plan nutricional con comidas y macros.", icon: "🥗" },
  { key: "recipes",   label: "Recetas",          description: "Librería de recetas asignadas por Kiko.", icon: "📖" },
  { key: "progress",  label: "Progreso",         description: "Check-ins semanales: peso, IMC, fotos antes/despues.", icon: "📈" },
  { key: "documents", label: "Documentos",       description: "Archivos compartidos entre Kiko y el cliente.", icon: "📎" },
  { key: "invoices",  label: "Facturas",         description: "Historial de facturacion y pagos.", icon: "💶" },
];

export function AreaToggleList({
  value,
  onChange,
  areas = DEFAULT_AREAS,
}: {
  value: Record<string, boolean>;
  onChange: (next: Record<string, boolean>) => void;
  areas?: AreaDescriptor[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
      {areas.map((area) => {
        const checked = Boolean(value[area.key]);
        return (
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

            <div className="shrink-0">
              <input
                type="checkbox"
                checked={checked}
                disabled={area.locked}
                onChange={(e) => onChange({ ...value, [area.key]: e.target.checked })}
                className="peer sr-only"
              />
              <span
                onClick={() => {
                  if (!area.locked) onChange({ ...value, [area.key]: !checked });
                }}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  checked ? "bg-a-accent" : "bg-background border border-border"
                } ${area.locked ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                    checked ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </span>
            </div>
          </label>
        );
      })}
    </div>
  );
}
