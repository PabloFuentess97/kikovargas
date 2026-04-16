"use client";

import type { EventBlockRecord } from "./types";
import { HeroBlock } from "./blocks/hero-block";
import { TextBlock } from "./blocks/text-block";
import { ImageBlock } from "./blocks/image-block";
import { CtaBlock } from "./blocks/cta-block";
import { GalleryBlock } from "./blocks/gallery-block";
import { FormBlock } from "./blocks/form-block";
import { CountdownBlock } from "./blocks/countdown-block";
import { FaqBlock } from "./blocks/faq-block";

const BLOCK_MAP: Record<string, React.ComponentType<{ data: Record<string, unknown>; pageId: string }>> = {
  hero: HeroBlock,
  text: TextBlock,
  image: ImageBlock,
  cta: CtaBlock,
  gallery: GalleryBlock,
  form: FormBlock,
  countdown: CountdownBlock,
  faq: FaqBlock,
};

export function BlockRenderer({ blocks, pageId }: { blocks: EventBlockRecord[]; pageId: string }) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-[#555] text-sm">
        Esta pagina aun no tiene contenido.
      </div>
    );
  }

  return (
    <div>
      {blocks.map((block) => {
        const Component = BLOCK_MAP[block.type];

        if (!Component) {
          return (
            <div key={block.id} className="py-8 text-center text-[#444] text-xs">
              Bloque desconocido: {block.type}
            </div>
          );
        }

        return (
          <div key={block.id}>
            <Component data={block.data as Record<string, unknown>} pageId={pageId} />
          </div>
        );
      })}
    </div>
  );
}
