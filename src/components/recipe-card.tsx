"use client";

/**
 * Read-only recipe card used by both admin and client panel.
 * Kiko edits recipes in /dashboard/templates — this just renders them.
 */

export interface RecipeIngredient {
  name: string;
  grams?: number;
  unit?: string;
  notes?: string;
}

export interface RecipeCardData {
  id: string;
  title: string;
  description: string;
  category: string;
  servings: number;
  prepTimeMin: number | null;
  cookTimeMin: number | null;
  allergens: string[];
  ingredients: RecipeIngredient[];
  steps: string[];
  macros: { calories?: number; protein?: number; carbs?: number; fat?: number };
  aiGenerated?: boolean;
}

const RECIPE_CATEGORIES: Record<string, { label: string; icon: string }> = {
  desayuno:   { label: "Desayuno", icon: "🥣" },
  comida:     { label: "Comida",   icon: "🍽️" },
  cena:       { label: "Cena",     icon: "🌙" },
  snack:      { label: "Snack",    icon: "🍎" },
  general:    { label: "General",  icon: "📋" },
};

export function categoryMeta(id: string) {
  return RECIPE_CATEGORIES[id] ?? RECIPE_CATEGORIES.general;
}

function fmt(n: number | undefined | null): string {
  if (n === undefined || n === null) return "—";
  return Number.isFinite(n) ? Math.round(n).toString() : "—";
}

export function RecipeCard({ recipe, compact = false }: { recipe: RecipeCardData; compact?: boolean }) {
  const cat = categoryMeta(recipe.category);
  const totalMin = (recipe.prepTimeMin ?? 0) + (recipe.cookTimeMin ?? 0);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-border">
        <div className="flex items-start gap-2 flex-wrap mb-1">
          <span className="text-lg" aria-hidden>{cat.icon}</span>
          <h3 className="text-base font-semibold flex-1 min-w-0">{recipe.title}</h3>
          {recipe.aiGenerated && (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.55rem] font-medium bg-a-accent/10 text-a-accent">
              IA
            </span>
          )}
        </div>

        {recipe.description && !compact && (
          <p className="text-xs text-muted leading-relaxed mb-3">{recipe.description}</p>
        )}

        <div className="flex items-center gap-3 flex-wrap text-[0.7rem] text-muted">
          <span>{cat.label}</span>
          {recipe.servings > 0 && <span>· {recipe.servings} raciones</span>}
          {totalMin > 0 && <span>· {totalMin} min</span>}
        </div>

        {/* Macros row (per serving) */}
        {(recipe.macros.calories || recipe.macros.protein || recipe.macros.carbs || recipe.macros.fat) && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            <MacroCell label="kcal" value={fmt(recipe.macros.calories)} />
            <MacroCell label="prot" value={`${fmt(recipe.macros.protein)}g`} />
            <MacroCell label="carb" value={`${fmt(recipe.macros.carbs)}g`} />
            <MacroCell label="gras" value={`${fmt(recipe.macros.fat)}g`} />
          </div>
        )}

        {recipe.allergens.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mt-3">
            {recipe.allergens.map((a) => (
              <span key={a} className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-medium bg-warning/10 text-warning">
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {!compact && (
        <>
          {recipe.ingredients.length > 0 && (
            <div className="p-4 sm:p-5 border-b border-border">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted mb-2">
                Ingredientes
              </p>
              <ul className="space-y-1">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="text-sm text-foreground flex items-baseline gap-2">
                    <span className="shrink-0 text-muted">·</span>
                    <span className="flex-1">
                      {ing.name}
                      {(ing.grams || ing.unit) && (
                        <span className="text-muted">
                          {" — "}
                          {ing.grams ? `${ing.grams} g` : ""}
                          {ing.grams && ing.unit ? " / " : ""}
                          {ing.unit ?? ""}
                        </span>
                      )}
                      {ing.notes && <span className="text-muted text-xs block">{ing.notes}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recipe.steps.length > 0 && (
            <div className="p-4 sm:p-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted mb-2">
                Preparación
              </p>
              <ol className="space-y-2">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="text-sm text-foreground flex gap-2">
                    <span className="shrink-0 inline-flex h-5 w-5 rounded-full bg-a-accent/15 text-a-accent text-[0.65rem] font-semibold items-center justify-center">
                      {i + 1}
                    </span>
                    <span className="flex-1 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MacroCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-2 py-1.5 text-center">
      <p className="text-sm font-semibold text-foreground">{value}</p>
      <p className="text-[0.55rem] uppercase tracking-wider text-muted">{label}</p>
    </div>
  );
}
