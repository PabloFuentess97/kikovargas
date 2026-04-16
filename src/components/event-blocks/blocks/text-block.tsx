import type { TextData } from "../types";

export function TextBlock({ data }: { data: Record<string, unknown>; pageId: string }) {
  const d = data as unknown as TextData;
  const align = d.align || "center";

  return (
    <section className="py-16 px-6">
      <div className={`max-w-3xl mx-auto text-${align}`} style={{ textAlign: align }}>
        {d.heading && (
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">{d.heading}</h2>
        )}
        {d.body && (
          <div
            className="text-[#999] text-base leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: d.body }}
          />
        )}
      </div>
    </section>
  );
}
