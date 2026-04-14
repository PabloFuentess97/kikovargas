"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/animations";

const ACHIEVEMENTS = [
  { year: "2024", title: "IFBB Pro League", subtitle: "South American Championship", placement: "Top 5", highlight: true },
  { year: "2023", title: "Campeonato Nacional IFBB", subtitle: "Categoría Bodybuilding", placement: "1er Lugar", highlight: true },
  { year: "2022", title: "Arnold Classic Amateur", subtitle: "Men's Bodybuilding", placement: "Top 10", highlight: false },
  { year: "2021", title: "Campeonato Nacional IFBB", subtitle: "Overall Winner", placement: "1er Lugar", highlight: true },
  { year: "2020", title: "Mr. Universe — NABBA", subtitle: "Open Division", placement: "2do Lugar", highlight: false },
  { year: "2019", title: "Campeonato Nacional IFBB", subtitle: "Categoría Pesados", placement: "1er Lugar", highlight: true },
];

export function AchievementsSection() {
  return (
    <section id="achievements" className="section-py bg-surface relative overflow-hidden">
      <div
        aria-hidden
        className="absolute top-1/2 -translate-y-1/2 -left-[3%] font-display text-[20vw] font-bold uppercase leading-none text-white/[0.012] pointer-events-none select-none"
      >
        Logros
      </div>

      <div className="container-landing">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="flex items-end justify-between mb-12 md:mb-16 lg:mb-20"
        >
          <div>
            <motion.span variants={fadeUp} className="section-label mb-5 block">
              Trayectoria
            </motion.span>
            <motion.h2 variants={fadeUp} className="section-heading">
              Cada título se
              <br />
              <span className="text-accent">ganó en el gym</span>
            </motion.h2>
          </div>
          <motion.span
            variants={fadeUp}
            className="hidden md:block font-display text-7xl lg:text-8xl font-bold text-accent/[0.04] leading-none"
          >
            03
          </motion.span>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="grid sm:grid-cols-2 gap-2.5 md:gap-3"
        >
          {ACHIEVEMENTS.map((item) => (
            <motion.div
              key={`${item.year}-${item.title}`}
              variants={fadeUp}
              className={`group relative p-5 sm:p-6 md:p-7 border transition-all duration-500 hover:bg-elevated/40 ${
                item.highlight
                  ? "border-accent/15 hover:border-accent/30"
                  : "border-border-subtle hover:border-accent/15"
              }`}
            >
              <div className="flex items-start justify-between mb-3.5">
                <span className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-accent/70 leading-none">
                  {item.year}
                </span>
                {item.highlight && (
                  <span className="text-[0.5rem] font-semibold uppercase tracking-[0.25em] text-void bg-accent px-2.5 py-0.5 mt-1">
                    Winner
                  </span>
                )}
              </div>

              <h3 className="font-display text-base sm:text-lg md:text-xl font-semibold uppercase tracking-wide text-primary mb-1 group-hover:text-accent transition-colors duration-400">
                {item.title}
              </h3>
              <p className="text-[0.8rem] text-secondary/50 mb-3">{item.subtitle}</p>

              <div className="flex items-center gap-2.5 pt-3 border-t border-border-subtle">
                <div className={`w-1.5 h-1.5 rounded-full ${item.highlight ? "bg-accent" : "bg-tertiary"}`} />
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.15em] text-secondary/70">
                  {item.placement}
                </span>
              </div>

              {/* Corner accents on hover */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-accent/0 group-hover:border-accent/25 transition-all duration-500" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-accent/0 group-hover:border-accent/25 transition-all duration-500" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
