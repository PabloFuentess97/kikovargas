/* ─── Block Type Definitions ─────────────────────── */

export const BLOCK_TYPES = ["hero", "text", "image", "cta", "gallery", "form", "countdown", "faq", "testimonials", "video", "pricing", "stats", "divider", "features"] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export interface BlockData {
  [key: string]: unknown;
}

export interface EventBlockRecord {
  id: string;
  type: string;
  data: BlockData;
  order: number;
  pageId: string;
}

/* ─── Block-specific Data Interfaces ─────────────── */

export interface HeroData {
  title?: string;
  subtitle?: string;
  backgroundUrl?: string;
  ctaText?: string;
  ctaHref?: string;
}

export interface TextData {
  heading?: string;
  body?: string;
  align?: "left" | "center" | "right";
}

export interface ImageData {
  url?: string;
  alt?: string;
  caption?: string;
}

export interface CtaData {
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  variant?: "primary" | "outline";
}

export interface GalleryData {
  images?: { url: string; alt?: string }[];
  columns?: number;
}

export interface FormData {
  heading?: string;
  description?: string;
  buttonText?: string;
  fields?: ("name" | "email" | "phone" | "message")[];
}

export interface CountdownData {
  targetDate?: string; // ISO 8601
  heading?: string;
  description?: string;
}

export interface FaqData {
  heading?: string;
  items?: { question: string; answer: string }[];
}

export interface TestimonialsData {
  heading?: string;
  items?: { name: string; role?: string; text: string; avatar?: string }[];
}

export interface VideoData {
  heading?: string;
  description?: string;
  url?: string; // YouTube or Vimeo URL
}

export interface PricingData {
  heading?: string;
  description?: string;
  plans?: {
    name: string;
    price: string;
    period?: string;
    features: string[];
    buttonText: string;
    buttonHref: string;
    highlighted?: boolean;
  }[];
}

export interface StatsData {
  heading?: string;
  items?: { value: string; label: string }[];
}

export interface DividerData {
  label?: string;
  style?: "line" | "dots" | "space";
}

export interface FeaturesData {
  heading?: string;
  description?: string;
  items?: { icon?: string; title: string; description: string }[];
  columns?: number;
}

/* ─── Block label map for admin ──────────────────── */

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Hero / Cabecera",
  text: "Texto",
  image: "Imagen",
  cta: "Call to Action",
  gallery: "Galeria",
  form: "Formulario",
  countdown: "Cuenta Regresiva",
  faq: "Preguntas Frecuentes",
  testimonials: "Testimonios",
  video: "Video",
  pricing: "Precios",
  stats: "Estadisticas",
  divider: "Separador",
  features: "Caracteristicas",
};

/* ─── Default data for each block type ───────────── */

export const BLOCK_DEFAULTS: Record<BlockType, BlockData> = {
  hero: { title: "Titulo del evento", subtitle: "Descripcion breve del evento", ctaText: "Registrate ahora", ctaHref: "#form" },
  text: { heading: "Seccion de texto", body: "Escribe el contenido aqui...", align: "center" },
  image: { url: "", alt: "Imagen del evento", caption: "" },
  cta: { heading: "No te lo pierdas", description: "Plazas limitadas", buttonText: "Reserva tu plaza", buttonHref: "#form", variant: "primary" },
  gallery: { images: [], columns: 3 },
  form: { heading: "Registrate", description: "Completa el formulario para reservar tu plaza", buttonText: "Enviar", fields: ["name", "email", "phone"] },
  countdown: { targetDate: new Date(Date.now() + 7 * 86400000).toISOString(), heading: "El evento comienza en", description: "" },
  faq: { heading: "Preguntas frecuentes", items: [{ question: "Pregunta de ejemplo?", answer: "Respuesta de ejemplo." }] },
  testimonials: { heading: "Lo que dicen nuestros alumnos", items: [{ name: "Nombre", role: "Alumno", text: "Testimonio de ejemplo..." }] },
  video: { heading: "Mira el video", description: "", url: "" },
  pricing: { heading: "Elige tu plan", description: "", plans: [{ name: "Basico", price: "49€", period: "/mes", features: ["Caracteristica 1"], buttonText: "Elegir plan", buttonHref: "#form", highlighted: false }] },
  stats: { heading: "", items: [{ value: "100+", label: "Alumnos" }] },
  divider: { label: "", style: "line" },
  features: { heading: "Que incluye", description: "", items: [{ icon: "✓", title: "Caracteristica", description: "Descripcion de la caracteristica" }], columns: 3 },
};
