"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, stagger } from "@/lib/animations";

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

export function FullGallery({ images }: { images: GalleryImage[] }) {
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  function openImage(img: GalleryImage, index: number) {
    setSelected(img);
    setSelectedIndex(index);
  }

  function navigate(dir: -1 | 1) {
    const next = selectedIndex + dir;
    if (next >= 0 && next < images.length) {
      setSelected(images[next]);
      setSelectedIndex(next);
    }
  }

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedIndex, images],
  );

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

  return (
    <>
      {/* Masonry-style grid */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={stagger}
        className="columns-2 md:columns-3 lg:columns-4 gap-2 md:gap-2.5 space-y-2 md:space-y-2.5"
      >
        {images.map((img, i) => (
          <motion.button
            key={img.id}
            variants={fadeUp}
            onClick={() => openImage(img, i)}
            className="relative w-full overflow-hidden group cursor-pointer break-inside-avoid block"
          >
            <img
              src={img.url}
              alt={img.alt || "Galería"}
              loading="lazy"
              className="w-full h-auto object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
                if (el.parentElement) {
                  const placeholder = document.createElement("div");
                  placeholder.className = "w-full aspect-[4/5] flex items-center justify-center bg-elevated text-tertiary/30";
                  placeholder.innerHTML = `<span class="font-display text-2xl font-bold uppercase">&#128247;</span>`;
                  el.parentElement.insertBefore(placeholder, el);
                }
              }}
            />
            <div className="absolute inset-0 bg-void/20 transition-all duration-500 group-hover:bg-void/5" />
            {/* Inset border */}
            <div className="absolute inset-1 border border-white/0 transition-all duration-700 group-hover:border-white/10 group-hover:inset-2.5" />
            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out bg-gradient-to-t from-void/80 to-transparent pt-8">
              <div className="h-[1px] w-5 bg-accent mb-1.5" />
              <span className="text-[0.55rem] font-medium uppercase tracking-[0.2em] text-primary/80">
                {img.alt || "Galería"}
              </span>
            </div>
          </motion.button>
        ))}
      </motion.div>

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
