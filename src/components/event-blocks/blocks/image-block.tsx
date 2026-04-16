import type { ImageData } from "../types";

export function ImageBlock({ data }: { data: Record<string, unknown>; pageId: string }) {
  const d = data as unknown as ImageData;

  if (!d.url) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto rounded-2xl bg-[#111] border border-[#1a1a1a] h-64 flex items-center justify-center">
          <p className="text-[#333] text-sm">Imagen no configurada</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <img
          src={d.url}
          alt={d.alt || ""}
          className="w-full rounded-2xl object-cover"
          loading="lazy"
        />
        {d.caption && (
          <p className="mt-3 text-center text-xs text-[#666]">{d.caption}</p>
        )}
      </div>
    </section>
  );
}
