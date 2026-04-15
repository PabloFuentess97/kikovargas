"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { ease } from "@/lib/animations";
import type { NavbarContent, SocialLinks } from "@/lib/config/landing-defaults";

const NAV_LINKS = [
  { label: "Sobre mí", href: "#about", num: "01" },
  { label: "Galería", href: "#gallery", num: "02" },
  { label: "Logros", href: "#achievements", num: "03" },
  { label: "Blog", href: "#blog", num: "04" },
  { label: "Contacto", href: "#contact", num: "05" },
];

export function Navbar({ config, social }: { config: NavbarContent; social: SocialLinks }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const [lastY, setLastY] = useState(0);

  useMotionValueEvent(scrollY, "change", (v) => {
    setScrolled(v > 60);
    // Hide on scroll down, show on scroll up
    if (v > lastY && v > 400 && !mobileOpen) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setLastY(v);
  });

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.5, ease }}
        className={`fixed top-0 left-0 right-0 z-50 transition-[background,border,box-shadow] duration-500 ${
          scrolled
            ? "bg-void/80 backdrop-blur-2xl border-b border-white/[0.04] shadow-[0_1px_60px_rgba(0,0,0,0.5)]"
            : "bg-transparent"
        }`}
      >
        <div className="container-landing flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#" className="relative group" onClick={closeMobile}>
            <span className="font-display text-lg md:text-xl font-bold tracking-[0.18em] uppercase text-primary transition-colors duration-300 group-hover:text-accent">
              {config.brandFirst}
            </span>
            <span className="font-display text-lg md:text-xl font-bold tracking-[0.18em] uppercase text-accent">
              {config.brandSecond}
            </span>
            <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-accent transition-all duration-500 group-hover:w-full" />
          </a>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-9">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-[0.65rem] font-medium uppercase tracking-[0.2em] text-secondary/60 hover:text-primary transition-all duration-400 group py-1"
              >
                <span className="text-accent/30 text-[0.55rem] mr-1.5 font-mono transition-colors duration-400 group-hover:text-accent">
                  {link.num}
                </span>
                {link.label}
                <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-accent/60 transition-all duration-500 ease-out group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* CTA */}
          <a
            href="#contact"
            className="hidden lg:inline-block text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-void bg-accent px-5 py-2 hover:bg-accent-hover transition-colors duration-300"
          >
            {config.ctaText}
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-[5px]"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
              className="block w-5 h-[1.5px] bg-primary origin-center"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2 }}
              className="block w-5 h-[1.5px] bg-primary"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3 }}
              className="block w-5 h-[1.5px] bg-primary origin-center"
            />
          </button>
        </div>
      </motion.header>

      {/* Mobile fullscreen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-40 bg-void/98 backdrop-blur-sm flex flex-col justify-center lg:hidden"
          >
            <nav className="container-landing flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={closeMobile}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease }}
                  className="flex items-baseline gap-4 py-3.5 border-b border-border-subtle group"
                >
                  <span className="text-[0.6rem] font-mono text-accent/30 group-hover:text-accent transition-colors w-5">
                    {link.num}
                  </span>
                  <span className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-wide text-primary group-hover:text-accent transition-colors duration-300">
                    {link.label}
                  </span>
                </motion.a>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="container-landing mt-10"
            >
              <a
                href="#contact"
                onClick={closeMobile}
                className="inline-block text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-void bg-accent px-6 py-3 hover:bg-accent-hover transition-colors"
              >
                {config.ctaText}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
