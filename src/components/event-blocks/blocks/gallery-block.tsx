import type { GalleryData } from "../types";

export function GalleryBlock({ data }: { data: Record<string, unknown>; pageId: string }) {
  const d = data as unknown as GalleryData;
  const images = d.images || [];
  const cols = d.columns || 3;

  if (images.length === 0) {
    return (
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto text-center text-[#444] text-sm">
          Galeria sin imagenes
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-6">
      <div
        className="max-w-5xl mx-auto grid gap-3"
        style={{ gridTemplateColumns: `repeat(${Math.min(cols, 4)}, minmax(0, 1fr))` }}
      >
        {images.map((img, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-[#1a1a1a]">
            <img
              src={img.url}
              alt={img.alt || ""}
              className="w-full h-48 sm:h-56 object-cover hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
