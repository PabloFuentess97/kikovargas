/* ═══════════════════════════════════════════════════════
   Landing Page Configuration — Types & Defaults
   ═══════════════════════════════════════════════════════ */

/* ─── Theme ───────────────────────────────────────── */

export interface ThemeConfig {
  accentColor: string;
  accentHover: string;
  bgVoid: string;
  bgSurface: string;
  bgElevated: string;
  textPrimary: string;
  textSecondary: string;
}

export const DEFAULT_THEME: ThemeConfig = {
  accentColor: "#c9a84c",
  accentHover: "#dfc06a",
  bgVoid: "#030303",
  bgSurface: "#070707",
  bgElevated: "#0f0f0f",
  textPrimary: "#ededed",
  textSecondary: "#7a7a7a",
};

/* ─── Section Visibility ──────────────────────────── */

export interface SectionsConfig {
  hero: boolean;
  about: boolean;
  stats: boolean;
  gallery: boolean;
  achievements: boolean;
  blog: boolean;
  contact: boolean;
}

export const DEFAULT_SECTIONS: SectionsConfig = {
  hero: true,
  about: true,
  stats: true,
  gallery: true,
  achievements: true,
  blog: true,
  contact: true,
};

/* ─── Hero Content ────────────────────────────────── */

export interface HeroContent {
  title: string;
  titleAccent: string;
  tagline: string;
  ctaText: string;
  ctaHref: string;
  backgroundImage: string;
}

export const DEFAULT_HERO: HeroContent = {
  title: "KIKO",
  titleAccent: "VARGAS",
  tagline: "IFBB Pro — Bodybuilder — Coach",
  ctaText: "Colaboraciones",
  ctaHref: "#contact",
  backgroundImage: "/images/hero-bg.jpg",
};

/* ─── About Content ───────────────────────────────── */

export interface AboutContent {
  heading: string;
  headingAccent: string;
  headingSuffix: string;
  paragraphs: string[];
  portraitImage: string;
  yearLabel: string;
  metrics: { num: string; text: string }[];
}

export const DEFAULT_ABOUT: AboutContent = {
  heading: "Mas que un",
  headingAccent: "deporte,",
  headingSuffix: "un estilo de vida",
  paragraphs: [
    "Llevo mas de 15 anos dedicado al bodybuilding competitivo. Lo que comenzo como una disciplina personal se convirtio en mi forma de vida, mi carrera y mi manera de inspirar a otros.",
    "Cada competencia es una prueba de compromiso. Cada entrenamiento es una decision de ser mejor. No busco atajos — busco resultados que hablen por si solos en el escenario.",
    "Hoy, ademas de competir a nivel profesional, me dedico a preparar atletas que quieran llevar su fisico al siguiente nivel.",
  ],
  portraitImage: "/images/about-portrait.jpg",
  yearLabel: "Est. 2009",
  metrics: [
    { num: "15+", text: "Anos compitiendo" },
    { num: "200+", text: "Atletas preparados" },
    { num: "3x", text: "Campeon nacional" },
  ],
};

/* ─── Stats Content ───────────────────────────────── */

export interface StatsContent {
  items: { value: number; suffix: string; label: string }[];
}

export const DEFAULT_STATS: StatsContent = {
  items: [
    { value: 15, suffix: "+", label: "Anos de experiencia" },
    { value: 3, suffix: "x", label: "Campeon nacional" },
    { value: 200, suffix: "+", label: "Atletas preparados" },
    { value: 12, suffix: "+", label: "Competencias IFBB" },
  ],
};

/* ─── Contact Content ─────────────────────────────── */

export interface ContactContent {
  heading: string;
  headingAccent: string;
  description: string;
  email: string;
  ctaText: string;
}

export const DEFAULT_CONTACT: ContactContent = {
  heading: "Hablemos de",
  headingAccent: "tu proyecto",
  description: "Sponsorships, colaboraciones con marcas, sesiones fotograficas y coaching personalizado para competidores.",
  email: "contacto@kikovargass.com",
  ctaText: "Enviar mensaje",
};

/* ─── Social Links ────────────────────────────────── */

export interface SocialLinks {
  instagram: string;
  youtube: string;
  tiktok: string;
  instagramHandle: string;
  youtubeHandle: string;
  tiktokHandle: string;
}

export const DEFAULT_SOCIAL: SocialLinks = {
  instagram: "https://instagram.com/kikovargass",
  youtube: "https://youtube.com/@kikovargass",
  tiktok: "https://tiktok.com/@kikovargass",
  instagramHandle: "@kikovargass",
  youtubeHandle: "Kiko Vargas",
  tiktokHandle: "@kikovargass",
};

/* ─── Navbar Content ──────────────────────────────── */

export interface NavbarContent {
  brandFirst: string;
  brandSecond: string;
  ctaText: string;
}

export const DEFAULT_NAVBAR: NavbarContent = {
  brandFirst: "Kiko",
  brandSecond: "Vargas",
  ctaText: "Hablemos",
};

/* ─── Full Landing Config ─────────────────────────── */

export interface LandingConfig {
  theme: ThemeConfig;
  sections: SectionsConfig;
  hero: HeroContent;
  about: AboutContent;
  stats: StatsContent;
  contact: ContactContent;
  social: SocialLinks;
  navbar: NavbarContent;
}

export const DEFAULT_CONFIG: LandingConfig = {
  theme: DEFAULT_THEME,
  sections: DEFAULT_SECTIONS,
  hero: DEFAULT_HERO,
  about: DEFAULT_ABOUT,
  stats: DEFAULT_STATS,
  contact: DEFAULT_CONTACT,
  social: DEFAULT_SOCIAL,
  navbar: DEFAULT_NAVBAR,
};

/* ─── Config Keys (DB storage keys) ───────────────── */

export const CONFIG_KEYS = [
  "theme",
  "sections",
  "hero",
  "about",
  "stats",
  "contact",
  "social",
  "navbar",
] as const;

export type ConfigKey = (typeof CONFIG_KEYS)[number];
