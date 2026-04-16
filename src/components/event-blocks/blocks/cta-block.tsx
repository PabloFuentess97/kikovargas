import type { CtaData } from "../types";

export function CtaBlock({ data }: { data: Record<string, unknown>; pageId: string }) {
  const d = data as unknown as CtaData;
  const isOutline = d.variant === "outline";

  return (
    <section className="py-16 px-6">
      <div className="max-w-2xl mx-auto text-center">
        {d.heading && (
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{d.heading}</h2>
        )}
        {d.description && (
          <p className="text-[#999] text-base mb-8">{d.description}</p>
        )}
        {d.buttonText && (
          <a
            href={d.buttonHref || "#form"}
            className={`inline-block px-8 py-4 rounded-xl font-semibold text-sm transition-colors ${
              isOutline
                ? "border-2 border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c]/10"
                : "bg-[#c9a84c] text-black hover:bg-[#d4b45f]"
            }`}
          >
            {d.buttonText}
          </a>
        )}
      </div>
    </section>
  );
}
