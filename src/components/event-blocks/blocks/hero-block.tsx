import type { HeroData } from "../types";

export function HeroBlock({ data }: { data: Record<string, unknown>; pageId: string }) {
  const d = data as unknown as HeroData;

  return (
    <section
      className="relative min-h-[60vh] flex items-center justify-center text-center px-6 py-20"
      style={d.backgroundUrl ? {
        backgroundImage: `linear-gradient(to bottom, rgba(3,3,3,0.7), rgba(3,3,3,0.9)), url(${d.backgroundUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      } : undefined}
    >
      <div className="max-w-3xl mx-auto">
        {d.title && (
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {d.title}
          </h1>
        )}
        {d.subtitle && (
          <p className="text-lg sm:text-xl text-[#999] mb-8 max-w-2xl mx-auto leading-relaxed">
            {d.subtitle}
          </p>
        )}
        {d.ctaText && (
          <a
            href={d.ctaHref || "#form"}
            className="inline-block bg-[#c9a84c] text-black px-8 py-4 rounded-xl font-semibold text-sm hover:bg-[#d4b45f] transition-colors"
          >
            {d.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
