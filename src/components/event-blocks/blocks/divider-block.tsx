import type { DividerData } from "../types";

export function DividerBlock({ data }: { data: Record<string, unknown>; pageId: string }) {
  const d = data as unknown as DividerData;
  const style = d.style || "line";

  if (style === "space") {
    return <div className="py-8" />;
  }

  if (style === "dots") {
    return (
      <section className="py-8 px-6">
        <div className="max-w-xs mx-auto flex items-center justify-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#c9a84c]/40" />
          <span className="h-2 w-2 rounded-full bg-[#c9a84c]/60" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#c9a84c]/40" />
        </div>
      </section>
    );
  }

  // Line style (default)
  return (
    <section className="py-8 px-6">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1a1a1a] to-transparent" />
        {d.label && (
          <>
            <span className="text-[0.65rem] text-[#555] uppercase tracking-[0.2em] font-medium shrink-0">{d.label}</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#1a1a1a] to-transparent" />
          </>
        )}
      </div>
    </section>
  );
}
