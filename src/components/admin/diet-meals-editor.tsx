"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════
   Visual meals editor — no JSON, no code
   ═══════════════════════════════════════════════════ */

export interface Food {
  name: string;
  grams?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface Meal {
  name: string;
  time?: string;
  foods: Food[];
}

interface Props {
  meals: Meal[];
  onChange: (meals: Meal[]) => void;
}

const QUICK_MEALS: { name: string; time: string; icon: string }[] = [
  { name: "Desayuno", time: "08:00", icon: "🥣" },
  { name: "Media manana", time: "11:00", icon: "🍎" },
  { name: "Comida", time: "14:00", icon: "🍽️" },
  { name: "Merienda", time: "17:30", icon: "☕" },
  { name: "Cena", time: "21:00", icon: "🌙" },
  { name: "Pre-entreno", time: "18:00", icon: "⚡" },
  { name: "Post-entreno", time: "20:00", icon: "💪" },
];

/** Mini base de alimentos comunes para auto-completar (solo sugerencia) */
const COMMON_FOODS: Food[] = [
  { name: "Pollo a la plancha", grams: 150, calories: 248, protein: 46, carbs: 0, fat: 5 },
  { name: "Arroz blanco cocido", grams: 100, calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: "Arroz integral cocido", grams: 100, calories: 112, protein: 2.6, carbs: 23, fat: 0.9 },
  { name: "Avena copos", grams: 60, calories: 234, protein: 10, carbs: 40, fat: 4 },
  { name: "Huevo entero", grams: 60, calories: 93, protein: 7.5, carbs: 0.7, fat: 6.6 },
  { name: "Clara de huevo", grams: 33, calories: 17, protein: 3.6, carbs: 0.2, fat: 0 },
  { name: "Boniato cocido", grams: 150, calories: 129, protein: 2, carbs: 30, fat: 0.2 },
  { name: "Patata cocida", grams: 150, calories: 130, protein: 2.6, carbs: 30, fat: 0.2 },
  { name: "Brocoli cocido", grams: 150, calories: 51, protein: 4.3, carbs: 10, fat: 0.6 },
  { name: "Manzana", grams: 150, calories: 78, protein: 0.4, carbs: 21, fat: 0.3 },
  { name: "Platano", grams: 120, calories: 107, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: "Atun al natural", grams: 100, calories: 116, protein: 26, carbs: 0, fat: 1 },
  { name: "Salmon", grams: 150, calories: 312, protein: 30, carbs: 0, fat: 21 },
  { name: "Pasta cocida", grams: 100, calories: 158, protein: 5.8, carbs: 31, fat: 0.9 },
  { name: "Pan integral", grams: 60, calories: 150, protein: 7, carbs: 25, fat: 2 },
  { name: "Almendras", grams: 30, calories: 174, protein: 6.4, carbs: 6, fat: 15 },
  { name: "Aceite oliva virgen extra", grams: 10, calories: 90, protein: 0, carbs: 0, fat: 10 },
  { name: "Queso fresco batido 0%", grams: 200, calories: 90, protein: 16, carbs: 6, fat: 0 },
  { name: "Yogur griego 0%", grams: 150, calories: 87, protein: 15, carbs: 6, fat: 0.6 },
  { name: "Bebida vegetal almendras", grams: 200, calories: 40, protein: 1, carbs: 1, fat: 3 },
  { name: "Proteina whey (1 scoop)", grams: 30, calories: 120, protein: 24, carbs: 3, fat: 1.5 },
];

/* ═══════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════ */

export function DietMealsEditor({ meals, onChange }: Props) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  function addMeal(seed?: { name: string; time: string }) {
    onChange([
      ...meals,
      seed
        ? { name: seed.name, time: seed.time, foods: [] }
        : { name: "Nueva comida", time: "", foods: [] },
    ]);
    setQuickAddOpen(false);
  }

  function updateMeal(index: number, patch: Partial<Meal>) {
    const next = [...meals];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function removeMeal(index: number) {
    onChange(meals.filter((_, i) => i !== index));
  }

  function moveMeal(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= meals.length) return;
    const next = [...meals];
    [next[index], next[newIndex]] = [next[newIndex], next[index]];
    onChange(next);
  }

  function duplicateMeal(index: number) {
    const copy = { ...meals[index], name: `${meals[index].name} (copia)`, foods: [...meals[index].foods] };
    const next = [...meals];
    next.splice(index + 1, 0, copy);
    onChange(next);
  }

  // Daily totals
  const totals = meals.reduce(
    (acc, meal) => {
      for (const food of meal.foods) {
        acc.calories += food.calories ?? 0;
        acc.protein += food.protein ?? 0;
        acc.carbs += food.carbs ?? 0;
        acc.fat += food.fat ?? 0;
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <div className="space-y-3">
      {/* Daily totals badge (at top, sticky feeling) */}
      {meals.length > 0 && (
        <div className="rounded-xl border border-a-accent/20 bg-a-accent/5 px-4 py-3">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-a-accent mb-2">
            Total diario
          </p>
          <div className="grid grid-cols-4 gap-2">
            <Macro label="kcal" value={totals.calories} accent />
            <Macro label="proteína" value={totals.protein} unit="g" />
            <Macro label="carbs" value={totals.carbs} unit="g" />
            <Macro label="grasa" value={totals.fat} unit="g" />
          </div>
        </div>
      )}

      {/* Meals list */}
      {meals.map((meal, i) => (
        <MealCard
          key={i}
          meal={meal}
          isFirst={i === 0}
          isLast={i === meals.length - 1}
          onUpdate={(patch) => updateMeal(i, patch)}
          onRemove={() => removeMeal(i)}
          onMoveUp={() => moveMeal(i, -1)}
          onMoveDown={() => moveMeal(i, 1)}
          onDuplicate={() => duplicateMeal(i)}
        />
      ))}

      {/* Add meal */}
      {quickAddOpen ? (
        <div className="rounded-xl border border-a-accent/30 bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted">
              Elige el tipo de comida
            </p>
            <button
              onClick={() => setQuickAddOpen(false)}
              className="text-xs text-muted hover:text-foreground"
            >
              Cerrar
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {QUICK_MEALS.map((m) => (
              <button
                key={m.name}
                onClick={() => addMeal(m)}
                className="flex items-center gap-2 px-3 h-11 rounded-lg border border-border bg-background hover:border-a-accent/40 hover:bg-a-accent/5 active:scale-[0.98] transition-all text-left"
              >
                <span className="text-base">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{m.name}</p>
                  <p className="text-[0.6rem] text-muted">{m.time}</p>
                </div>
              </button>
            ))}
            <button
              onClick={() => addMeal()}
              className="flex items-center justify-center gap-1.5 px-3 h-11 rounded-lg border border-dashed border-border hover:border-a-accent/40 active:scale-[0.98] transition-all text-xs text-muted hover:text-a-accent"
            >
              <span>+</span> Personalizada
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setQuickAddOpen(true)}
          className="w-full rounded-xl border-2 border-dashed border-border hover:border-a-accent/40 bg-card/50 py-4 text-sm text-muted hover:text-a-accent transition-all active:scale-[0.99]"
        >
          + Añadir comida
        </button>
      )}
    </div>
  );
}

/* ─── Meal card ──────────────────────────────────── */

function MealCard({
  meal,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDuplicate,
}: {
  meal: Meal;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (patch: Partial<Meal>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  function addFood(food?: Food) {
    onUpdate({
      foods: [
        ...meal.foods,
        food ?? { name: "", grams: undefined, calories: undefined, protein: undefined, carbs: undefined, fat: undefined },
      ],
    });
  }

  function updateFood(i: number, patch: Partial<Food>) {
    const next = [...meal.foods];
    next[i] = { ...next[i], ...patch };
    onUpdate({ foods: next });
  }

  function removeFood(i: number) {
    onUpdate({ foods: meal.foods.filter((_, idx) => idx !== i) });
  }

  // Meal-level totals
  const totals = meal.foods.reduce(
    (acc, food) => {
      acc.calories += food.calories ?? 0;
      acc.protein += food.protein ?? 0;
      acc.carbs += food.carbs ?? 0;
      acc.fat += food.fat ?? 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-background/30">
        <input
          value={meal.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Nombre de la comida"
          className="flex-1 min-w-0 bg-transparent border-0 text-sm font-semibold focus:outline-none focus:ring-0 text-foreground placeholder:text-muted"
        />
        <input
          type="time"
          value={meal.time ?? ""}
          onChange={(e) => onUpdate({ time: e.target.value })}
          className="w-[88px] shrink-0 rounded-md border border-border bg-a-surface px-2 py-1.5 text-xs text-a-accent font-mono focus:outline-none focus:border-a-accent"
        />

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="h-8 w-8 rounded-md text-muted hover:text-foreground hover:bg-card-hover active:scale-90 disabled:opacity-20 disabled:pointer-events-none inline-flex items-center justify-center"
            title="Subir"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="h-8 w-8 rounded-md text-muted hover:text-foreground hover:bg-card-hover active:scale-90 disabled:opacity-20 disabled:pointer-events-none inline-flex items-center justify-center"
            title="Bajar"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={onDuplicate}
            className="h-8 w-8 rounded-md text-muted hover:text-foreground hover:bg-card-hover active:scale-90 inline-flex items-center justify-center"
            title="Duplicar"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 rounded-md text-muted hover:text-foreground hover:bg-card-hover active:scale-90 inline-flex items-center justify-center"
            title={collapsed ? "Mostrar" : "Ocultar"}
          >
            <svg className={`h-4 w-4 transition-transform ${collapsed ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={onRemove}
            className="h-8 w-8 rounded-md text-muted hover:text-danger hover:bg-danger/10 active:scale-90 inline-flex items-center justify-center"
            title="Eliminar comida"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <>
          {/* Foods list */}
          <div className="p-3 space-y-2">
            {meal.foods.length === 0 && (
              <p className="text-center text-xs text-muted py-4">
                Sin alimentos todavia. Anade uno abajo.
              </p>
            )}

            {meal.foods.map((food, i) => (
              <FoodRow
                key={i}
                food={food}
                onUpdate={(patch) => updateFood(i, patch)}
                onRemove={() => removeFood(i)}
              />
            ))}

            <FoodPicker onAdd={addFood} />
          </div>

          {/* Meal total */}
          {meal.foods.length > 0 && (
            <div className="px-4 py-2 bg-background/50 border-t border-border grid grid-cols-4 gap-2">
              <MiniMacro label="kcal" value={totals.calories} accent />
              <MiniMacro label="P" value={totals.protein} unit="g" />
              <MiniMacro label="C" value={totals.carbs} unit="g" />
              <MiniMacro label="G" value={totals.fat} unit="g" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Food row ───────────────────────────────────── */

function FoodRow({
  food,
  onUpdate,
  onRemove,
}: {
  food: Food;
  onUpdate: (patch: Partial<Food>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <input
          value={food.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Ej: Pollo a la plancha"
          className="flex-1 bg-a-surface rounded border border-border px-3 py-1.5 text-sm focus:outline-none focus:border-a-accent"
        />
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[0.65rem] text-muted">gramos</span>
          <input
            type="number"
            step="any"
            value={food.grams ?? ""}
            onChange={(e) => onUpdate({ grams: e.target.value === "" ? undefined : Number(e.target.value) })}
            placeholder="—"
            className="w-16 bg-a-surface rounded border border-border px-2 py-1.5 text-sm font-mono text-right focus:outline-none focus:border-a-accent"
          />
        </div>
        <button
          onClick={onRemove}
          className="h-8 w-8 shrink-0 rounded-md text-muted hover:text-danger hover:bg-danger/10 active:scale-90 inline-flex items-center justify-center"
          title="Eliminar alimento"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        <MacroInput label="kcal" value={food.calories} onChange={(v) => onUpdate({ calories: v })} accent />
        <MacroInput label="P" value={food.protein} onChange={(v) => onUpdate({ protein: v })} />
        <MacroInput label="C" value={food.carbs} onChange={(v) => onUpdate({ carbs: v })} />
        <MacroInput label="G" value={food.fat} onChange={(v) => onUpdate({ fat: v })} />
      </div>
    </div>
  );
}

function MacroInput({
  label,
  value,
  onChange,
  accent,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-md border ${accent ? "border-a-accent/20 bg-a-accent/5" : "border-border bg-a-surface"} px-2 py-1 focus-within:border-a-accent`}>
      <div className={`text-[0.55rem] font-semibold uppercase tracking-widest ${accent ? "text-a-accent" : "text-muted"}`}>
        {label}
      </div>
      <input
        type="number"
        step="any"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        placeholder="0"
        className="w-full bg-transparent border-0 text-sm font-mono font-semibold focus:outline-none focus:ring-0 p-0"
      />
    </div>
  );
}

/* ─── Food picker (add from common or custom) ────── */

function FoodPicker({ onAdd }: { onAdd: (food?: Food) => void }) {
  const [mode, setMode] = useState<"closed" | "suggest">("closed");
  const [q, setQ] = useState("");
  const [aiGrams, setAiGrams] = useState<number>(100);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const filtered = q
    ? COMMON_FOODS.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    : COMMON_FOODS.slice(0, 8);

  async function askAI() {
    if (!q.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch("/api/ai/food-nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: q.trim(), grams: aiGrams }),
      });
      const json = await res.json();

      if (!json.success) {
        setAiError(json.error || "No se pudo obtener la informacion");
        return;
      }

      if (json.data.empty) {
        setAiError(json.data.notes || "La IA no reconoce ese alimento. Prueba con otro nombre.");
        return;
      }

      // Add with macros from AI
      onAdd({
        name: json.data.name,
        grams: json.data.grams,
        calories: json.data.calories,
        protein: json.data.protein,
        carbs: json.data.carbs,
        fat: json.data.fat,
      });

      // Reset and close
      setMode("closed");
      setQ("");
      setAiGrams(100);
    } catch {
      setAiError("Error de red. Intenta de nuevo.");
    } finally {
      setAiLoading(false);
    }
  }

  if (mode === "closed") {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setMode("suggest")}
          className="flex-1 rounded-lg border border-border bg-background hover:border-a-accent/40 py-2 text-xs text-muted hover:text-a-accent transition-all active:scale-[0.98] inline-flex items-center justify-center gap-1.5"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          Buscar alimento
        </button>
        <button
          onClick={() => onAdd()}
          className="px-3 rounded-lg border border-dashed border-border bg-background hover:border-a-accent/40 py-2 text-xs text-muted hover:text-a-accent transition-all active:scale-[0.98]"
        >
          + Custom
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-a-accent/30 bg-a-accent/5 p-2.5">
      <div className="flex items-center gap-2 mb-2">
        <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          autoFocus
          value={q}
          onChange={(e) => { setQ(e.target.value); setAiError(null); }}
          onKeyDown={(e) => { if (e.key === "Enter" && q.trim() && filtered.length === 0) askAI(); }}
          placeholder="Buscar alimento..."
          className="flex-1 bg-transparent border-0 text-sm focus:outline-none placeholder:text-muted"
        />
        <button
          onClick={() => { setMode("closed"); setQ(""); setAiError(null); }}
          className="text-xs text-muted hover:text-foreground"
        >
          Cerrar
        </button>
      </div>

      <div className="space-y-1 max-h-56 overflow-y-auto">
        {filtered.map((food, i) => (
          <button
            key={i}
            onClick={() => { onAdd(food); setMode("closed"); setQ(""); }}
            className="w-full text-left rounded-md bg-background/50 px-3 py-2 hover:bg-background active:scale-[0.99] transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{food.name}</span>
              <span className="text-[0.65rem] text-muted shrink-0">{food.grams}g · {food.calories} kcal</span>
            </div>
            <p className="text-[0.6rem] text-muted/70 mt-0.5">
              P {food.protein}g · C {food.carbs}g · G {food.fat}g
            </p>
          </button>
        ))}
      </div>

      {/* AI block — only when user has typed something */}
      {q.trim().length >= 2 && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-a-accent/15">
              <svg className="h-3 w-3 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.091 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            </span>
            <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-a-accent">
              ¿No lo encuentras?
            </p>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 min-w-0 rounded-md bg-background/70 border border-border px-3 py-1.5 text-xs text-muted truncate">
              <span className="text-foreground font-medium">{q}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number"
                value={aiGrams}
                onChange={(e) => setAiGrams(Math.max(1, Number(e.target.value) || 100))}
                min={1}
                max={5000}
                className="w-16 rounded-md bg-background border border-border px-2 py-1.5 text-xs font-mono text-right focus:outline-none focus:border-a-accent"
              />
              <span className="text-[0.65rem] text-muted">g</span>
            </div>
          </div>

          <button
            onClick={askAI}
            disabled={aiLoading}
            className="w-full rounded-md bg-a-accent/10 hover:bg-a-accent/20 border border-a-accent/30 py-2 text-xs font-medium text-a-accent transition-all active:scale-[0.98] disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {aiLoading ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v3l3-3-3-3v3a9 9 0 100 18 9 9 0 009-9h-3a6 6 0 11-12 0z" />
                </svg>
                Consultando IA...
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.091 3.09z" />
                </svg>
                Calcular macros con IA
              </>
            )}
          </button>

          {aiError && (
            <p className="mt-2 text-[0.65rem] text-danger text-center">{aiError}</p>
          )}

          <button
            onClick={() => { onAdd({ name: q.trim(), grams: aiGrams, calories: undefined, protein: undefined, carbs: undefined, fat: undefined }); setMode("closed"); setQ(""); }}
            className="w-full text-center rounded-md px-3 py-1.5 mt-1 text-[0.65rem] text-muted hover:text-foreground"
          >
            O añadir sin macros (los rellenas tú)
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Macro displays ─────────────────────────────── */

/**
 * Format a macro number:
 * - rounds to max 2 decimals (avoids float-precision noise like 167.70000000003)
 * - strips trailing zeros ("168" instead of "168.00", "167.7" instead of "167.70")
 * - locale-friendly thousands separator (Spanish uses dot)
 */
export function formatMacro(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const rounded = Math.round(n * 100) / 100;
  // Using toFixed then trimming zeros gives us predictable output
  const s = rounded.toFixed(2);
  return s.replace(/\.?0+$/, "");
}

function Macro({ label, value, unit, accent }: { label: string; value: number; unit?: string; accent?: boolean }) {
  return (
    <div className="text-center rounded-lg bg-background/50 px-2 py-2">
      <p className={`text-base font-bold ${accent ? "text-a-accent" : "text-foreground"}`}>
        {formatMacro(value)}{unit ?? ""}
      </p>
      <p className="text-[0.55rem] uppercase tracking-widest text-muted">{label}</p>
    </div>
  );
}

function MiniMacro({ label, value, unit, accent }: { label: string; value: number; unit?: string; accent?: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-xs font-bold ${accent ? "text-a-accent" : "text-foreground"}`}>
        {formatMacro(value)}{unit ?? ""}
      </p>
      <p className="text-[0.5rem] uppercase tracking-widest text-muted">{label}</p>
    </div>
  );
}
