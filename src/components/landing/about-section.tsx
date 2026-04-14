"use client";

import { motion } from "framer-motion";
import { fadeUp, slideLeft, slideRight, stagger } from "@/lib/animations";

export function AboutSection() {
  return (
    <section id="about" className="section-py bg-surface relative overflow-hidden">
      {/* Ghost text */}
      <div
        aria-hidden
        className="absolute top-1/2 -translate-y-1/2 -right-[5%] font-display text-[20vw] font-bold uppercase leading-none text-white/[0.012] pointer-events-none select-none"
      >
        About
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="container-landing"
      >
        {/* Eyebrow */}
        <motion.div variants={fadeUp} className="mb-12 md:mb-16 lg:mb-20">
          <span className="section-label">Sobre mí</span>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-6 items-start">
          {/* Image */}
          <motion.div variants={slideLeft} className="lg:col-span-5 relative">
            <div className="aspect-[3/4] bg-elevated overflow-hidden relative group">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
                style={{ backgroundImage: "url('/images/about-portrait.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void/30 to-transparent" />
              {/* Corner accents */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-accent/30" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-accent/30" />
            </div>
            {/* Offset frame */}
            <div className="absolute -bottom-2.5 -right-2.5 w-full h-full border border-accent/10 -z-10 hidden md:block" />
            {/* Label */}
            <div className="absolute -bottom-4 left-5 bg-void px-3 py-1.5 hidden md:block">
              <span className="text-[0.55rem] font-mono uppercase tracking-[0.3em] text-accent/50">
                Est. 2009
              </span>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div variants={slideRight} className="lg:col-span-6 lg:col-start-7 lg:pt-8">
            <h2 className="section-heading mb-7 md:mb-9">
              Más que un
              <br />
              <span className="text-accent">deporte,</span>
              <br />
              un estilo de vida
            </h2>

            <div className="space-y-4 text-secondary/75 leading-[1.85] text-[0.875rem] max-w-lg">
              <p>
                Llevo más de 15 años dedicado al bodybuilding competitivo. Lo que
                comenzó como una disciplina personal se convirtió en mi forma de vida,
                mi carrera y mi manera de inspirar a otros.
              </p>
              <p>
                Cada competencia es una prueba de compromiso. Cada entrenamiento es
                una decisión de ser mejor. No busco atajos &mdash; busco resultados que
                hablen por sí solos en el escenario.
              </p>
              <p>
                Hoy, además de competir a nivel profesional, me dedico a preparar
                atletas que quieran llevar su físico al siguiente nivel.
              </p>
            </div>

            {/* Metrics */}
            <div className="mt-10 md:mt-14 pt-7 border-t border-border-subtle grid grid-cols-3 gap-6 md:gap-10">
              {[
                { num: "15+", text: "Años compitiendo" },
                { num: "200+", text: "Atletas preparados" },
                { num: "3x", text: "Campeón nacional" },
              ].map((m) => (
                <div key={m.text}>
                  <span className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-accent leading-none">
                    {m.num}
                  </span>
                  <p className="text-[0.6rem] text-tertiary uppercase tracking-[0.2em] mt-1.5 leading-snug">
                    {m.text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
