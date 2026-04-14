"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ease, fadeUp, stagger, lineExpand } from "@/lib/animations";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grain">
      <div className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden bg-void">
        {/* Ghost text */}
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[40vw] md:text-[30vw] font-bold uppercase leading-none text-white/[0.015] pointer-events-none select-none"
        >
          500
        </div>

        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-void via-surface/20 to-void" />
        <div className="absolute inset-0 shadow-[inset_0_0_250px_rgba(0,0,0,0.6)]" />

        {/* Corner accents */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1.2, ease: "easeOut" }}
          className="absolute top-8 left-8 sm:top-12 sm:left-12 w-12 h-12 border-t border-l border-accent/20"
          aria-hidden
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1.2, ease: "easeOut" }}
          className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 w-12 h-12 border-b border-r border-accent/20"
          aria-hidden
        />

        {/* Pulsing accent glow behind the number */}
        <motion.div
          animate={{ opacity: [0.03, 0.08, 0.03], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[120px] pointer-events-none"
          aria-hidden
        />

        {/* Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 container-landing text-center max-w-2xl flex flex-col items-center"
        >
          {/* Top accent line */}
          <motion.div
            variants={lineExpand}
            className="w-12 h-[1px] bg-accent mb-8 md:mb-10"
          />

          {/* Error number */}
          <div className="overflow-hidden mb-2">
            <motion.p
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2, duration: 0.9, ease }}
              className="font-display text-[6rem] sm:text-[8rem] md:text-[10rem] font-bold uppercase leading-[0.85] tracking-[-0.04em] text-primary"
              style={{ textShadow: "0 2px 40px rgba(0,0,0,0.5)" }}
            >
              5<span className="text-accent">0</span>0
            </motion.p>
          </div>

          {/* Heading */}
          <div className="overflow-hidden mb-6 md:mb-8">
            <motion.h1
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.35, duration: 0.9, ease }}
              className="font-display text-xl sm:text-2xl md:text-3xl font-semibold uppercase tracking-[0.08em] text-primary/80"
            >
              Error interno
            </motion.h1>
          </div>

          {/* Tagline */}
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-8 md:mb-10">
            <div className="h-[1px] w-6 bg-accent/40" />
            <p className="text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.3em] text-secondary/60 font-medium">
              Algo no ha ido como se esperaba
            </p>
            <div className="h-[1px] w-6 bg-accent/40" />
          </motion.div>

          {/* Body */}
          <motion.p
            variants={fadeUp}
            className="text-[0.85rem] sm:text-[0.9rem] text-secondary/50 leading-relaxed max-w-md mb-12 md:mb-14"
          >
            Ha ocurrido un error inesperado. Puedes intentar de nuevo
            o volver al inicio.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={reset}
              className="group relative inline-flex items-center gap-3"
            >
              <span className="relative border border-accent/30 text-accent font-display font-semibold uppercase tracking-[0.25em] text-[0.65rem] px-8 py-3.5 transition-all duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-void">
                Reintentar
              </span>
            </button>

            <a
              href="/"
              className="group inline-flex items-center gap-3"
            >
              <motion.span
                animate={{ x: [0, -4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-accent text-base"
              >
                &larr;
              </motion.span>
              <span className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-secondary/50 hover:text-accent transition-colors duration-300">
                Volver al inicio
              </span>
            </a>
          </motion.div>

          {/* Motivational quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1.5, ease: "easeOut" }}
            className="mt-16 md:mt-24"
          >
            <div className="h-[1px] w-8 bg-border-subtle mx-auto mb-5" />
            <p className="text-[0.6rem] uppercase tracking-[0.35em] text-tertiary/60 italic">
              &ldquo;Caer es parte del proceso. Levantarse es la decisión.&rdquo;
            </p>
          </motion.div>
        </motion.div>

        {/* Side marker */}
        <div className="absolute top-1/2 -translate-y-1/2 right-6 md:right-12 hidden lg:block">
          <span className="font-mono text-[9px] text-tertiary/20 [writing-mode:vertical-lr] tracking-[0.3em]">
            500 &mdash; ERROR
          </span>
        </div>
      </div>
    </div>
  );
}
