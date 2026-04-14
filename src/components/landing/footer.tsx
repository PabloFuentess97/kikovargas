"use client";

import { motion } from "framer-motion";
import { fadeUp, fadeIn, lineExpand, stagger, staggerSlow } from "@/lib/animations";

const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com/kikovargass" },
  { label: "YouTube", href: "https://youtube.com/@kikovargass" },
  { label: "TikTok", href: "https://tiktok.com/@kikovargass" },
];

const NAV = [
  { label: "Sobre mí", href: "#about" },
  { label: "Galería", href: "#gallery" },
  { label: "Logros", href: "#achievements" },
  { label: "Blog", href: "#blog" },
  { label: "Contacto", href: "#contact" },
];

const LEGAL = [
  { label: "Privacidad", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
  { label: "Términos", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="bg-void relative overflow-hidden">
      {/* ── CTA strip ── */}
      <div className="border-t border-border-subtle">
        <div className="container-landing py-16 md:py-24 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="text-[0.55rem] font-semibold uppercase tracking-[0.35em] text-accent/60 mb-4"
            >
              Listo para el siguiente nivel?
            </motion.p>
            <motion.h3
              variants={fadeUp}
              className="font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase leading-[0.9] tracking-tight mb-8"
            >
              Trabajemos <span className="text-accent">juntos</span>
            </motion.h3>
            <motion.a
              variants={fadeUp}
              href="#contact"
              className="group relative inline-flex items-center gap-3"
            >
              <span className="relative border border-accent/30 text-accent font-display font-semibold uppercase tracking-[0.25em] text-[0.65rem] px-8 py-3.5 transition-all duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-void">
                Iniciar conversación
              </span>
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-accent text-base"
              >
                &rarr;
              </motion.span>
            </motion.a>
          </motion.div>
        </div>
      </div>

      <div className="hr-accent" />

      {/* ── Main footer ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerSlow}
        className="container-landing pt-14 md:pt-20 pb-10 md:pb-14"
      >
        {/* Top row — brand + social */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-6 mb-14 md:mb-20">
          {/* Brand */}
          <motion.div variants={fadeUp}>
            <a href="#" className="inline-block mb-4">
              <span className="font-display text-2xl font-bold tracking-[0.15em] uppercase text-primary">
                Kiko
              </span>
              <span className="font-display text-2xl font-bold tracking-[0.15em] uppercase text-accent">
                Vargas
              </span>
            </a>
            <p className="text-[0.8rem] text-tertiary leading-relaxed max-w-[280px]">
              IFBB Professional Bodybuilder.
              <br />
              Competición, coaching y marca personal.
            </p>
          </motion.div>

          {/* Social — horizontal on desktop */}
          <motion.div variants={fadeUp} className="flex items-center gap-6">
            {SOCIAL.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-tertiary hover:text-accent transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div variants={lineExpand} className="h-[1px] bg-border-subtle origin-left mb-8 md:mb-10" />

        {/* Bottom row — nav + legal + copyright */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-6">
          {/* Nav links — inline */}
          <motion.nav variants={fadeIn} className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {NAV.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[0.7rem] text-secondary/40 hover:text-accent transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </motion.nav>

          {/* Legal + copyright */}
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            {/* Legal links */}
            <div className="flex items-center gap-4">
              {LEGAL.map((link, i) => (
                <span key={link.href} className="flex items-center gap-4">
                  <a
                    href={link.href}
                    className="text-[0.6rem] uppercase tracking-[0.2em] text-tertiary/50 hover:text-accent transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                  {i < LEGAL.length - 1 && (
                    <span className="w-[3px] h-[3px] rounded-full bg-tertiary/20" />
                  )}
                </span>
              ))}
            </div>

            {/* Separator on desktop */}
            <span className="hidden sm:block w-[1px] h-3 bg-border-subtle" />

            {/* Copyright */}
            <p className="text-[0.55rem] text-tertiary/30 uppercase tracking-[0.2em]">
              &copy; {new Date().getFullYear()} Kiko Vargas
            </p>
          </motion.div>
        </div>
      </motion.div>
    </footer>
  );
}
