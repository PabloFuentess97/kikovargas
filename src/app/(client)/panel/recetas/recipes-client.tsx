"use client";

import { useState, useMemo } from "react";
import { RecipeCard, type RecipeCardData } from "@/components/recipe-card";

const CATEGORIES = [
  { id: "all",      label: "Todas",    icon: "📚" },
  { id: "desayuno", label: "Desayuno", icon: "🥣" },
  { id: "comida",   label: "Comida",   icon: "🍽️" },
  { id: "cena",     label: "Cena",     icon: "🌙" },
  { id: "snack",    label: "Snack",    icon: "🍎" },
  { id: "general",  label: "General",  icon: "📋" },
];

export function RecipesClient({ recipes }: { recipes: RecipeCardData[] }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (query.trim() && !r.title.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [recipes, category, query]);

  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-a-accent/10">
          <svg className="h-7 w-7 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Sin recetas asignadas</h3>
        <p className="text-sm text-muted max-w-xs">Kiko te irá asignando recetas adaptadas a tu plan.</p>
      </div>
    );
  }

  const openRecipe = openId ? recipes.find((r) => r.id === openId) : null;

  return (
    <div>
      {/* Search + filters */}
      <div className="mb-5 space-y-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar receta..."
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-a-accent focus:outline-none"
        />
        <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                category === c.id ? "bg-a-accent text-black" : "bg-card text-muted border border-border hover:border-a-accent/40"
              }`}
            >
              <span>{c.icon}</span>{c.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">Ninguna receta coincide con el filtro.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => setOpenId(r.id)}
              className="text-left active:scale-[0.99] transition-transform"
            >
              <RecipeCard recipe={r} compact />
            </button>
          ))}
        </div>
      )}

      {openRecipe && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
          <div className="bg-background border-t sm:border border-border sm:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted">Receta</p>
              <button
                onClick={() => setOpenId(null)}
                className="h-9 w-9 rounded-full text-muted hover:text-foreground active:bg-card-hover active:scale-90 inline-flex items-center justify-center"
                aria-label="Cerrar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <RecipeCard recipe={openRecipe} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
