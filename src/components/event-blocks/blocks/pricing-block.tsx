import type { PricingData } from "../types";

export function PricingBlock({ data }: { data: Record<string, unknown>; pageId: string }) {
  const d = data as unknown as PricingData;
  const plans = d.plans || [];

  if (plans.length === 0) {
    return (
      <section className="py-12 px-6 text-center text-[#444] text-sm">
        Planes sin configurar
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
          className="grid gap-6 items-start"
          style={{
            gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, minmax(0, 1fr))`,
          }}
        >
          {plans.map((plan, i) => {
            const isHighlighted = plan.highlighted;

            return (
              <div
                key={i}
                className={`rounded-2xl border p-8 flex flex-col relative ${
                  isHighlighted
                    ? "border-[#c9a84c] bg-[#c9a84c]/5 shadow-lg shadow-[#c9a84c]/5"
                    : "border-[#1a1a1a] bg-[#0a0a0a]"
                }`}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#c9a84c] text-black text-[0.6rem] font-bold uppercase tracking-wider rounded-full">
                    Recomendado
                  </div>
                )}

                <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>

                <div className="mb-6">
                  <span className="text-3xl sm:text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-[#666] ml-1">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex items-start gap-2.5 text-sm text-[#bbb]">
                      <svg className="h-4 w-4 text-[#c9a84c] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.buttonHref || "#form"}
                  className={`block w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-colors ${
                    isHighlighted
                      ? "bg-[#c9a84c] text-black hover:bg-[#d4b45f]"
                      : "border-2 border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c]/10"
                  }`}
                >
                  {plan.buttonText || "Elegir plan"}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
