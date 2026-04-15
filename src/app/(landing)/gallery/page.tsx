import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { FullGallery } from "./full-gallery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galería | Kiko Vargas",
  description: "Galería fotográfica — competencias, entrenamientos, sesiones y más.",
};

export default async function GalleryPage() {
  const images = await prisma.image.findMany({
    where: { gallery: true },
    select: { id: true, url: true, alt: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      {/* Hero header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 bg-void relative overflow-hidden">
        <div
          aria-hidden
          className="absolute top-1/2 -translate-y-1/2 -right-[5%] font-display text-[18vw] font-bold uppercase leading-none text-white/[0.012] pointer-events-none select-none"
        >
          Gallery
        </div>

        <div className="container-landing">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 text-[0.55rem] uppercase tracking-[0.25em]">
            <Link
              href="/"
              className="text-tertiary hover:text-accent transition-colors duration-300"
            >
              Inicio
            </Link>
            <span className="text-tertiary/30">/</span>
            <span className="text-accent">Galería</span>
          </div>

          <span className="section-label mb-5 block">Fotográfico</span>
          <h1 className="section-heading">
            El trabajo habla
            <br />
            <span className="text-accent">por sí solo</span>
          </h1>
          <p className="mt-6 text-secondary/60 text-sm max-w-lg leading-relaxed">
            Competencias, preparaciones, entrenamientos y sesiones fotográficas.
            Cada imagen cuenta una parte de la historia.
          </p>
        </div>
      </section>

      <div className="hr-accent" />

      {/* Gallery */}
      <section className="section-py bg-surface relative overflow-hidden">
        <div className="container-landing">
          {images.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-xl font-semibold uppercase text-secondary/30 mb-3">
                Próximamente
              </p>
              <p className="text-secondary/40 text-sm">
                Nuevas fotos en camino.
              </p>
            </div>
          ) : (
            <>
              <p className="text-[0.55rem] uppercase tracking-[0.25em] text-tertiary mb-8">
                {images.length} {images.length === 1 ? "imagen" : "imágenes"}
              </p>
              <FullGallery images={images} />
            </>
          )}
        </div>
      </section>
    </>
  );
}
