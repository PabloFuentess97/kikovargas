import { requireClientArea } from "@/lib/auth/client-access";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

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

export default async function ClientDietPage() {
  const { session } = await requireClientArea("diet");

  const [activeDiet, historyDiets] = await Promise.all([
    prisma.diet.findFirst({
      where: { clientId: session.sub, active: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.diet.findMany({
      where: { clientId: session.sub, active: false },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  if (!activeDiet && historyDiets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-a-accent/10">
          <svg className="h-7 w-7 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Sin dieta asignada</h3>
        <p className="text-sm text-muted max-w-xs">Kiko te asignara un plan nutricional cuando este listo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeDiet && (
        <DietCard diet={activeDiet} active />
      )}

      {historyDiets.length > 0 && (
        <div>
          <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted mb-3 px-1">
            Historial
          </h2>
          <div className="space-y-3">
            {historyDiets.map((d) => (
              <DietCard key={d.id} diet={d} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DietCard({ diet, active }: { diet: { id: string; title: string; description: string; startDate: Date | null; endDate: Date | null; meals: unknown; notes: string }; active?: boolean }) {
  const meals = (diet.meals as Meal[] | null) ?? [];

  // Compute daily totals
  const totals = meals.reduce(
    (acc, meal) => {
      for (const food of meal.foods || []) {
        acc.calories += food.calories ?? 0;
        acc.protein += food.protein ?? 0;
        acc.carbs += food.carbs ?? 0;
        acc.fat += food.fat ?? 0;
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className={`rounded-2xl bg-card border ${active ? "border-a-accent/30" : "border-border"} overflow-hidden`}>
      <div className="px-5 pt-4 pb-3 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {active && (
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-a-accent mb-1 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-a-accent" />
                Activa
              </p>
            )}
            <h2 className="text-base font-semibold text-foreground">{diet.title}</h2>
            {diet.description && (
              <p className="text-xs text-muted mt-1">{diet.description}</p>
            )}
          </div>
        </div>

        {(diet.startDate || diet.endDate) && (
          <div className="mt-2 flex items-center gap-2 text-[0.65rem] text-muted">
            {diet.startDate && <span>Desde {new Date(diet.startDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>}
            {diet.endDate && <span>· hasta {new Date(diet.endDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>}
          </div>
        )}

        {/* Macros summary */}
        {totals.calories > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            <Macro label="kcal" value={totals.calories} accent />
            <Macro label="proteína" value={totals.protein} unit="g" />
            <Macro label="carbs" value={totals.carbs} unit="g" />
            <Macro label="grasa" value={totals.fat} unit="g" />
          </div>
        )}
      </div>

      {/* Meals */}
      <div className="divide-y divide-border">
        {meals.map((meal, i) => (
          <div key={i} className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">{meal.name}</h3>
              {meal.time && <span className="text-[0.7rem] text-a-accent">{meal.time}</span>}
            </div>
            <ul className="space-y-1.5">
              {(meal.foods || []).map((food, j) => (
                <li key={j} className="flex items-start gap-2 text-[0.8rem]">
                  <span className="text-muted mt-0.5">•</span>
                  <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                    <span className="text-foreground">
                      {food.name}
                      {food.grams ? <span className="text-muted"> ({food.grams}g)</span> : null}
                    </span>
                    {food.calories ? (
                      <span className="text-[0.7rem] text-muted shrink-0">{fmt(food.calories)} kcal</span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {diet.notes && (
        <div className="px-5 py-3 bg-background/50 border-t border-border">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-1">Notas</p>
          <p className="text-xs text-foreground whitespace-pre-wrap">{diet.notes}</p>
        </div>
      )}
    </div>
  );
}

/** Max 2 decimals, strip trailing zeros — avoids float-precision noise */
function fmt(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return (Math.round(n * 100) / 100).toFixed(2).replace(/\.?0+$/, "");
}

function Macro({ label, value, unit, accent }: { label: string; value: number; unit?: string; accent?: boolean }) {
  return (
    <div className="text-center rounded-lg bg-background/50 px-2 py-2">
      <p className={`text-sm font-bold ${accent ? "text-a-accent" : "text-foreground"}`}>
        {fmt(value)}{unit ?? ""}
      </p>
      <p className="text-[0.55rem] uppercase tracking-widest text-muted">{label}</p>
    </div>
  );
}
