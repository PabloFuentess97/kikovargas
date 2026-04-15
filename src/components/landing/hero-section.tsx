"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ease } from "@/lib/animations";
import type { HeroContent } from "@/lib/config/landing-defaults";

export function HeroSection({ config }: { config: HeroContent }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.12]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.45], [0, 60]);

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[600px] max-h-[1200px] flex items-end overflow-hidden">
      {/* Parallax background with Ken Burns */}
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 -top-[15%] -bottom-[15%] will-change-transform"
        aria-hidden
      >
        <div
          className="absolute inset-0 bg-cover bg-[center_25%]"
          style={{
            backgroundImage:
              `url('${config.backgroundImage}'), linear-gradient(135deg, #080808 0%, #151515 40%, #080808 100%)`,
          }}
        />
      </motion.div>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-void from-3% via-void/60 via-45% to-void/5" />
      <div className="absolute inset-0 bg-gradient-to-r from-void/40 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-void/15" />
      {/* Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.5)]" />

      {/* Content */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 container-landing pb-16 sm:pb-20 md:pb-28 lg:pb-36"
      >
        {/* Pre-title accent */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease }}
          className="w-10 h-[1px] bg-accent mb-6 md:mb-8 origin-left"
        />

        {/* Title */}
        <div className="mb-5 md:mb-7">
          {[config.title, config.titleAccent].map((word, i) => (
            <div key={word} className="overflow-hidden">
              <motion.h1
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.9, ease }}
                className="font-display font-bold uppercase leading-[0.82] tracking-[-0.03em] text-primary"
                style={{
                  fontSize: "clamp(3.5rem, 14vw, 12rem)",
                  textShadow: "0 2px 40px rgba(0,0,0,0.5)",
                }}
              >
                {i === 1 ? (
                  <><span className="text-accent">{config.titleAccent.charAt(0)}</span>{config.titleAccent.slice(1)}</>
                ) : (
                  word
                )}
              </motion.h1>
            </div>
          ))}
        </div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7, ease }}
          className="flex items-center gap-3 mb-8 md:mb-12"
        >
          <div className="h-[1px] w-6 bg-accent/50" />
          <p className="text-[0.6rem] sm:text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.35em] text-secondary/70 font-medium">
            {config.tagline}
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.7, ease }}
        >
          <a href={config.ctaHref} className="group relative inline-flex items-center gap-3">
            <span className="relative border border-accent/30 text-accent font-display font-semibold uppercase tracking-[0.25em] text-[0.65rem] px-8 py-3.5 transition-all duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-void">
              {config.ctaText}
            </span>
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-accent text-base"
            >
              &rarr;
            </motion.span>
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 md:right-12 flex flex-col items-center gap-2.5 z-10"
      >
        <span className="text-tertiary/50 text-[8px] uppercase tracking-[0.4em] [writing-mode:vertical-lr]">
          Scroll
        </span>
        <motion.div
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-[1px] h-12 bg-accent/60 origin-top"
        />
      </motion.div>

      {/* Section number */}
      <div className="absolute top-1/2 -translate-y-1/2 right-6 md:right-12 z-10 hidden lg:block">
        <span className="font-mono text-[9px] text-tertiary/20 [writing-mode:vertical-lr] tracking-[0.3em]">
          001 &mdash; HERO
        </span>
      </div>
    </section>
  );
}
