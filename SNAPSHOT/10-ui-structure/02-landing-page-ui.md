# UI Structure — Landing Page (Exact Code)

## Home Page Composition

```tsx
// src/app/(landing)/page.tsx
export const dynamic = "force-dynamic";

import { getLandingConfig } from "@/lib/config/get-config";
import { HeroSection } from "@/components/landing/hero-section";
import { AboutSection } from "@/components/landing/about-section";
import { StatsBar } from "@/components/landing/stats-bar";
import { GallerySection } from "@/components/landing/gallery-section";
import { AchievementsSection } from "@/components/landing/achievements-section";
import { BlogSection } from "@/components/landing/blog-section";
import { ContactSection } from "@/components/landing/contact-section";
import { NewsletterSection } from "@/components/landing/newsletter-section";
import { Divider } from "@/components/landing/divider";

export default async function HomePage() {
  const config = await getLandingConfig();
  const s = config.sections ?? {};

  return (
    <>
      {s.hero !== false && <HeroSection config={config.hero} />}
      {s.about !== false && <AboutSection config={config.about} />}
      {s.stats !== false && <StatsBar config={config.stats} />}
      {s.gallery !== false && <GallerySection />}
      {s.achievements !== false && <AchievementsSection />}
      {s.blog !== false && (
        <>
          <Divider />
          <BlogSection />
        </>
      )}
      {s.newsletter !== false && <NewsletterSection />}
      {s.contact !== false && <ContactSection config={config.contact} social={config.social} />}
    </>
  );
}
```

**Ordering matters** — the page is rendered top-to-bottom in this exact order. Disabled sections simply drop out (no empty space).

## Hero Section (`hero-section.tsx`)

Full-height cinematic hero with Ken Burns parallax and staggered text reveal.

```tsx
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

      {/* Cinematic overlays — 4 layered gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-void from-3% via-void/60 via-45% to-void/5" />
      <div className="absolute inset-0 bg-gradient-to-r from-void/40 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-void/15" />
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.5)]" />

      {/* Content wrapper with scroll-fade */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 container-landing pb-16 sm:pb-20 md:pb-28 lg:pb-36"
      >
        {/* Pre-title accent line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease }}
          className="w-10 h-[1px] bg-accent mb-6 md:mb-8 origin-left"
        />

        {/* Title — two-line stagger */}
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

        {/* Tagline with accent line */}
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

        {/* CTA button with arrow animation */}
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

      {/* Vertical scroll indicator — bottom-right */}
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

      {/* Section number — right-middle (desktop only) */}
      <div className="absolute top-1/2 -translate-y-1/2 right-6 md:right-12 z-10 hidden lg:block">
        <span className="font-mono text-[9px] text-tertiary/20 [writing-mode:vertical-lr] tracking-[0.3em]">
          001 &mdash; HERO
        </span>
      </div>
    </section>
  );
}
```

### Animation Timing Table

| Element | Delay | Duration | Effect |
|---------|-------|----------|--------|
| Accent line (scale-X) | 0.3s | 0.8s | scaleX 0→1 from left origin |
| Title line 1 | 0.5s | 0.9s | Y `110%`→`0` (slide up) |
| Title line 2 | 0.6s | 0.9s | Same |
| Tagline | 1.0s | 0.7s | Y 20→0, opacity 0→1 |
| CTA | 1.25s | 0.7s | Same |
| Scroll indicator | 2.5s | 1.0s | Opacity 0→1 |
| BG Ken Burns | continuous | — | scale 1.02→1.12 + Y 0→25% on scroll |
| CTA arrow | continuous | 2.5s | X `0,4,0` loop |

`ease` is imported from `@/lib/animations` — typically `[0.25, 0.1, 0.25, 1]` (cubic-bezier).

## Navbar (`navbar.tsx`)

Fixed sticky header with scroll-based hide/show and mobile fullscreen overlay.

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion";
import { ease } from "@/lib/animations";
import type { NavbarContent, SocialLinks, SectionsConfig } from "@/lib/config/landing-defaults";

const ALL_NAV_LINKS: { label: string; href: string; section: keyof SectionsConfig }[] = [
  { label: "Sobre mí", href: "#about", section: "about" },
  { label: "Galería", href: "#gallery", section: "gallery" },
  { label: "Logros", href: "#achievements", section: "achievements" },
  { label: "Blog", href: "#blog", section: "blog" },
  { label: "Contacto", href: "#contact", section: "contact" },
];

export function Navbar({ config, social, sections }: { config: NavbarContent; social: SocialLinks; sections: SectionsConfig }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const [lastY, setLastY] = useState(0);

  // Filter links by enabled sections, add numeric prefix
  const NAV_LINKS = ALL_NAV_LINKS
    .filter((link) => sections?.[link.section] !== false)
    .map((link, i) => ({ ...link, num: String(i + 1).padStart(2, "0") }));

  useMotionValueEvent(scrollY, "change", (v) => {
    setScrolled(v > 60);
    if (v > lastY && v > 400 && !mobileOpen) setHidden(true);
    else setHidden(false);
    setLastY(v);
  });

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      {/* Header — appears when scrolled past 60px, hides on scroll-down past 400px */}
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
          {/* Logo — bi-tone with hover underline */}
          <a href="#" className="relative group" onClick={closeMobile}>
            <span className="font-display text-lg md:text-xl font-bold tracking-[0.18em] uppercase text-primary transition-colors duration-300 group-hover:text-accent">
              {config.brandFirst}
            </span>
            <span className="font-display text-lg md:text-xl font-bold tracking-[0.18em] uppercase text-accent">
              {config.brandSecond}
            </span>
            <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-accent transition-all duration-500 group-hover:w-full" />
          </a>

          {/* Desktop nav with numbered prefix + underline-on-hover */}
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

          {/* Desktop CTA (gold fill) */}
          {sections?.contact !== false && (
            <a
              href="#contact"
              className="hidden lg:inline-block text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-void bg-accent px-5 py-2 hover:bg-accent-hover transition-colors duration-300"
            >
              {config.ctaText}
            </a>
          )}

          {/* Mobile hamburger — morphs to X */}
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

      {/* Mobile fullscreen menu — staggered entry */}
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

            {sections?.contact !== false && (
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

### Navbar Behavior Summary

1. **Scroll < 60px** — Transparent background, no blur
2. **Scroll ≥ 60px** — `bg-void/80` + `backdrop-blur-2xl` + subtle border + shadow
3. **Scroll down past 400px** — Hides (Y: -100, opacity 0)
4. **Scroll up** — Shows again
5. **Mobile hamburger** — Morphs to X via rotating lines
6. **Mobile menu** — Fullscreen blur overlay with staggered link reveal
