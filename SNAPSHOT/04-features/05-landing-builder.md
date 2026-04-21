# Feature — Landing Page Builder (Event Pages)

## Overview

Block-based landing page builder to create standalone pages for events, webinars, services, or promotions. Each page is made up of ordered blocks, with 14 block types covering all common needs (hero, text, CTA, pricing, testimonials, etc.).

## Data Model

### EventPage
```typescript
{
  id: string,
  slug: string (unique),         // URL: /event/{slug}
  title: string,
  description: string,           // SEO description
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
  template: "custom" | "webinar" | "fitness" | "coaching",
  blocks: EventBlock[],
  leads: EventLead[]
}
```

### EventBlock
```typescript
{
  id: string,
  type: string,                  // One of 14 types
  data: Json,                    // Block-specific payload
  order: number,                 // Sort order
  pageId: FK → EventPage (cascade)
}
```

### EventLead
```typescript
{
  id: string,
  name: string,
  email: string,
  phone: string,
  message: string,
  pageId: FK → EventPage (cascade)
}
```

## The 14 Block Types

| Type | Label | Purpose |
|------|-------|---------|
| `hero` | Hero / Cabecera | Main banner, title + subtitle + CTA |
| `text` | Texto | Rich text section |
| `image` | Imagen | Single image with caption |
| `cta` | Call to Action | Button-focused section |
| `gallery` | Galería | Grid of images |
| `form` | Formulario | Lead capture (configurable fields) |
| `countdown` | Cuenta Regresiva | Timer until target date |
| `faq` | Preguntas Frecuentes | Accordion Q&A |
| `testimonials` | Testimonios | Quotes with name, role, avatar |
| `video` | Video | YouTube/Vimeo embed |
| `pricing` | Precios | Pricing plans comparison |
| `stats` | Estadísticas | Number highlights |
| `divider` | Separador | Line / dots / space |
| `features` | Características | Icon grid with title+description |

## Block Data Schemas (TypeScript)

```typescript
interface HeroData {
  title?: string;
  subtitle?: string;
  backgroundUrl?: string;
  ctaText?: string;
  ctaHref?: string;
}

interface TextData {
  heading?: string;
  body?: string;
  align?: "left" | "center" | "right";
}

interface ImageData {
  url?: string;
  alt?: string;
  caption?: string;
}

interface CtaData {
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  variant?: "primary" | "outline";
}

interface GalleryData {
  images?: { url: string; alt?: string }[];
  columns?: number;
}

interface FormData {
  heading?: string;
  description?: string;
  buttonText?: string;
  fields?: ("name" | "email" | "phone" | "message")[];
}

interface CountdownData {
  targetDate?: string;      // ISO 8601
  heading?: string;
  description?: string;
}

interface FaqData {
  heading?: string;
  items?: { question: string; answer: string }[];
}

interface TestimonialsData {
  heading?: string;
  items?: { name: string; role?: string; text: string; avatar?: string }[];
}

interface VideoData {
  heading?: string;
  description?: string;
  url?: string;             // YouTube or Vimeo
}

interface PricingData {
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

interface StatsData {
  heading?: string;
  items?: { value: string; label: string }[];
}

interface DividerData {
  label?: string;
  style?: "line" | "dots" | "space";
}

interface FeaturesData {
  heading?: string;
  description?: string;
  items?: { icon?: string; title: string; description: string }[];
  columns?: number;
}
```

## Default Block Values

```typescript
const BLOCK_DEFAULTS: Record<BlockType, BlockData> = {
  hero: {
    title: "Titulo del evento",
    subtitle: "Descripcion breve del evento",
    ctaText: "Registrate ahora",
    ctaHref: "#form"
  },
  text: {
    heading: "Seccion de texto",
    body: "Escribe el contenido aqui...",
    align: "center"
  },
  image: { url: "", alt: "Imagen del evento", caption: "" },
  cta: {
    heading: "No te lo pierdas",
    description: "Plazas limitadas",
    buttonText: "Reserva tu plaza",
    buttonHref: "#form",
    variant: "primary"
  },
  gallery: { images: [], columns: 3 },
  form: {
    heading: "Registrate",
    description: "Completa el formulario para reservar tu plaza",
    buttonText: "Enviar",
    fields: ["name", "email", "phone"]
  },
  countdown: {
    targetDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    heading: "El evento comienza en",
    description: ""
  },
  faq: {
    heading: "Preguntas frecuentes",
    items: [{ question: "Pregunta de ejemplo?", answer: "Respuesta de ejemplo." }]
  },
  testimonials: {
    heading: "Lo que dicen nuestros alumnos",
    items: [{ name: "Nombre", role: "Alumno", text: "Testimonio de ejemplo..." }]
  },
  video: { heading: "Mira el video", description: "", url: "" },
  pricing: {
    heading: "Elige tu plan",
    description: "",
    plans: [{
      name: "Basico",
      price: "49€",
      period: "/mes",
      features: ["Caracteristica 1"],
      buttonText: "Elegir plan",
      buttonHref: "#form",
      highlighted: false
    }]
  },
  stats: { heading: "", items: [{ value: "100+", label: "Alumnos" }] },
  divider: { label: "", style: "line" },
  features: {
    heading: "Que incluye",
    description: "",
    items: [{ icon: "✓", title: "Caracteristica", description: "Descripcion" }],
    columns: 3
  }
};
```

## Templates

Pre-built configurations that auto-create blocks when a new page is created.

### `custom` — Empty
0 blocks. Start from scratch.

### `webinar` — 11 blocks
Hero, Stats, Features, Countdown, Testimonials, FAQ, Form, ...

### `fitness` — 12 blocks
Evento presencial with 2 price plans (General €49, VIP €89).

### `coaching` — 12 blocks
Online coaching with 3 price plans (Esencial €149, Premium €249, Competición €349).

Defined in `src/lib/event-templates.ts`.

## Admin Editor Workflow

### Create page
1. Navigate to `/dashboard/event-pages`
2. Click `+ Nueva landing page`
3. Enter title + slug
4. Select template
5. Click `Crear pagina`

If template != custom, the UI then auto-creates all template blocks via `POST /api/event-pages/{id}/blocks` (one per block).

### Edit blocks

**File:** `src/app/(admin)/dashboard/event-pages/[id]/event-editor.tsx`

Features:
- **Visual preview** — Each block shows a miniature rendering of its actual data
- **Expand/collapse** — Click to reveal edit fields
- **Auto-save** — Debounced 800ms on any field change
- **Drag reorder** — HTML5 drag-and-drop with visual feedback
- **Duplicate** — Creates a copy of the block
- **Delete** — With confirmation
- **Inline preview text** — Shows summary in collapsed header

**Saving indicator:**
```
[•  Guardando]   ← orange dot pulse
[✓  Guardado]    ← green check fade
```

### Block categorization in the picker

When clicking "Agregar bloque":
- **Contenido:** hero, text, image, video, gallery
- **Conversion:** cta, form, pricing, countdown
- **Social proof:** testimonials, stats, faq, features
- **Layout:** divider

## Public Page

### `/event/{slug}`

Dynamically renders blocks in order using `<BlockRenderer type={block.type} data={block.data} />`.

Only PUBLISHED pages are accessible; DRAFT/ARCHIVED return 404.

### Block Rendering

**File:** `src/components/event-blocks/block-renderer.tsx`
```typescript
const BLOCK_MAP = {
  hero: HeroBlock,
  text: TextBlock,
  // ...
};

export function BlockRenderer({ type, data, pageId }) {
  const Component = BLOCK_MAP[type];
  if (!Component) return null;
  return <Component data={data} pageId={pageId} />;
}
```

## Lead Capture

When a Form block is submitted:
```http
POST /api/event-leads
Body: {
  pageId: string,
  name: string,
  email: string,
  phone?: string,
  message?: string
}
```

- Creates `EventLead` record
- Creates `Contact` record (fire-and-forget)
- Sends notification email to admin

## Admin API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/event-pages` | List all pages |
| POST | `/api/event-pages` | Create page |
| GET | `/api/event-pages/:id` | Get page with blocks |
| PATCH | `/api/event-pages/:id` | Update (title, status, description) |
| DELETE | `/api/event-pages/:id` | Delete (cascades blocks + leads) |
| POST | `/api/event-pages/:id/blocks` | Add block OR reorder (based on body) |
| PATCH | `/api/event-pages/:id/blocks/:blockId` | Update block data |
| DELETE | `/api/event-pages/:id/blocks/:blockId` | Delete + reorder remaining |
| GET | `/api/event-leads?pageId=...` | List leads (filter by page) |
| POST | `/api/event-leads` | Public — submit lead |

## CSS

Public pages inherit the landing theme (`:root` variables). Each block component uses Tailwind utilities + landing tokens (`accent`, `surface`, `elevated`, etc.) for consistent styling across the site.
