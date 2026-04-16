import type { FeaturesData } from "../types";

export function FeaturesBlock({ data }: { data: Record<string, unknown>; pageId: string }) {
  const d = data as unknown as FeaturesData;
  const items = d.items || [];
  const cols = d.columns || 3;

  if (items.length === 0) {
    return (
      <section className="py-12 px-6 text-center text-[#444] text-sm">
        Caracteristicas sin configurar
      </section>
    );
  }

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {d.heading && (
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 text-center">{d.heading}</h2>
        )}
        {d.description && (
          <p className="text-[#999] text-base mb-12 text-center max-w-2xl mx-auto">{d.description}</p>
        )}

        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: `repeat(${Math.min(cols, 4)}, minmax(0, 1fr))`,
          }}
        >
          {items.map((item, i) => (
            <div key={i} className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6 sm:p-8">
              {item.icon && (
                <div className="text-2xl sm:text-3xl mb-4">{item.icon}</div>
              )}
              <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-[#999] leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
