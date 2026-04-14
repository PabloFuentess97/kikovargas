"use client";

import { motion } from "framer-motion";
import { fadeUp, fadeIn, lineExpand, stagger, staggerSlow } from "@/lib/animations";

export function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <article className="bg-void relative overflow-hidden">
      {/* Ghost text */}
      <div
        aria-hidden
        className="absolute top-[15vh] -right-[5%] font-display text-[18vw] font-bold uppercase leading-none text-white/[0.012] pointer-events-none select-none"
      >
        Legal
      </div>

      {/* Hero header */}
      <header className="relative pt-32 sm:pt-40 md:pt-48 pb-16 md:pb-24">
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-void via-surface/30 to-void" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="container-landing max-w-4xl relative z-10"
        >
          {/* Accent line */}
          <motion.div
            variants={lineExpand}
            className="w-10 h-[1px] bg-accent mb-6 md:mb-8 origin-left"
          />

          {/* Eyebrow */}
          <motion.span variants={fadeUp} className="section-label mb-6 block">
            Legal
          </motion.span>

          {/* Title */}
          <div className="overflow-hidden mb-5">
            <motion.h1
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="section-heading text-primary"
            >
              {title}
            </motion.h1>
          </div>

          {/* Date + decorative line */}
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <div className="h-[1px] w-6 bg-accent/40" />
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-tertiary">
              Última actualización: {lastUpdated}
            </p>
          </motion.div>
        </motion.div>
      </header>

      <div className="hr-accent" />

      {/* Content body */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerSlow}
        className="container-landing max-w-4xl py-16 md:py-24 lg:py-32"
      >
        <div className="space-y-14 md:space-y-20">
          {children}
        </div>

        {/* Back to top */}
        <motion.div variants={fadeUp} className="mt-20 md:mt-28 pt-8 border-t border-border-subtle">
          <a
            href="#"
            className="group inline-flex items-center gap-3 text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-tertiary hover:text-accent transition-colors duration-300"
          >
            <span className="inline-block w-6 h-[1px] bg-accent/40 group-hover:w-10 transition-all duration-300" />
            Volver arriba
          </a>
        </motion.div>
      </motion.div>

      {/* Section number — side marker */}
      <div className="fixed top-1/2 -translate-y-1/2 right-6 md:right-12 z-10 hidden lg:block">
        <span className="font-mono text-[9px] text-tertiary/20 [writing-mode:vertical-lr] tracking-[0.3em]">
          LEGAL
        </span>
      </div>
    </article>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={stagger}
      className="relative"
    >
      {/* Section heading with accent line */}
      <motion.div variants={fadeUp} className="flex items-start gap-4 mb-6 md:mb-8">
        <div className="w-8 h-[1px] bg-accent/30 mt-3 shrink-0 hidden sm:block" />
        <h2 className="font-display text-xl md:text-2xl font-semibold uppercase tracking-wide text-primary leading-tight">
          {title}
        </h2>
      </motion.div>

      {/* Body */}
      <motion.div
        variants={fadeIn}
        className="sm:pl-12 space-y-4 text-[0.875rem] md:text-[0.9rem] text-secondary/65 leading-[1.9]"
      >
        {children}
      </motion.div>
    </motion.section>
  );
}
