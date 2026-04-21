"use client";

import { useState } from "react";
import { useToast } from "@/components/admin/ui/toast";
import { DietMealsEditor } from "@/components/admin/diet-meals-editor";

/* ═══════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════ */

interface Exercise {
  name: string;
  sets?: number | string;
  reps?: number | string;
  weight?: string;
  restSec?: number;
  notes?: string;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  weekDay: number | null;
  exercises: Exercise[];
}

interface Food {
  name: string;
  grams?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface Meal {
  name: string;
  time?: string;
  foods: Food[];
}

interface DietTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  meals: Meal[];
  notes: string;
}

const WORKOUT_CATEGORIES = [
  { id: "perdida-peso", label: "Perdida de peso", icon: "🔥" },
  { id: "masa-muscular", label: "Masa muscular", icon: "💪" },
  { id: "competicion", label: "Competicion", icon: "🏆" },
  { id: "general", label: "General", icon: "📋" },
];

const DIET_CATEGORIES = [
  { id: "perdida-peso", label: "Perdida de peso", icon: "🔥" },
  { id: "volumen", label: "Volumen", icon: "📈" },
  { id: "mantenimiento", label: "Mantenimiento", icon: "⚖️" },
  { id: "general", label: "General", icon: "📋" },
];

/* ═══════════════════════════════════════════════════
   Main tabs
   ═══════════════════════════════════════════════════ */

export function TemplatesClient({
  initialWorkouts,
  initialDiets,
}: {
  initialWorkouts: WorkoutTemplate[];
  initialDiets: DietTemplate[];
}) {
  const [tab, setTab] = useState<"workouts" | "diets">("workouts");

  return (
    <>
      <div className="flex gap-1 mb-5 border-b border-border">
        <button
          onClick={() => setTab("workouts")}
          className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 -mb-px ${
            tab === "workouts" ? "border-a-accent text-a-accent" : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Entrenamientos ({initialWorkouts.length})
        </button>
        <button
          onClick={() => setTab("diets")}
          className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 -mb-px ${
            tab === "diets" ? "border-a-accent text-a-accent" : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Dietas ({initialDiets.length})
        </button>
      </div>

      {tab === "workouts" && <WorkoutTemplatesTab initial={initialWorkouts} />}
      {tab === "diets" && <DietTemplatesTab initial={initialDiets} />}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   Workout templates
   ═══════════════════════════════════════════════════ */

function WorkoutTemplatesTab({ initial }: { initial: WorkoutTemplate[] }) {
  const toast = useToast();
  const [templates, setTemplates] = useState(initial);
  const [editing, setEditing] = useState<WorkoutTemplate | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  async function create(data: Partial<WorkoutTemplate>) {
    const res = await fetch("/api/workout-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setTemplates([json.data, ...templates]);
      setShowNew(false);
      toast.success("Plantilla creada");
    } else {
      toast.error(json.error || "Error");
    }
  }

  async function update(id: string, data: Partial<WorkoutTemplate>) {
    const res = await fetch(`/api/workout-templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setTemplates(templates.map((t) => (t.id === id ? json.data : t)));
      setEditing(null);
      toast.success("Guardada");
    } else {
      toast.error(json.error || "Error");
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta plantilla?")) return;
    await fetch(`/api/workout-templates/${id}`, { method: "DELETE" });
    setTemplates(templates.filter((t) => t.id !== id));
    toast.success("Eliminada");
  }

  const filtered = categoryFilter === "all" ? templates : templates.filter((t) => t.category === categoryFilter);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <button
          onClick={() => setShowNew(true)}
          className="px-4 h-10 rounded-lg bg-a-accent text-black text-sm font-medium hover:brightness-110 active:scale-[0.97]"
        >
          + Nueva plantilla
        </button>

        {/* Category filter */}
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${
              categoryFilter === "all" ? "bg-a-accent/15 text-a-accent" : "bg-card text-muted border border-border"
            }`}
          >
            Todas
          </button>
          {WORKOUT_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 ${
                categoryFilter === c.id ? "bg-a-accent/15 text-a-accent" : "bg-card text-muted border border-border"
              }`}
            >
              <span>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {showNew && <WorkoutTplEditor onSave={create} onCancel={() => setShowNew(false)} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.length === 0 && !showNew && (
          <p className="sm:col-span-2 text-sm text-muted text-center py-8">
            {categoryFilter === "all" ? "Sin plantillas. Crea la primera." : "Sin plantillas en esta categoria."}
          </p>
        )}
        {filtered.map((tpl) =>
          editing?.id === tpl.id ? (
            <div key={tpl.id} className="sm:col-span-2">
              <WorkoutTplEditor
                template={tpl}
                onSave={(data) => update(tpl.id, data)}
                onCancel={() => setEditing(null)}
              />
            </div>
          ) : (
            <div key={tpl.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-a-accent">
                      {WORKOUT_CATEGORIES.find((c) => c.id === tpl.category)?.icon || "📋"}
                    </span>
                    <h3 className="text-sm font-semibold">{tpl.name}</h3>
                  </div>
                  {tpl.description && <p className="text-xs text-muted mb-2">{tpl.description}</p>}
                  <p className="text-[0.7rem] text-muted">
                    {tpl.exercises.length} ejercicio{tpl.exercises.length !== 1 ? "s" : ""}
                    {tpl.weekDay !== null && ` · ${["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"][tpl.weekDay]}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditing(tpl)} className="px-3 h-9 rounded-lg text-xs text-muted hover:text-foreground hover:bg-card-hover active:scale-95">Editar</button>
                  <button onClick={() => remove(tpl.id)} className="h-9 w-9 rounded-lg text-muted hover:text-danger hover:bg-danger/10 active:scale-95 inline-flex items-center justify-center">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function WorkoutTplEditor({ template, onSave, onCancel }: { template?: WorkoutTemplate; onSave: (data: Partial<WorkoutTemplate>) => void; onCancel: () => void }) {
  const [name, setName] = useState(template?.name ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const [category, setCategory] = useState(template?.category ?? "general");
  const [weekDay, setWeekDay] = useState<number | null>(template?.weekDay ?? null);
  const [exercises, setExercises] = useState<Exercise[]>(template?.exercises ?? []);

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
        <div>
          <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Nombre</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Perdida de peso — Dia 1" className="w-full rounded-lg border border-border bg-a-surface px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Categoria</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-border bg-a-surface px-4 py-3 text-sm">
            {WORKOUT_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Descripcion</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-border bg-a-surface px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Dia sugerido</label>
          <select value={weekDay ?? ""} onChange={(e) => setWeekDay(e.target.value === "" ? null : Number(e.target.value))} className="w-full rounded-lg border border-border bg-a-surface px-4 py-3 text-sm">
            <option value="">General</option>
            <option value="1">Lunes</option><option value="2">Martes</option><option value="3">Miercoles</option>
            <option value="4">Jueves</option><option value="5">Viernes</option><option value="6">Sabado</option>
            <option value="0">Domingo</option>
          </select>
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
              <input value={ex.name} onChange={(e) => updateExercise(i, "name", e.target.value)} placeholder="Nombre" className="w-full rounded border border-border bg-a-surface px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input value={String(ex.sets ?? "")} onChange={(e) => updateExercise(i, "sets", e.target.value)} placeholder="Series" className="rounded border border-border bg-a-surface px-3 py-2 text-sm" />
                <input value={String(ex.reps ?? "")} onChange={(e) => updateExercise(i, "reps", e.target.value)} placeholder="Reps" className="rounded border border-border bg-a-surface px-3 py-2 text-sm" />
                <input value={ex.weight ?? ""} onChange={(e) => updateExercise(i, "weight", e.target.value)} placeholder="Peso" className="rounded border border-border bg-a-surface px-3 py-2 text-sm" />
                <input type="number" value={ex.restSec ?? ""} onChange={(e) => updateExercise(i, "restSec", Number(e.target.value))} placeholder="Descanso s" className="rounded border border-border bg-a-surface px-3 py-2 text-sm" />
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
          onClick={() => onSave({ name, description, category, weekDay, exercises })}
          disabled={!name}
          className="px-4 h-10 rounded-lg bg-a-accent text-black text-sm font-medium disabled:opacity-50"
        >
          Guardar
        </button>
        <button onClick={onCancel} className="px-4 h-10 rounded-lg text-sm text-muted hover:text-foreground">Cancelar</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Diet templates
   ═══════════════════════════════════════════════════ */

function DietTemplatesTab({ initial }: { initial: DietTemplate[] }) {
  const toast = useToast();
  const [templates, setTemplates] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  async function create(data: Partial<DietTemplate>) {
    const res = await fetch("/api/diet-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setTemplates([json.data, ...templates]);
      setShowNew(false);
      toast.success("Plantilla creada");
    } else {
      toast.error(json.error || "Error");
    }
  }

  async function update(id: string, data: Partial<DietTemplate>) {
    const res = await fetch(`/api/diet-templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setTemplates(templates.map((t) => (t.id === id ? json.data : t)));
      setEditingId(null);
      toast.success("Guardada");
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta plantilla?")) return;
    await fetch(`/api/diet-templates/${id}`, { method: "DELETE" });
    setTemplates(templates.filter((t) => t.id !== id));
    toast.success("Eliminada");
  }

  const filtered = categoryFilter === "all" ? templates : templates.filter((t) => t.category === categoryFilter);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <button onClick={() => setShowNew(true)} className="px-4 h-10 rounded-lg bg-a-accent text-black text-sm font-medium hover:brightness-110 active:scale-[0.97]">
          + Nueva plantilla
        </button>

        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${
              categoryFilter === "all" ? "bg-a-accent/15 text-a-accent" : "bg-card text-muted border border-border"
            }`}
          >Todas</button>
          {DIET_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 ${
                categoryFilter === c.id ? "bg-a-accent/15 text-a-accent" : "bg-card text-muted border border-border"
              }`}
            >
              <span>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {showNew && <DietTplEditor onSave={create} onCancel={() => setShowNew(false)} />}

      <div className="space-y-3">
        {filtered.length === 0 && !showNew && <p className="text-sm text-muted text-center py-8">Sin plantillas.</p>}
        {filtered.map((tpl) =>
          editingId === tpl.id ? (
            <DietTplEditor key={tpl.id} template={tpl} onSave={(d) => update(tpl.id, d)} onCancel={() => setEditingId(null)} />
          ) : (
            <div key={tpl.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{DIET_CATEGORIES.find((c) => c.id === tpl.category)?.icon || "📋"}</span>
                    <h3 className="text-sm font-semibold">{tpl.name}</h3>
                  </div>
                  {tpl.description && <p className="text-xs text-muted mb-2">{tpl.description}</p>}
                  <p className="text-[0.7rem] text-muted">{tpl.meals.length} comidas</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditingId(tpl.id)} className="px-3 h-9 rounded-lg text-xs text-muted hover:text-foreground hover:bg-card-hover">Editar</button>
                  <button onClick={() => remove(tpl.id)} className="h-9 w-9 rounded-lg text-muted hover:text-danger hover:bg-danger/10 inline-flex items-center justify-center">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function DietTplEditor({ template, onSave, onCancel }: { template?: DietTemplate; onSave: (data: Partial<DietTemplate>) => void; onCancel: () => void }) {
  const [name, setName] = useState(template?.name ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const [category, setCategory] = useState(template?.category ?? "general");
  const [notes, setNotes] = useState(template?.notes ?? "");
  const [meals, setMeals] = useState<Meal[]>(template?.meals ?? []);

  function save() {
    onSave({ name, description, category, notes, meals });
  }

  return (
    <div className="rounded-xl border border-a-accent/30 bg-card p-4 mb-3 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Nombre</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Definicion 2500 kcal" className="w-full rounded-lg border border-border bg-a-surface px-4 py-3 text-sm" />
        </div>
        <div>
          <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Categoria</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-border bg-a-surface px-4 py-3 text-sm">
            {DIET_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Descripcion</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-border bg-a-surface px-4 py-3 text-sm" />
      </div>

      <div>
        <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Comidas</label>
        <DietMealsEditor meals={meals} onChange={setMeals} />
      </div>

      <div>
        <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Notas</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-a-surface px-4 py-3 text-sm resize-none" placeholder="Ej: Hidratacion minima 2L al dia. Libre comida trampa los domingos..." />
      </div>

      <div className="flex gap-2 pt-2 border-t border-border">
        <button onClick={save} disabled={!name} className="px-4 h-10 rounded-lg bg-a-accent text-black text-sm font-medium disabled:opacity-50">Guardar</button>
        <button onClick={onCancel} className="px-4 h-10 rounded-lg text-sm text-muted">Cancelar</button>
      </div>
    </div>
  );
}
