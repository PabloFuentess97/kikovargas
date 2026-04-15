"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, stagger, scaleIn } from "@/lib/animations";

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

/**
 * Assign span classes to create a visually interesting grid layout.
 * First image is large (2x2), every 4th after is tall (row-span-2).
 */
function getSpan(index: number): string {
  if (index === 0) return "col-span-2 row-span-2";
  if (index === 3) return "row-span-2";
  return "";
}

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  function navigate(dir: -1 | 1) {
    const next = selectedIndex + dir;
    if (next >= 0 && next < images.length) {
      setSelected(images[next]);
      setSelectedIndex(next);
    }
  }

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setSelected(null);
    if (e.key === "ArrowRight") navigate(1);
    if (e.key === "ArrowLeft") navigate(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, images]);

  useEffect(() => {
    if (selected) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [selected, handleKey]);

  if (images.length === 0) {
    return (
      <section id="gallery" className="section-py bg-void relative overflow-hidden">
        <div className="container-landing">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.span variants={fadeUp} className="section-label mb-5 block">
              Galería
            </motion.span>
            <motion.h2 variants={fadeUp} className="section-heading mb-8">
              El trabajo habla
              <br />
              <span className="text-accent">por sí solo</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-secondary/50 text-sm">
              Próximamente — nuevas fotos en camino.
            </motion.p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="gallery" className="section-py bg-void relative overflow-hidden">
        {/* Ghost text */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 font-display text-[20vw] font-bold uppercase leading-none text-white/[0.012] pointer-events-none select-none translate-y-[30%]"
        >
          Gallery
        </div>

        <div className="container-landing">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-12 md:mb-16 lg:mb-20"
          >
            <div>
              <motion.span variants={fadeUp} className="section-label mb-5 block">
                Galería
              </motion.span>
              <motion.h2 variants={fadeUp} className="section-heading">
                El trabajo habla
                <br />
                <span className="text-accent">por sí solo</span>
              </motion.h2>
            </div>
            <motion.div variants={fadeUp} className="flex items-center gap-6">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2.5 text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-accent hover:text-accent-hover transition-colors group"
              >
                <span className="h-[1px] w-5 bg-accent/30 transition-all duration-500 group-hover:w-8 group-hover:bg-accent" />
                Ver galería completa
              </Link>
              <span className="hidden md:block font-display text-7xl lg:text-8xl font-bold text-accent/[0.04] leading-none">
                02
              </span>
            </motion.div>
          </motion.div>

          {/* Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 auto-rows-[180px] sm:auto-rows-[220px] md:auto-rows-[260px] lg:auto-rows-[300px] gap-1.5 md:gap-2"
          >
            {images.map((img, i) => (
              <motion.button
                key={img.id}
                variants={scaleIn}
                onClick={() => { setSelected(img); setSelectedIndex(i); }}
                className={`${getSpan(i)} relative overflow-hidden group cursor-pointer bg-elevated`}
              >
                <img
                  src={img.url}
                  alt={img.alt || "Galería"}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.06]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-void/20 transition-all duration-600 group-hover:bg-void/0" />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-void/50 via-void/10 to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-700" />
                {/* Inset border on hover */}
                <div className="absolute inset-1.5 border border-white/0 transition-all duration-700 group-hover:border-white/10 group-hover:inset-3" />
                {/* Corner accents */}
                <div className="absolute top-3 left-3 w-5 h-5 border-t border-l border-accent/0 group-hover:border-accent/40 transition-all duration-700" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-accent/0 group-hover:border-accent/40 transition-all duration-700" />
                {/* Number overlay */}
                <div className="absolute top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="font-mono text-[0.5rem] text-accent/40 tracking-wider">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                {/* Label slide-up */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out bg-gradient-to-t from-void/90 to-transparent pt-10">
                  <div className="h-[1px] w-6 bg-accent mb-2" />
                  <span className="text-[0.55rem] sm:text-[0.6rem] font-medium uppercase tracking-[0.2em] text-primary/90">
                    {img.alt || "Galería"}
                  </span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lightbox with navigation */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 bg-void/97 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-6 cursor-pointer"
          >
            <motion.div
              key={selected.id}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selected.url}
                alt={selected.alt || "Galería"}
                className="max-w-full max-h-[85vh] object-contain"
              />

              {/* Top bar */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-void/60 to-transparent">
                <span className="text-[0.55rem] text-secondary/60 uppercase tracking-[0.2em]">
                  {selected.alt || "Galería"} — {selectedIndex + 1}/{images.length}
                </span>
                <button
                  onClick={() => setSelected(null)}
                  className="w-9 h-9 flex items-center justify-center border border-white/10 text-secondary/70 hover:bg-accent hover:text-void hover:border-accent transition-all duration-300 text-sm"
                  aria-label="Cerrar"
                >
                  &#10005;
                </button>
              </div>

              {/* Navigation arrows */}
              {selectedIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-white/10 text-secondary/70 hover:bg-accent hover:text-void hover:border-accent transition-all duration-300"
                  aria-label="Anterior"
                >
                  &#8592;
                </button>
              )}
              {selectedIndex < images.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(1); }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-white/10 text-secondary/70 hover:bg-accent hover:text-void hover:border-accent transition-all duration-300"
                  aria-label="Siguiente"
                >
                  &#8594;
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
