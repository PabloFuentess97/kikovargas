"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/ui/toast";
import { useCopy } from "@/lib/hooks/use-copy";
import { DietMealsEditor } from "@/components/admin/diet-meals-editor";
import { AIWorkoutModal, type GeneratedWorkout } from "@/components/admin/ai-workout-modal";
import { RecipeCard, type RecipeCardData, categoryMeta as recipeCategoryMeta } from "@/components/recipe-card";
import { AreaToggleList } from "@/components/admin/area-toggle-list";

/* ═══════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════ */

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
  birthDate: string | null;
  startedAt: string | null;
  monthlyFee: number | null;
  notes: string;
  heightCm: number | null;
}

interface Exercise {
  name: string;
  sets?: number | string;
  reps?: number | string;
  weight?: string;
  restSec?: number;
  notes?: string;
  completed?: boolean;
}

interface Workout {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  weekDay: number | null;
  exercises: Exercise[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: "DAILY" | "WEEKLY" | "GENERAL";
  completed: boolean;
  dueDate: string | null;
}

interface DocumentItem {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileKey: string;
  fileSize: number;
  fileMime: string;
  uploadedBy: "COACH" | "CLIENT";
  createdAt: string;
}

interface Diet {
  id: string;
  title: string;
  description: string;
  active: boolean;
  startDate: string | null;
  endDate: string | null;
  meals: { name: string; time?: string; foods: { name: string; grams?: number; calories?: number; protein?: number; carbs?: number; fat?: number }[] }[];
  notes: string;
}

interface Invoice {
  id: string;
  number: string;
  concept: string;
  amount: number;
  currency: string;
  status: "DRAFT" | "PENDING" | "PAID" | "CANCELLED" | "OVERDUE";
  issueDate: string;
  dueDate: string | null;
  paidAt: string | null;
  pdfUrl: string | null;
  notes: string;
}

interface CheckIn {
  id: string;
  date: string;
  weightKg: number | null;
  photoFrontUrl: string | null;
  photoSideUrl: string | null;
  photoBackUrl: string | null;
  notes: string;
  createdAt: string;
}

interface AssignedRecipe {
  id: string;
  recipeId: string;
  assignedAt: string;
  recipe: RecipeCardData;
}

interface Initial {
  workouts: Workout[];
  tasks: Task[];
  documents: DocumentItem[];
  diets: Diet[];
  invoices: Invoice[];
  checkIns: CheckIn[];
  assignedRecipes: AssignedRecipe[];
  allRecipes: RecipeCardData[];
  userAllowedAreas: Record<string, boolean> | null;
}

type TabId = "info" | "workouts" | "tasks" | "diet" | "recipes" | "progress" | "documents" | "invoices" | "access";

const TABS: { id: TabId; label: string }[] = [
  { id: "info",      label: "Ficha" },
  { id: "workouts",  label: "Entrenamientos" },
  { id: "tasks",     label: "Checklist" },
  { id: "diet",      label: "Dieta" },
  { id: "recipes",   label: "Recetas" },
  { id: "progress",  label: "Progreso" },
  { id: "documents", label: "Documentos" },
  { id: "invoices",  label: "Facturas" },
  { id: "access",    label: "Accesos" },
];

export function ClientDetailTabs({ client, initial }: { client: Client; initial: Initial }) {
  const [tab, setTab] = useState<TabId>("info");

  return (
    <>
      {/* Tab bar — scrollable on mobile */}
      <div className="flex gap-1 mb-5 border-b border-border overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 px-4 py-2.5 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? "border-a-accent text-a-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "info" && <InfoTab client={client} />}
      {tab === "workouts" && <WorkoutsTab clientId={client.id} initial={initial.workouts} />}
      {tab === "tasks" && <TasksTab clientId={client.id} initial={initial.tasks} />}
      {tab === "diet" && <DietTab clientId={client.id} initial={initial.diets} />}
      {tab === "recipes" && <RecipesTab clientId={client.id} initialAssigned={initial.assignedRecipes} allRecipes={initial.allRecipes} />}
      {tab === "progress" && <ProgressTab clientId={client.id} initial={initial.checkIns} heightCm={client.heightCm} />}
      {tab === "documents" && <DocumentsTab clientId={client.id} initial={initial.documents} />}
      {tab === "invoices" && <InvoicesTab clientId={client.id} initial={initial.invoices} />}
      {tab === "access" && <AccessTab clientId={client.id} initial={initial.userAllowedAreas} />}
    </>
  );
}

/* ─── Recipes tab (assign recipes to client) ─────── */

function RecipesTab({
  clientId,
  initialAssigned,
  allRecipes,
}: {
  clientId: string;
  initialAssigned: AssignedRecipe[];
  allRecipes: RecipeCardData[];
}) {
  const toast = useToast();
  const [assigned, setAssigned] = useState(initialAssigned);
  const [showPicker, setShowPicker] = useState(false);
  const [viewing, setViewing] = useState<RecipeCardData | null>(null);

  async function remove(recipeId: string) {
    if (!confirm("¿Quitar esta receta del cliente?")) return;
    const res = await fetch(`/api/clients/${clientId}/recipes/${recipeId}`, { method: "DELETE" });
    if (res.ok) {
      setAssigned(assigned.filter((a) => a.recipeId !== recipeId));
      toast.success("Receta quitada");
    }
  }

  async function assign(recipeIds: string[]) {
    if (recipeIds.length === 0) return;
    const res = await fetch(`/api/clients/${clientId}/recipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeIds }),
    });
    const json = await res.json();
    if (json.success) {
      setAssigned(json.data.assignments);
      setShowPicker(false);
      toast.success(`${recipeIds.length} receta(s) asignada(s)`);
    } else {
      toast.error(json.error || "Error al asignar");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted">
          {assigned.length === 0
            ? "Este cliente no tiene recetas asignadas."
            : `${assigned.length} receta${assigned.length === 1 ? "" : "s"} asignada${assigned.length === 1 ? "" : "s"}.`}
        </p>
        <button
          onClick={() => setShowPicker(true)}
          className="px-4 h-10 rounded-lg bg-a-accent text-black text-sm font-medium hover:brightness-110 active:scale-[0.97]"
        >
          + Asignar recetas
        </button>
      </div>

      {showPicker && (
        <RecipePickerModal
          allRecipes={allRecipes}
          alreadyAssignedIds={new Set(assigned.map((a) => a.recipeId))}
          onCancel={() => setShowPicker(false)}
          onAssign={assign}
        />
      )}

      {viewing && (
        <RecipeViewerModal recipe={viewing} onClose={() => setViewing(null)} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {assigned.map((a) => {
          const cat = recipeCategoryMeta(a.recipe.category);
          return (
            <div key={a.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span>{cat.icon}</span>
                    <h3 className="text-sm font-semibold">{a.recipe.title}</h3>
                  </div>
                  {a.recipe.description && (
                    <p className="text-xs text-muted mb-2 line-clamp-2">{a.recipe.description}</p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap text-[0.65rem] text-muted">
                    {a.recipe.macros?.calories ? <span>{a.recipe.macros.calories} kcal</span> : null}
                    {a.recipe.servings > 0 && <span>· {a.recipe.servings} raciones</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setViewing(a.recipe)}
                    className="px-3 h-9 rounded-lg text-xs text-muted hover:text-foreground hover:bg-card-hover active:scale-95"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => remove(a.recipeId)}
                    className="h-9 w-9 rounded-lg text-muted hover:text-danger hover:bg-danger/10 inline-flex items-center justify-center"
                    title="Quitar del cliente"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9M5 6h14m-2 0V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v1M5 6l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const RECIPE_PICK_CATEGORIES = [
  { id: "all",      label: "Todas",    icon: "📚" },
  { id: "desayuno", label: "Desayuno", icon: "🥣" },
  { id: "comida",   label: "Comida",   icon: "🍽️" },
  { id: "cena",     label: "Cena",     icon: "🌙" },
  { id: "snack",    label: "Snack",    icon: "🍎" },
  { id: "general",  label: "General",  icon: "📋" },
];

function RecipePickerModal({
  allRecipes,
  alreadyAssignedIds,
  onCancel,
  onAssign,
}: {
  allRecipes: RecipeCardData[];
  alreadyAssignedIds: Set<string>;
  onCancel: () => void;
  onAssign: (recipeIds: string[]) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = allRecipes.filter((r) => {
    if (category !== "all" && r.category !== category) return false;
    if (query.trim() && !r.title.toLowerCase().includes(query.trim().toLowerCase())) return false;
    return true;
  });

  function toggle(id: string) {
    if (alreadyAssignedIds.has(id)) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-semibold">Asignar recetas</h3>
          <button onClick={onCancel} className="text-muted hover:text-foreground text-xl leading-none">×</button>
        </div>

        <div className="p-4 border-b border-border space-y-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full rounded-lg border border-border bg-a-surface px-4 py-2.5 text-sm focus:border-a-accent focus:outline-none"
          />
          <div className="flex gap-1 overflow-x-auto">
            {RECIPE_PICK_CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 ${
                  category === c.id ? "bg-a-accent/15 text-a-accent" : "bg-background text-muted border border-border"
                }`}
              >
                <span>{c.icon}</span>{c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 && (
            <p className="text-sm text-muted text-center py-8">
              No hay recetas que coincidan. <a href="/dashboard/templates" className="text-a-accent hover:underline">Crear en plantillas</a>.
            </p>
          )}
          {filtered.map((r) => {
            const isAssigned = alreadyAssignedIds.has(r.id);
            const isSelected = selected.has(r.id);
            const cat = recipeCategoryMeta(r.category);
            return (
              <label
                key={r.id}
                className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                  isAssigned
                    ? "border-success/20 bg-success/5 cursor-not-allowed"
                    : isSelected
                    ? "border-a-accent/40 bg-a-accent/5 cursor-pointer"
                    : "border-border bg-background hover:border-a-accent/30 cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isAssigned || isSelected}
                  disabled={isAssigned}
                  onChange={() => toggle(r.id)}
                  className="mt-1 h-4 w-4 accent-[#c9a84c]"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>{cat.icon}</span>
                    <span className="text-sm font-medium">{r.title}</span>
                    {isAssigned && (
                      <span className="text-[0.55rem] font-semibold uppercase tracking-widest text-success bg-success/10 px-1.5 py-0.5 rounded">
                        Asignada
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-[0.65rem] text-muted mt-0.5">
                    {r.macros?.calories ? <span>{r.macros.calories} kcal</span> : null}
                    {r.servings > 0 && <span>· {r.servings} raciones</span>}
                    {r.description && <span className="truncate">· {r.description}</span>}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        <div className="p-4 border-t border-border flex items-center gap-2 justify-end">
          <button onClick={onCancel} className="px-4 h-10 rounded-lg text-sm text-muted hover:text-foreground">
            Cancelar
          </button>
          <button
            onClick={() => onAssign(Array.from(selected))}
            disabled={selected.size === 0}
            className="px-4 h-10 rounded-lg bg-a-accent text-black text-sm font-medium disabled:opacity-50"
          >
            Asignar {selected.size > 0 ? `(${selected.size})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

function RecipeViewerModal({ recipe, onClose }: { recipe: RecipeCardData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-background border border-border rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-semibold">Vista previa</h3>
          <button onClick={onClose} className="text-muted hover:text-foreground text-xl leading-none">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <RecipeCard recipe={recipe} />
        </div>
      </div>
    </div>
  );
}

/* ─── Access tab (per-user override) ────────────── */

const DEFAULT_OVERRIDE: Record<string, boolean> = {
  home: true,
  workouts: true,
  tasks: true,
  diet: true,
  recipes: true,
  progress: true,
  documents: true,
  invoices: true,
};

function AccessTab({ clientId, initial }: { clientId: string; initial: Record<string, boolean> | null }) {
  const router = useRouter();
  const toast = useToast();

  const hasOverride = initial !== null;
  const [useDefault, setUseDefault] = useState(!hasOverride);
  const [value, setValue] = useState<Record<string, boolean>>(
    initial ?? DEFAULT_OVERRIDE,
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const payload = useDefault
      ? { allowedAreas: null }
      : { allowedAreas: { ...value, home: true } };

    const res = await fetch(`/api/clients/${clientId}/access`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setSaving(false);

    if (json.success) {
      toast.success("Accesos guardados");
      router.refresh();
    } else {
      toast.error(json.error || "Error al guardar");
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-a-accent/20 bg-a-accent/5 p-5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-a-accent mb-2">
          Accesos individuales
        </p>
        <p className="text-sm text-foreground leading-relaxed">
          Esta configuración <strong>sobrescribe</strong> la global y el estado activo/inactivo
          del cliente. Úsala para casos puntuales: cliente en pausa, acceso a una sola área,
          etc. El cliente <strong>no necesita volver a iniciar sesión</strong> — el cambio es inmediato.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card px-5 py-4">
        <label className="flex items-start gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={useDefault}
            onChange={(e) => setUseDefault(e.target.checked)}
            className="peer sr-only"
          />
          <span
            onClick={() => setUseDefault(!useDefault)}
            className={`shrink-0 relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer ${
              useDefault ? "bg-a-accent" : "bg-background border border-border"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                useDefault ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Usar configuración por defecto</p>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">
              Activo → acceso total. Inactivo → lo que marque la configuración global.
            </p>
          </div>
        </label>
      </div>

      {!useDefault && <AreaToggleList value={value} onChange={setValue} />}

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="px-5 h-11 rounded-lg bg-a-accent text-black text-sm font-medium hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

/* ─── Progress tab (admin view of client check-ins) ─ */

function calcBMI(weightKg: number | null, heightCm: number | null): number | null {
  if (!weightKg || !heightCm) return null;
  const m = heightCm / 100;
  return weightKg / (m * m);
}

function ProgressTab({ clientId, initial, heightCm }: { clientId: string; initial: CheckIn[]; heightCm: number | null }) {
  const toast = useToast();
  const [checkIns, setCheckIns] = useState(initial);

  async function remove(id: string) {
    if (!confirm("¿Eliminar este check-in? La acción es irreversible.")) return;
    const res = await fetch(`/api/clients/${clientId}/checkins/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCheckIns(checkIns.filter((c) => c.id !== id));
      toast.success("Check-in eliminado");
    }
  }

  if (checkIns.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted">
          Aun no hay check-ins del cliente. Los añade el cliente desde su panel en{" "}
          <span className="text-a-accent">Progreso</span>.
        </p>
        {!heightCm && (
          <p className="text-xs text-warning mt-3">
            Para ver el IMC calculado, configura la altura del cliente en la pestaña <strong>Ficha</strong>.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!heightCm && (
        <div className="rounded-xl border border-warning/20 bg-warning/5 p-3">
          <p className="text-xs text-warning">
            Añade la altura del cliente en la pestaña <strong>Ficha</strong> para ver el IMC calculado automáticamente.
          </p>
        </div>
      )}

      {checkIns.map((c) => {
        const bmi = calcBMI(c.weightKg, heightCm);
        const photos = [
          { slot: "Frontal", url: c.photoFrontUrl },
          { slot: "Lateral", url: c.photoSideUrl },
          { slot: "Espalda", url: c.photoBackUrl },
        ].filter((p) => p.url);

        return (
          <div key={c.id} className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
              <div>
                <p className="text-sm font-semibold">
                  {new Date(c.date).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
                <div className="flex items-center gap-3 mt-0.5 text-[0.7rem] text-muted">
                  {c.weightKg && <span className="text-a-accent font-semibold">{c.weightKg} kg</span>}
                  {bmi && <span>IMC {bmi.toFixed(1)}</span>}
                </div>
              </div>
              <button
                onClick={() => remove(c.id)}
                className="h-9 w-9 rounded-lg text-muted hover:text-danger hover:bg-danger/10 active:scale-90 inline-flex items-center justify-center"
                title="Eliminar check-in"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79" />
                </svg>
              </button>
            </div>

            {photos.length > 0 && (
              <div className={`grid gap-0.5 ${photos.length === 1 ? "grid-cols-1" : photos.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                {photos.map((p, i) => (
                  <a key={i} href={p.url!} target="_blank" rel="noopener" className="block aspect-[3/4] relative bg-background">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url!} alt={p.slot} className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[0.55rem] text-white font-medium">
                      {p.slot}
                    </div>
                  </a>
                ))}
              </div>
            )}

            {c.notes && (
              <div className="px-4 py-3 bg-background/40">
                <p className="text-xs text-foreground whitespace-pre-wrap">{c.notes}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Info tab ─────────────────────────────────────── */

function InfoTab({ client }: { client: Client }) {
  const router = useRouter();
  const toast = useToast();
  const { copy } = useCopy();

  const [data, setData] = useState({
    name: client.name,
    email: client.email,
    phone: client.phone ?? "",
    monthlyFee: client.monthlyFee !== null ? (client.monthlyFee / 100).toString() : "",
    startedAt: client.startedAt ? new Date(client.startedAt).toISOString().slice(0, 10) : "",
    heightCm: client.heightCm !== null ? String(client.heightCm) : "",
    notes: client.notes,
    active: client.active,
  });
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      monthlyFee: data.monthlyFee ? Math.round(parseFloat(data.monthlyFee) * 100) : null,
      startedAt: data.startedAt ? new Date(data.startedAt).toISOString() : null,
      heightCm: data.heightCm ? parseInt(data.heightCm, 10) : null,
      notes: data.notes,
      active: data.active,
    };
    if (newPassword) payload.password = newPassword;

    const res = await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (res.ok) {
      toast.success("Cambios guardados");
      setNewPassword("");
      router.refresh();
    } else {
      toast.error("Error al guardar");
    }
  }

  async function deleteClient() {
    if (!confirm(`Eliminar a ${client.name}? Se borrarán todos sus entrenamientos, tareas, documentos, dietas y facturas. Esta acción NO se puede deshacer.`)) return;

    const res = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Cliente eliminado");
      router.push("/dashboard/clients");
      router.refresh();
    } else {
      toast.error("No se pudo eliminar");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">Datos del cliente</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LabeledInput label="Nombre" value={data.name} onChange={(v) => setData({ ...data, name: v })} />
          <LabeledInput label="Email" type="email" value={data.email} onChange={(v) => setData({ ...data, email: v })} />
          <LabeledInput label="Teléfono" value={data.phone} onChange={(v) => setData({ ...data, phone: v })} />
          <LabeledInput label="Inicio coaching" type="date" value={data.startedAt} onChange={(v) => setData({ ...data, startedAt: v })} />
          <LabeledInput label="Cuota mensual (€)" type="number" value={data.monthlyFee} onChange={(v) => setData({ ...data, monthlyFee: v })} placeholder="150.00" />
          <LabeledInput label="Altura (cm)" type="number" value={data.heightCm} onChange={(v) => setData({ ...data, heightCm: v })} placeholder="175" />
          <div>
            <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Estado</label>
            <button
              onClick={() => setData({ ...data, active: !data.active })}
              className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-colors ${
                data.active
                  ? "border-success/30 bg-success/5 text-success"
                  : "border-muted/20 bg-muted/5 text-muted"
              }`}
            >
              <span>{data.active ? "Activo" : "Inactivo"}</span>
              <span className={`h-2 w-2 rounded-full ${data.active ? "bg-success" : "bg-muted"}`} />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">
            <svg className="h-3 w-3 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Notas privadas
            <span className="ml-auto text-[0.55rem] font-normal normal-case tracking-normal text-a-accent/80">
              Solo visibles para ti — el cliente no las ve
            </span>
          </label>
          <textarea
            value={data.notes}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
            rows={4}
            className="w-full rounded-lg border border-border bg-a-surface px-4 py-3 text-sm focus:border-a-accent focus:outline-none resize-none"
            placeholder="Objetivos, lesiones, historial, observaciones de sesiones, recordatorios..."
          />
        </div>

        <div className="mt-6 pt-5 border-t border-border">
          <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Cambiar contraseña</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña (min 8 chars)"
              className="flex-1 rounded-lg border border-border bg-a-surface px-4 py-3 text-sm focus:border-a-accent focus:outline-none"
            />
            <button
              onClick={() => copy(newPassword, { label: "Contraseña copiada" })}
              disabled={!newPassword}
              className="px-3 rounded-lg border border-border text-muted hover:text-foreground disabled:opacity-30"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3 pt-4 border-t border-border">
          <button
            onClick={save}
            disabled={saving}
            className="px-4 h-10 rounded-lg bg-a-accent text-black text-sm font-medium hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            onClick={deleteClient}
            className="px-4 h-10 rounded-lg border border-danger/20 text-danger text-sm font-medium hover:bg-danger/10 active:scale-[0.97]"
          >
            Eliminar cliente
          </button>
        </div>
      </div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={type === "number" ? "0.01" : undefined}
        className="w-full rounded-lg border border-border bg-a-surface px-4 py-3 text-sm focus:border-a-accent focus:outline-none"
      />
    </div>
  );
}

/* ─── Workouts tab ─────────────────────────────────── */

function WorkoutsTab({ clientId, initial }: { clientId: string; initial: Workout[] }) {
  const toast = useToast();
  const [workouts, setWorkouts] = useState(initial);
  const [editing, setEditing] = useState<Workout | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; description: string; category: string; weekDay: number | null; exercises: Exercise[] }>>([]);
  const [loadingTpl, setLoadingTpl] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiDraft, setAiDraft] = useState<GeneratedWorkout | null>(null);

  useEffect(() => {
    if (showTemplates && templates.length === 0) {
      setLoadingTpl(true);
      fetch("/api/workout-templates")
        .then((r) => r.json())
        .then((j) => {
          if (j.success) setTemplates(j.data.templates);
        })
        .finally(() => setLoadingTpl(false));
    }
  }, [showTemplates, templates.length]);

  async function applyTemplate(tplId: string) {
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) return;

    await create({
      title: tpl.name,
      description: tpl.description,
      weekDay: tpl.weekDay,
      status: "ACTIVE",
      exercises: tpl.exercises,
    });
    setShowTemplates(false);
  }

  async function create(data: Partial<Workout>) {
    const res = await fetch(`/api/clients/${clientId}/workouts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setWorkouts([json.data, ...workouts]);
      setShowNew(false);
      toast.success("Entrenamiento creado");
    } else toast.error(json.error || "Error");
  }

  async function update(id: string, data: Partial<Workout>) {
    const res = await fetch(`/api/clients/${clientId}/workouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setWorkouts(workouts.map((w) => (w.id === id ? json.data : w)));
      setEditing(null);
      toast.success("Guardado");
    } else toast.error(json.error || "Error");
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este entrenamiento?")) return;
    const res = await fetch(`/api/clients/${clientId}/workouts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setWorkouts(workouts.filter((w) => w.id !== id));
      toast.success("Eliminado");
    }
  }

  return (
    <div>
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setShowNew(true)}
          className="px-4 h-10 rounded-lg bg-a-accent text-black text-sm font-medium hover:brightness-110 active:scale-[0.97]"
        >
          + Nuevo entrenamiento
        </button>
        <button
          onClick={() => setShowAI(true)}
          className="px-4 h-10 rounded-lg border border-a-accent/30 bg-a-accent/5 text-a-accent text-sm font-medium hover:bg-a-accent/10 active:scale-[0.97] inline-flex items-center gap-1.5"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.091 3.09z" />
          </svg>
          Generar con IA
        </button>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="px-4 h-10 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-card-hover active:scale-[0.97] inline-flex items-center gap-1.5"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          Desde plantilla
        </button>
      </div>

      <AIWorkoutModal
        open={showAI}
        onClose={() => setShowAI(false)}
        onGenerated={(w) => setAiDraft(w)}
      />

      {aiDraft && (
        <WorkoutEditor
          workout={{
            id: "__ai_draft__",
            title: aiDraft.title,
            description: aiDraft.description,
            status: "ACTIVE",
            weekDay: aiDraft.weekDay,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            exercises: aiDraft.exercises as any,
          }}
          onSave={async (data) => {
            await create(data);
            setAiDraft(null);
          }}
          onCancel={() => setAiDraft(null)}
        />
      )}

      {showTemplates && (
        <div className="mb-4 rounded-xl border border-a-accent/30 bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">Elige una plantilla</h4>
            <button onClick={() => setShowTemplates(false)} className="text-xs text-muted hover:text-foreground">Cerrar</button>
          </div>
          {loadingTpl ? (
            <p className="text-sm text-muted text-center py-4">Cargando...</p>
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">
              No hay plantillas todavia. <a href="/dashboard/templates" className="text-a-accent hover:underline">Crear una</a>
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl.id)}
                  className="text-left rounded-lg border border-border bg-background px-3 py-2.5 hover:border-a-accent/40 active:scale-[0.98] transition-all"
                >
                  <p className="text-sm font-medium text-foreground">{tpl.name}</p>
                  <p className="text-[0.65rem] text-muted mt-0.5">{tpl.exercises.length} ejercicios · {tpl.category}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {showNew && <WorkoutEditor onSave={create} onCancel={() => setShowNew(false)} />}

      <div className="space-y-3">
        {workouts.length === 0 && !showNew && (
          <p className="text-sm text-muted text-center py-8">Sin entrenamientos.</p>
        )}
        {workouts.map((w) =>
          editing?.id === w.id ? (
            <WorkoutEditor
              key={w.id}
              workout={w}
              onSave={(data) => update(w.id, data)}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <div key={w.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold">{w.title}</h3>
                    <StatusPill status={w.status} />
                  </div>
                  {w.description && <p className="text-xs text-muted mb-2">{w.description}</p>}
                  <p className="text-[0.7rem] text-muted">
                    {w.exercises.length} ejercicio{w.exercises.length !== 1 ? "s" : ""}
                    {w.weekDay !== null && ` · ${["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"][w.weekDay]}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditing(w)} className="px-3 h-9 rounded-lg text-xs text-muted hover:text-foreground hover:bg-card-hover active:scale-95">Editar</button>
                  <button onClick={() => remove(w.id)} className="px-3 h-9 rounded-lg text-xs text-muted hover:text-danger hover:bg-danger/10 active:scale-95">Eliminar</button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function WorkoutEditor({ workout, onSave, onCancel }: { workout?: Workout; onSave: (data: Partial<Workout>) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(workout?.title ?? "");
  const [description, setDescription] = useState(workout?.description ?? "");
  const [status, setStatus] = useState<Workout["status"]>(workout?.status ?? "ACTIVE");
  const [weekDay, setWeekDay] = useState<number | null>(workout?.weekDay ?? null);
  const [exercises, setExercises] = useState<Exercise[]>(workout?.exercises ?? []);

  function addExercise() {
    setExercises([...exercises, { name: "", sets: "", reps: "", weight: "", notes: "" }]);
  }

  function updateExercise(i: number, key: keyof Exercise, value: string | number) {
    const next = [...exercises];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    next[i] = { ...next[i], [key]: value as any };
    setExercises(next);
  }

  function removeExercise(i: number) {
    setExercises(exercises.filter((_, idx) => idx !== i));
  }

  return (
    <div className="rounded-xl border border-a-accent/30 bg-card p-4 mb-3 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <LabeledInput label="Título" value={title} onChange={setTitle} placeholder="Día 1 — Pecho y tríceps" />
        <div>
          <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Día</label>
          <select
            value={weekDay ?? ""}
            onChange={(e) => setWeekDay(e.target.value === "" ? null : Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-a-surface px-4 py-3 text-sm"
          >
            <option value="">General</option>
            <option value="1">Lunes</option>
            <option value="2">Martes</option>
            <option value="3">Miércoles</option>
            <option value="4">Jueves</option>
            <option value="5">Viernes</option>
            <option value="6">Sábado</option>
            <option value="0">Domingo</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-border bg-a-surface px-4 py-3 text-sm resize-none"
        />
      </div>

      <div>
        <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Estado</label>
        <div className="flex gap-2 flex-wrap">
          {(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${status === s ? "bg-a-accent/15 text-a-accent" : "bg-background text-muted"}`}
            >
              {s === "DRAFT" ? "Borrador" : s === "ACTIVE" ? "Activo" : s === "COMPLETED" ? "Completado" : "Archivado"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">Ejercicios</label>
          <button onClick={addExercise} className="text-xs text-a-accent hover:underline">+ Añadir</button>
        </div>

        <div className="space-y-2">
          {exercises.map((ex, i) => (
            <div key={i} className="rounded-lg border border-border bg-background p-3 space-y-2">
              <input
                value={ex.name}
                onChange={(e) => updateExercise(i, "name", e.target.value)}
                placeholder="Nombre (ej. Press banca)"
                className="w-full rounded border border-border bg-a-surface px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input value={String(ex.sets ?? "")} onChange={(e) => updateExercise(i, "sets", e.target.value)} placeholder="Series" className="rounded border border-border bg-a-surface px-3 py-2 text-sm" />
                <input value={String(ex.reps ?? "")} onChange={(e) => updateExercise(i, "reps", e.target.value)} placeholder="Reps" className="rounded border border-border bg-a-surface px-3 py-2 text-sm" />
                <input value={ex.weight ?? ""} onChange={(e) => updateExercise(i, "weight", e.target.value)} placeholder="Peso" className="rounded border border-border bg-a-surface px-3 py-2 text-sm" />
                <input type="number" value={ex.restSec ?? ""} onChange={(e) => updateExercise(i, "restSec", Number(e.target.value))} placeholder="Descanso (s)" className="rounded border border-border bg-a-surface px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-2">
                <input value={ex.notes ?? ""} onChange={(e) => updateExercise(i, "notes", e.target.value)} placeholder="Notas" className="flex-1 rounded border border-border bg-a-surface px-3 py-2 text-sm" />
                <button onClick={() => removeExercise(i)} className="px-3 rounded text-xs text-danger hover:bg-danger/10">✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-border">
        <button
          onClick={() => onSave({ title, description, status, weekDay, exercises })}
          disabled={!title}
          className="px-4 h-10 rounded-lg bg-a-accent text-black text-sm font-medium disabled:opacity-50"
        >
          Guardar
        </button>
        <button onClick={onCancel} className="px-4 h-10 rounded-lg text-sm text-muted hover:text-foreground">Cancelar</button>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Workout["status"] }) {
  const map: Record<Workout["status"], { t: string; c: string }> = {
    DRAFT: { t: "Borrador", c: "text-muted bg-muted/10" },
    ACTIVE: { t: "Activo", c: "text-success bg-success/10" },
    COMPLETED: { t: "Completado", c: "text-a-accent bg-a-accent/10" },
    ARCHIVED: { t: "Archivado", c: "text-muted bg-muted/10" },
  };
  const v = map[status];
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-medium ${v.c}`}>{v.t}</span>;
}

/* ─── Tasks tab ────────────────────────────────────── */

function TasksTab({ clientId, initial }: { clientId: string; initial: Task[] }) {
  const toast = useToast();
  const [tasks, setTasks] = useState(initial);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Task["category"]>("GENERAL");

  async function create() {
    if (!newTitle.trim()) return;
    const res = await fetch(`/api/clients/${clientId}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, category: newCategory }),
    });
    const json = await res.json();
    if (json.success) {
      setTasks([json.data, ...tasks]);
      setNewTitle("");
      toast.success("Tarea creada");
    }
  }

  async function toggle(id: string, completed: boolean) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed } : t)));
    await fetch(`/api/clients/${clientId}/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
  }

  async function remove(id: string) {
    await fetch(`/api/clients/${clientId}/tasks/${id}`, { method: "DELETE" });
    setTasks(tasks.filter((t) => t.id !== id));
    toast.success("Eliminada");
  }

  return (
    <div>
      <div className="rounded-xl border border-border bg-card p-4 mb-4">
        <div className="flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") create(); }}
            placeholder="Nueva tarea..."
            className="flex-1 rounded-lg border border-border bg-a-surface px-4 py-2.5 text-sm"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as Task["category"])}
            className="rounded-lg border border-border bg-a-surface px-3 text-sm"
          >
            <option value="DAILY">Diaria</option>
            <option value="WEEKLY">Semanal</option>
            <option value="GENERAL">General</option>
          </select>
          <button onClick={create} className="px-4 rounded-lg bg-a-accent text-black text-sm font-medium">+</button>
        </div>
      </div>

      <div className="space-y-1.5">
        {tasks.length === 0 && <p className="text-sm text-muted text-center py-8">Sin tareas.</p>}
        {tasks.map((t) => (
          <div key={t.id} className={`flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 ${t.completed ? "opacity-60" : ""}`}>
            <button
              onClick={() => toggle(t.id, !t.completed)}
              className={`shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center ${t.completed ? "bg-a-accent border-a-accent" : "border-border"}`}
            >
              {t.completed && <svg className="h-3 w-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${t.completed ? "line-through text-muted" : "text-foreground"}`}>{t.title}</p>
              <p className="text-[0.6rem] uppercase tracking-wider text-muted">{t.category.toLowerCase()}</p>
            </div>
            <button onClick={() => remove(t.id)} className="shrink-0 text-muted hover:text-danger text-xs">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Diet tab ─────────────────────────────────────── */

function DietTab({ clientId, initial }: { clientId: string; initial: Diet[] }) {
  const toast = useToast();
  const [diets, setDiets] = useState(initial);
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<Array<{ id: string; name: string; description: string; category: string; meals: Diet["meals"]; notes: string }>>([]);
  const [loadingTpl, setLoadingTpl] = useState(false);

  useEffect(() => {
    if (showTemplates && templates.length === 0) {
      setLoadingTpl(true);
      fetch("/api/diet-templates")
        .then((r) => r.json())
        .then((j) => {
          if (j.success) setTemplates(j.data.templates);
        })
        .finally(() => setLoadingTpl(false));
    }
  }, [showTemplates, templates.length]);

  async function applyTemplate(tplId: string) {
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) return;

    await create({
      title: tpl.name,
      description: tpl.description,
      meals: tpl.meals,
      notes: tpl.notes,
      active: true,
    });
    setShowTemplates(false);
  }

  async function create(data: Partial<Diet>) {
    const res = await fetch(`/api/clients/${clientId}/diets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setDiets([json.data, ...diets.map((d) => ({ ...d, active: false }))]);
      setShowNew(false);
      toast.success("Dieta creada");
    }
  }

  async function update(id: string, data: Partial<Diet>) {
    const res = await fetch(`/api/clients/${clientId}/diets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setDiets(diets.map((d) => (d.id === id ? json.data : data.active ? { ...d, active: false } : d)));
      setEditingId(null);
      toast.success("Guardado");
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta dieta?")) return;
    await fetch(`/api/clients/${clientId}/diets/${id}`, { method: "DELETE" });
    setDiets(diets.filter((d) => d.id !== id));
    toast.success("Eliminada");
  }

  return (
    <div>
      <div className="mb-4 flex gap-2 flex-wrap">
        <button onClick={() => setShowNew(true)} className="px-4 h-10 rounded-lg bg-a-accent text-black text-sm font-medium">
          + Nueva dieta
        </button>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="px-4 h-10 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-card-hover inline-flex items-center gap-1.5"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          Desde plantilla
        </button>
      </div>

      {showTemplates && (
        <div className="mb-4 rounded-xl border border-a-accent/30 bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">Elige una plantilla</h4>
            <button onClick={() => setShowTemplates(false)} className="text-xs text-muted hover:text-foreground">Cerrar</button>
          </div>
          {loadingTpl ? (
            <p className="text-sm text-muted text-center py-4">Cargando...</p>
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">
              No hay plantillas. <a href="/dashboard/templates" className="text-a-accent hover:underline">Crear una</a>
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl.id)}
                  className="text-left rounded-lg border border-border bg-background px-3 py-2.5 hover:border-a-accent/40 active:scale-[0.98] transition-all"
                >
                  <p className="text-sm font-medium text-foreground">{tpl.name}</p>
                  <p className="text-[0.65rem] text-muted mt-0.5">{tpl.meals.length} comidas · {tpl.category}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {showNew && <DietEditor onSave={create} onCancel={() => setShowNew(false)} />}

      <div className="space-y-3">
        {diets.length === 0 && !showNew && <p className="text-sm text-muted text-center py-8">Sin dietas.</p>}
        {diets.map((d) =>
          editingId === d.id ? (
            <DietEditor key={d.id} diet={d} onSave={(data) => update(d.id, data)} onCancel={() => setEditingId(null)} />
          ) : (
            <div key={d.id} className={`rounded-xl border ${d.active ? "border-a-accent/30" : "border-border"} bg-card p-4`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold">{d.title}</h3>
                    {d.active && <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-medium bg-a-accent/10 text-a-accent">Activa</span>}
                  </div>
                  <p className="text-[0.7rem] text-muted">{d.meals?.length ?? 0} comidas</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditingId(d.id)} className="px-3 h-9 rounded-lg text-xs text-muted hover:text-foreground hover:bg-card-hover">Editar</button>
                  <button onClick={() => remove(d.id)} className="px-3 h-9 rounded-lg text-xs text-muted hover:text-danger hover:bg-danger/10">✕</button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function DietEditor({ diet, onSave, onCancel }: { diet?: Diet; onSave: (data: Partial<Diet>) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(diet?.title ?? "");
  const [description, setDescription] = useState(diet?.description ?? "");
  const [active, setActive] = useState(diet?.active ?? true);
  const [notes, setNotes] = useState(diet?.notes ?? "");
  const [meals, setMeals] = useState<Diet["meals"]>(diet?.meals ?? []);

  function save() {
    onSave({ title, description, active, notes, meals });
  }

  return (
    <div className="rounded-xl border border-a-accent/30 bg-card p-4 mb-3 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <LabeledInput label="Titulo" value={title} onChange={setTitle} placeholder="Ej: Definicion — Abril 2026" />
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4 accent-[#c9a84c]" />
            <span className="text-sm">Dieta activa</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Descripcion</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-lg border border-border bg-a-surface px-4 py-3 text-sm resize-none" placeholder="Objetivo del plan, fase, etc." />
      </div>

      <div>
        <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Comidas</label>
        <DietMealsEditor meals={meals} onChange={setMeals} />
      </div>

      <div>
        <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Notas</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-a-surface px-4 py-3 text-sm resize-none" placeholder="Hidratacion, suplementacion, comida trampa..." />
      </div>

      <div className="flex gap-2 pt-2 border-t border-border">
        <button onClick={save} disabled={!title} className="px-4 h-10 rounded-lg bg-a-accent text-black text-sm font-medium disabled:opacity-50">Guardar</button>
        <button onClick={onCancel} className="px-4 h-10 rounded-lg text-sm text-muted">Cancelar</button>
      </div>
    </div>
  );
}

/* ─── Documents tab ────────────────────────────────── */

function DocumentsTab({ clientId, initial }: { clientId: string; initial: DocumentItem[] }) {
  const toast = useToast();
  const [docs, setDocs] = useState(initial);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fd = new FormData();
    fd.append("files", file);

    try {
      const up = await fetch("/api/upload", { method: "POST", body: fd });
      const upJson = await up.json();
      if (!upJson.success || !upJson.data.uploaded[0]) throw new Error(upJson.data?.errors?.[0]?.message || "Error al subir");
      const f = upJson.data.uploaded[0];

      const title = prompt("Título del documento:", file.name) || file.name;
      const description = prompt("Descripción (opcional):", "") || "";

      const res = await fetch(`/api/clients/${clientId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          fileUrl: f.url,
          fileKey: f.key,
          fileSize: file.size,
          fileMime: file.type,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setDocs([json.data, ...docs]);
        toast.success("Documento subido");
      } else toast.error(json.error || "Error");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este documento?")) return;
    await fetch(`/api/clients/${clientId}/documents/${id}`, { method: "DELETE" });
    setDocs(docs.filter((d) => d.id !== id));
    toast.success("Eliminado");
  }

  return (
    <div>
      <label className="block cursor-pointer mb-4">
        <input type="file" onChange={handleFile} disabled={uploading} className="hidden" accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt" />
        <div className={`rounded-xl border-2 border-dashed ${uploading ? "border-a-accent/50" : "border-border"} bg-card px-4 py-6 text-center active:scale-[0.99] transition-all`}>
          <p className="text-sm text-muted">
            {uploading ? "Subiendo..." : "Toca para subir un documento"}
          </p>
          <p className="text-[0.65rem] text-muted/60 mt-1">Imagenes, PDF, Word, Excel, TXT — max 15 MB</p>
        </div>
      </label>

      <div className="space-y-2">
        {docs.length === 0 && <p className="text-sm text-muted text-center py-8">Sin documentos.</p>}
        {docs.map((d) => (
          <div key={d.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
            <a
              href={`/api/panel/documents/${d.id}/download`}
              target="_blank"
              rel="noopener"
              className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-background text-lg"
            >
              📎
            </a>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{d.title}</p>
              <p className="text-[0.65rem] text-muted">
                {(d.fileSize / 1024).toFixed(1)} KB · {new Date(d.createdAt).toLocaleDateString("es-ES")}
              </p>
            </div>
            <button onClick={() => remove(d.id)} className="shrink-0 h-9 w-9 rounded-lg text-muted hover:text-danger hover:bg-danger/10">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Invoices tab ─────────────────────────────────── */

function InvoicesTab({ clientId, initial }: { clientId: string; initial: Invoice[] }) {
  const toast = useToast();
  const [invoices, setInvoices] = useState(initial);
  const [showNew, setShowNew] = useState(false);

  const [newData, setNewData] = useState({
    number: `${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`,
    concept: "",
    amount: "",
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
  });

  async function create() {
    const res = await fetch(`/api/clients/${clientId}/invoices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: newData.number,
        concept: newData.concept,
        amount: Math.round(parseFloat(newData.amount) * 100),
        issueDate: new Date(newData.issueDate).toISOString(),
        dueDate: newData.dueDate ? new Date(newData.dueDate).toISOString() : null,
      }),
    });
    const json = await res.json();
    if (json.success) {
      setInvoices([json.data, ...invoices]);
      setShowNew(false);
      setNewData({ ...newData, concept: "", amount: "" });
      toast.success("Factura creada");
    } else toast.error(json.error || "Error");
  }

  async function setStatus(id: string, status: Invoice["status"]) {
    const res = await fetch(`/api/clients/${clientId}/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (json.success) {
      setInvoices(invoices.map((i) => (i.id === id ? json.data : i)));
      toast.success("Actualizada");
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta factura?")) return;
    await fetch(`/api/clients/${clientId}/invoices/${id}`, { method: "DELETE" });
    setInvoices(invoices.filter((i) => i.id !== id));
    toast.success("Eliminada");
  }

  return (
    <div>
      <button onClick={() => setShowNew(!showNew)} className="mb-4 px-4 h-10 rounded-lg bg-a-accent text-black text-sm font-medium">
        + Nueva factura
      </button>

      {showNew && (
        <div className="rounded-xl border border-a-accent/30 bg-card p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <LabeledInput label="Número" value={newData.number} onChange={(v) => setNewData({ ...newData, number: v })} />
            <LabeledInput label="Importe (€)" type="number" value={newData.amount} onChange={(v) => setNewData({ ...newData, amount: v })} placeholder="150.00" />
            <LabeledInput label="Fecha emisión" type="date" value={newData.issueDate} onChange={(v) => setNewData({ ...newData, issueDate: v })} />
            <LabeledInput label="Fecha vencimiento" type="date" value={newData.dueDate} onChange={(v) => setNewData({ ...newData, dueDate: v })} />
          </div>
          <LabeledInput label="Concepto" value={newData.concept} onChange={(v) => setNewData({ ...newData, concept: v })} placeholder="Coaching mensual — Abril 2026" />
          <div className="flex gap-2 pt-2 border-t border-border">
            <button onClick={create} disabled={!newData.number || !newData.concept || !newData.amount} className="px-4 h-10 rounded-lg bg-a-accent text-black text-sm font-medium disabled:opacity-50">Crear</button>
            <button onClick={() => setShowNew(false)} className="px-4 h-10 rounded-lg text-sm text-muted">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {invoices.length === 0 && <p className="text-sm text-muted text-center py-8">Sin facturas.</p>}
        {invoices.map((inv) => {
          const color: Record<Invoice["status"], string> = {
            DRAFT: "text-muted bg-muted/10",
            PENDING: "text-warning bg-warning/10",
            PAID: "text-success bg-success/10",
            CANCELLED: "text-muted bg-muted/10",
            OVERDUE: "text-danger bg-danger/10",
          };
          return (
            <div key={inv.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-medium ${color[inv.status]}`}>
                      {inv.status}
                    </span>
                    <span className="text-[0.65rem] text-muted">#{inv.number}</span>
                  </div>
                  <p className="text-sm font-medium truncate">{inv.concept}</p>
                  <p className="text-[0.7rem] text-muted">
                    {new Date(inv.issueDate).toLocaleDateString("es-ES")} · {new Intl.NumberFormat("es-ES", { style: "currency", currency: inv.currency }).format(inv.amount / 100)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={`/invoice/${inv.id}`}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-1 px-3 h-9 rounded-lg text-xs text-a-accent hover:bg-a-accent/10"
                    title="Ver y descargar PDF"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    PDF
                  </a>
                  {inv.status === "PENDING" && (
                    <button onClick={() => setStatus(inv.id, "PAID")} className="px-3 h-9 rounded-lg text-xs text-success hover:bg-success/10">✓ Pagada</button>
                  )}
                  {inv.status === "PAID" && (
                    <button onClick={() => setStatus(inv.id, "PENDING")} className="px-3 h-9 rounded-lg text-xs text-muted hover:bg-card-hover">↺ Reabrir</button>
                  )}
                  <button onClick={() => remove(inv.id)} className="px-3 h-9 rounded-lg text-xs text-muted hover:text-danger hover:bg-danger/10">✕</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
