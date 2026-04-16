import type { StatsData } from "../types";

export function StatsBlock({ data }: { data: Record<string, unknown>; pageId: string }) {
  const d = data as unknown as StatsData;
  const items = d.items || [];

  if (items.length === 0) {
    return (
      <section className="py-12 px-6 text-center text-[#444] text-sm">
        Estadisticas sin configurar
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {d.heading && (
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-12 text-center">{d.heading}</h2>
        )}

        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))`,
          }}
        >
          {items.map((item, i) => (
            <div key={i} className="text-center px-4 py-6 rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a]">
              <div className="text-3xl sm:text-4xl font-bold text-[#c9a84c] mb-2 tabular-nums">
                {item.value}
              </div>
              <div className="text-xs sm:text-sm text-[#888] uppercase tracking-wider font-medium">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
