"use client";

import { useState } from "react";
import { useToast } from "@/components/admin/ui/toast";
import { DietMealsEditor } from "@/components/admin/diet-meals-editor";
import { AIWorkoutModal, type GeneratedWorkout } from "@/components/admin/ai-workout-modal";

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

interface Ingredient {
  name: string;
  grams?: number;
  unit?: string;
  notes?: string;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  category: string;
  servings: number;
  prepTimeMin: number | null;
  cookTimeMin: number | null;
  allergens: string[];
  ingredients: Ingredient[];
  steps: string[];
  macros: { calories?: number; protein?: number; carbs?: number; fat?: number };
  aiGenerated: boolean;
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
  initialRecipes,
}: {
  initialWorkouts: WorkoutTemplate[];
  initialDiets: DietTemplate[];
  initialRecipes: Recipe[];
}) {
  const [tab, setTab] = useState<"workouts" | "diets" | "recipes">("workouts");

  return (
    <>
      <div className="flex gap-1 mb-5 border-b border-border overflow-x-auto">
        <button
          onClick={() => setTab("workouts")}
          className={`shrink-0 px-4 py-2.5 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 -mb-px ${
            tab === "workouts" ? "border-a-accent text-a-accent" : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Entrenamientos ({initialWorkouts.length})
        </button>
        <button
          onClick={() => setTab("diets")}
          className={`shrink-0 px-4 py-2.5 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 -mb-px ${
            tab === "diets" ? "border-a-accent text-a-accent" : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Dietas ({initialDiets.length})
        </button>
        <button
          onClick={() => setTab("recipes")}
          className={`shrink-0 px-4 py-2.5 text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 -mb-px ${
            tab === "recipes" ? "border-a-accent text-a-accent" : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Recetas ({initialRecipes.length})
        </button>
      </div>

      {tab === "workouts" && <WorkoutTemplatesTab initial={initialWorkouts} />}
      {tab === "diets" && <DietTemplatesTab initial={initialDiets} />}
      {tab === "recipes" && <RecipesTab initial={initialRecipes} />}
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
  const [showAI, setShowAI] = useState(false);
  const [aiDraft, setAiDraft] = useState<GeneratedWorkout | null>(null);

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
      <AIWorkoutModal
        open={showAI}
        onClose={() => setShowAI(false)}
        onGenerated={(w) => setAiDraft(w)}
      />

      {aiDraft && (
        <WorkoutTplEditor
          template={{
            id: "__ai_draft__",
            name: aiDraft.title,
            description: aiDraft.description,
            category: "general",
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

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowNew(true)}
            className="px-4 h-10 rounded-lg bg-a-accent text-black text-sm font-medium hover:brightness-110 active:scale-[0.97]"
          >
            + Nueva plantilla
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
        </div>

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

/* ═══════════════════════════════════════════════════
   Recipes tab (AI-powered)
   ═══════════════════════════════════════════════════ */

const RECIPE_CATEGORIES = [
  { id: "desayuno", label: "Desayuno", icon: "🥣" },
  { id: "comida", label: "Comida", icon: "🍽️" },
  { id: "cena", label: "Cena", icon: "🌙" },
  { id: "snack", label: "Snack", icon: "🍎" },
  { id: "general", label: "General", icon: "📋" },
];

const COMMON_ALLERGENS = [
  "Gluten", "Lactosa", "Frutos secos", "Huevo", "Pescado", "Marisco", "Soja", "Cacahuete", "Sesamo",
];

function RecipesTab({ initial }: { initial: Recipe[] }) {
  const toast = useToast();
  const [recipes, setRecipes] = useState(initial);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [showAIForm, setShowAIForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  async function create(data: Partial<Recipe>) {
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setRecipes([json.data, ...recipes]);
      setEditing(null);
      toast.success("Receta creada");
    } else {
      toast.error(json.error || "Error");
    }
  }

  async function update(id: string, data: Partial<Recipe>) {
    const res = await fetch(`/api/recipes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      setRecipes(recipes.map((r) => (r.id === id ? json.data : r)));
      setEditing(null);
      toast.success("Guardada");
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta receta?")) return;
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    setRecipes(recipes.filter((r) => r.id !== id));
    toast.success("Eliminada");
  }

  const filtered = categoryFilter === "all" ? recipes : recipes.filter((r) => r.category === categoryFilter);

  return (
    <div>
      {showAIForm && (
        <AIRecipeForm
          onGenerated={(data) => { create({ ...data, aiGenerated: true }); setShowAIForm(false); }}
          onCancel={() => setShowAIForm(false)}
        />
      )}

      {editing && (
        <RecipeEditor
          recipe={editing}
          onSave={(data) => editing.id === "__new__" ? create(data) : update(editing.id, data)}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setEditing({ id: "__new__", title: "", description: "", category: "general", servings: 1, prepTimeMin: null, cookTimeMin: null, allergens: [], ingredients: [], steps: [], macros: {}, aiGenerated: false })}
            className="px-4 h-10 rounded-lg bg-a-accent text-black text-sm font-medium hover:brightness-110 active:scale-[0.97]"
          >
            + Nueva receta
          </button>
          <button
            onClick={() => setShowAIForm(true)}
            className="px-4 h-10 rounded-lg border border-a-accent/30 bg-a-accent/5 text-a-accent text-sm font-medium hover:bg-a-accent/10 active:scale-[0.97] inline-flex items-center gap-1.5"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.091 3.09z" />
            </svg>
            Generar con IA
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${
              categoryFilter === "all" ? "bg-a-accent/15 text-a-accent" : "bg-card text-muted border border-border"
            }`}
          >Todas</button>
          {RECIPE_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 ${
                categoryFilter === c.id ? "bg-a-accent/15 text-a-accent" : "bg-card text-muted border border-border"
              }`}
            >
              <span>{c.icon}</span>{c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.length === 0 && !editing && !showAIForm && (
          <p className="sm:col-span-2 text-sm text-muted text-center py-8">
            Sin recetas todavia. Usa la IA o creala manualmente.
          </p>
        )}
        {filtered.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span>{RECIPE_CATEGORIES.find((c) => c.id === r.category)?.icon || "📋"}</span>
                  <h3 className="text-sm font-semibold">{r.title}</h3>
                  {r.aiGenerated && (
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.55rem] font-medium bg-a-accent/10 text-a-accent">
                      IA
                    </span>
                  )}
                </div>
                {r.description && <p className="text-xs text-muted mb-2 line-clamp-2">{r.description}</p>}
                <div className="flex items-center gap-2 flex-wrap text-[0.65rem] text-muted">
                  {r.servings > 0 && <span>{r.servings} raciones</span>}
                  {r.macros?.calories ? <span>{r.macros.calories} kcal</span> : null}
                  {(r.prepTimeMin || r.cookTimeMin) ? <span>{(r.prepTimeMin || 0) + (r.cookTimeMin || 0)} min</span> : null}
                  {r.allergens.length > 0 && <span className="text-warning">{r.allergens.slice(0, 2).join(", ")}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setEditing(r)} className="px-3 h-9 rounded-lg text-xs text-muted hover:text-foreground hover:bg-card-hover active:scale-95">Ver / Editar</button>
                <button onClick={() => remove(r.id)} className="h-9 w-9 rounded-lg text-muted hover:text-danger hover:bg-danger/10 inline-flex items-center justify-center">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9M5 6h14m-2 0V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v1M5 6l1 14a2 2 0 002 2h8a2 2 0 002-2l1-14" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIRecipeForm({ onGenerated, onCancel }: { onGenerated: (r: Partial<Recipe>) => void; onCancel: () => void }) {
  const toast = useToast();
  const [dishName, setDishName] = useState("");
  const [category, setCategory] = useState("comida");
  const [allergens, setAllergens] = useState<string[]>([]);
  const [customAllergen, setCustomAllergen] = useState("");
  const [targetCalories, setTargetCalories] = useState("");
  const [targetProtein, setTargetProtein] = useState("");
  const [goal, setGoal] = useState("alta proteina, equilibrada");
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleAllergen(a: string) {
    setAllergens((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  async function generate() {
    setLoading(true);
    try {
      const all = [...allergens];
      if (customAllergen.trim()) all.push(customAllergen.trim());

      const res = await fetch("/api/ai/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dishName: dishName.trim() || undefined,
          goal: goal.trim() || undefined,
          allergens: all,
          targetCalories: targetCalories ? Number(targetCalories) : undefined,
          targetProtein: targetProtein ? Number(targetProtein) : undefined,
          preferences: preferences.trim() || undefined,
          category,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Error al generar");
        return;
      }
      onGenerated(json.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-a-accent/30 bg-card p-4 mb-3 space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-a-accent/15">
          <svg className="h-4 w-4 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.091 3.09z" />
          </svg>
        </span>
        <h3 className="text-sm font-semibold">Generar receta con IA</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Nombre del plato (opcional)</label>
          <input value={dishName} onChange={(e) => setDishName(e.target.value)} placeholder="Ej: Pollo con arroz, boniato al horno..." className="w-full rounded-lg border border-border bg-a-surface px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Tipo de comida</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-border bg-a-surface px-3 py-2.5 text-sm">
            {RECIPE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Objetivo nutricional</label>
        <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Ej: alta proteina, baja en carbos, cetogenica..." className="w-full rounded-lg border border-border bg-a-surface px-3 py-2.5 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Calorias objetivo</label>
          <input type="number" value={targetCalories} onChange={(e) => setTargetCalories(e.target.value)} placeholder="500" className="w-full rounded-lg border border-border bg-a-surface px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Proteina min (g)</label>
          <input type="number" value={targetProtein} onChange={(e) => setTargetProtein(e.target.value)} placeholder="40" className="w-full rounded-lg border border-border bg-a-surface px-3 py-2.5 text-sm" />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">
          Alergenos a evitar
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {COMMON_ALLERGENS.map((a) => (
            <button
              key={a}
              onClick={() => toggleAllergen(a)}
              className={`px-2.5 h-8 rounded-md text-[0.7rem] font-medium transition-all ${
                allergens.includes(a) ? "bg-warning/15 text-warning border border-warning/30" : "bg-card border border-border text-muted"
              }`}
            >
              {allergens.includes(a) && "si "}{a}
            </button>
          ))}
        </div>
        <input value={customAllergen} onChange={(e) => setCustomAllergen(e.target.value)} placeholder="Otro alergeno..." className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-xs" />
      </div>

      <div>
        <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Preferencias</label>
        <textarea value={preferences} onChange={(e) => setPreferences(e.target.value)} rows={2} placeholder="Vegetariana, sin cocinar, tiempo max 20 min, etc..." className="w-full rounded-lg border border-border bg-a-surface px-3 py-2.5 text-sm resize-none" />
      </div>

      <div className="flex gap-2 pt-2 border-t border-border">
        <button onClick={generate} disabled={loading} className="px-5 h-10 rounded-lg bg-a-accent text-black text-sm font-medium disabled:opacity-50 inline-flex items-center gap-2">
          {loading ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3l3-3-3-3v3a9 9 0 100 18 9 9 0 009-9h-3a6 6 0 11-12 0z" />
              </svg>
              Generando...
            </>
          ) : "Generar receta"}
        </button>
        <button onClick={onCancel} className="px-4 h-10 rounded-lg text-sm text-muted">Cancelar</button>
      </div>
    </div>
  );
}

function RecipeEditor({ recipe, onSave, onCancel }: { recipe: Recipe; onSave: (data: Partial<Recipe>) => void; onCancel: () => void }) {
  const [title, setTitle] = useState(recipe.title);
  const [description, setDescription] = useState(recipe.description);
  const [category, setCategory] = useState(recipe.category);
  const [servings, setServings] = useState(recipe.servings);
  const [prepTimeMin, setPrepTimeMin] = useState<string>(recipe.prepTimeMin?.toString() ?? "");
  const [cookTimeMin, setCookTimeMin] = useState<string>(recipe.cookTimeMin?.toString() ?? "");
  const [allergens, setAllergens] = useState<string[]>(recipe.allergens);
  const [ingredients, setIngredients] = useState<Ingredient[]>(recipe.ingredients);
  const [steps, setSteps] = useState<string[]>(recipe.steps);
  const [macros, setMacros] = useState(recipe.macros);

  return (
    <div className="rounded-xl border border-a-accent/30 bg-card p-4 mb-3 space-y-4">
      <h3 className="text-sm font-semibold">{recipe.id === "__new__" ? "Nueva receta" : "Editar receta"}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Titulo</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-border bg-a-surface px-3 py-2.5 text-sm" />
        </div>
        <div>
          <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Categoria</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-border bg-a-surface px-3 py-2.5 text-sm">
            {RECIPE_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Descripcion</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-lg border border-border bg-a-surface px-3 py-2.5 text-sm resize-none" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-1.5">Raciones</label>
          <input type="number" min="1" value={servings} onChange={(e) => setServings(Number(e.target.value) || 1)} className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-1.5">Prep (min)</label>
          <input type="number" value={prepTimeMin} onChange={(e) => setPrepTimeMin(e.target.value)} className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-1.5">Coccion (min)</label>
          <input type="number" value={cookTimeMin} onChange={(e) => setCookTimeMin(e.target.value)} className="w-full rounded-lg border border-border bg-a-surface px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Macros por racion</label>
        <div className="grid grid-cols-4 gap-2">
          {(["calories", "protein", "carbs", "fat"] as const).map((k) => (
            <div key={k}>
              <input
                type="number"
                step="any"
                value={macros[k] ?? ""}
                onChange={(e) => setMacros({ ...macros, [k]: e.target.value === "" ? undefined : Number(e.target.value) })}
                placeholder={k === "calories" ? "kcal" : "g"}
                className="w-full rounded-md border border-border bg-a-surface px-2 py-2 text-sm font-mono"
              />
              <p className="text-[0.55rem] uppercase tracking-widest text-muted mt-1 text-center">
                {k === "calories" ? "kcal" : k === "protein" ? "P" : k === "carbs" ? "C" : "G"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2">Alergenos (separados por coma)</label>
        <input
          value={allergens.join(", ")}
          onChange={(e) => setAllergens(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
          placeholder="Gluten, lactosa..."
          className="w-full rounded-lg border border-border bg-a-surface px-3 py-2.5 text-sm"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">Ingredientes</label>
          <button onClick={() => setIngredients([...ingredients, { name: "", grams: undefined }])} className="text-xs text-a-accent hover:underline">+ Anadir</button>
        </div>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={ing.name}
                onChange={(e) => { const n = [...ingredients]; n[i] = { ...n[i], name: e.target.value }; setIngredients(n); }}
                placeholder="Nombre"
                className="flex-1 rounded-md border border-border bg-a-surface px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={ing.grams ?? ""}
                onChange={(e) => { const n = [...ingredients]; n[i] = { ...n[i], grams: e.target.value ? Number(e.target.value) : undefined }; setIngredients(n); }}
                placeholder="gramos"
                className="w-24 rounded-md border border-border bg-a-surface px-3 py-2 text-sm font-mono"
              />
              <input
                value={ing.notes ?? ""}
                onChange={(e) => { const n = [...ingredients]; n[i] = { ...n[i], notes: e.target.value }; setIngredients(n); }}
                placeholder="Notas"
                className="w-32 rounded-md border border-border bg-a-surface px-3 py-2 text-sm"
              />
              <button onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))} className="w-9 h-9 text-muted hover:text-danger">x</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">Pasos de preparacion</label>
          <button onClick={() => setSteps([...steps, ""])} className="text-xs text-a-accent hover:underline">+ Anadir paso</button>
        </div>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2">
              <span className="shrink-0 w-8 h-9 rounded-md bg-a-accent/10 text-a-accent text-xs font-bold flex items-center justify-center mt-0">
                {i + 1}
              </span>
              <textarea
                value={step}
                onChange={(e) => { const n = [...steps]; n[i] = e.target.value; setSteps(n); }}
                rows={2}
                className="flex-1 rounded-md border border-border bg-a-surface px-3 py-2 text-sm resize-none"
                placeholder="Describe este paso..."
              />
              <button onClick={() => setSteps(steps.filter((_, idx) => idx !== i))} className="w-9 h-9 text-muted hover:text-danger shrink-0">x</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-border">
        <button
          onClick={() => onSave({
            title, description, category, servings,
            prepTimeMin: prepTimeMin ? Number(prepTimeMin) : null,
            cookTimeMin: cookTimeMin ? Number(cookTimeMin) : null,
            allergens, ingredients, steps, macros,
          })}
          disabled={!title}
          className="px-4 h-10 rounded-lg bg-a-accent text-black text-sm font-medium disabled:opacity-50"
        >
          Guardar
        </button>
        <button onClick={onCancel} className="px-4 h-10 rounded-lg text-sm text-muted">Cancelar</button>
      </div>
    </div>
  );
}
