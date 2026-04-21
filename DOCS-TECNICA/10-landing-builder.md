# 10 · Landing Builder (Event Pages)

## Propósito

Sistema para crear landing pages independientes (webinars, eventos, servicios) sin escribir código. Basado en composición de bloques.

## Modelos de DB

- `EventPage` — página contenedora con metadata
- `EventBlock` — bloque individual con `type: string`, `data: JSONB`, `order: int`
- `EventLead` — submisión de formulario en una page

Ver `03-database.md` para schema completo.

## Los 14 tipos de bloque

**Archivo de definición:** `src/components/event-blocks/types.ts`

```typescript
export const BLOCK_TYPES = [
  "hero", "text", "image", "cta", "gallery", "form",
  "countdown", "faq", "testimonials", "video",
  "pricing", "stats", "divider", "features"
] as const;

export type BlockType = typeof BLOCK_TYPES[number];
```

### Data interfaces

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
  url?: string;             // YouTube o Vimeo
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

### Labels para el admin

```typescript
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
  features: "Caracteristicas"
};
```

### Defaults

```typescript
export const BLOCK_DEFAULTS: Record<BlockType, BlockData> = {
  hero: { title: "Titulo del evento", subtitle: "Descripcion breve", ctaText: "Registrate ahora", ctaHref: "#form" },
  text: { heading: "Seccion de texto", body: "Escribe el contenido aqui...", align: "center" },
  image: { url: "", alt: "Imagen del evento", caption: "" },
  cta: { heading: "No te lo pierdas", description: "Plazas limitadas", buttonText: "Reserva tu plaza", buttonHref: "#form", variant: "primary" },
  gallery: { images: [], columns: 3 },
  form: { heading: "Registrate", description: "Completa el formulario", buttonText: "Enviar", fields: ["name", "email", "phone"] },
  countdown: { targetDate: new Date(Date.now() + 7 * 86400000).toISOString(), heading: "El evento comienza en", description: "" },
  faq: { heading: "Preguntas frecuentes", items: [{ question: "Pregunta?", answer: "Respuesta." }] },
  testimonials: { heading: "Lo que dicen nuestros alumnos", items: [{ name: "Nombre", role: "Alumno", text: "Testimonio..." }] },
  video: { heading: "Mira el video", description: "", url: "" },
  pricing: { heading: "Elige tu plan", plans: [{ name: "Basico", price: "49€", period: "/mes", features: ["Caracteristica 1"], buttonText: "Elegir", buttonHref: "#form", highlighted: false }] },
  stats: { items: [{ value: "100+", label: "Alumnos" }] },
  divider: { label: "", style: "line" },
  features: { heading: "Que incluye", items: [{ icon: "✓", title: "Caracteristica", description: "Descripcion" }], columns: 3 }
};
```

## Dispatcher de renderizado

**Archivo:** `src/components/event-blocks/block-renderer.tsx`

```typescript
import { HeroBlock } from "./blocks/hero-block";
import { TextBlock } from "./blocks/text-block";
// ... importa los 14 componentes

const BLOCK_MAP: Record<string, React.ComponentType<any>> = {
  hero: HeroBlock,
  text: TextBlock,
  image: ImageBlock,
  cta: CtaBlock,
  gallery: GalleryBlock,
  form: FormBlock,
  countdown: CountdownBlock,
  faq: FaqBlock,
  testimonials: TestimonialsBlock,
  video: VideoBlock,
  pricing: PricingBlock,
  stats: StatsBlock,
  divider: DividerBlock,
  features: FeaturesBlock
};

export function BlockRenderer({
  type,
  data,
  pageId
}: {
  type: string;
  data: Record<string, unknown>;
  pageId: string;
}) {
  const Component = BLOCK_MAP[type];
  if (!Component) {
    console.warn(`Unknown block type: ${type}`);
    return null;
  }
  return <Component data={data} pageId={pageId} />;
}
```

## Renderizado público

**Ruta:** `/event/[slug]/page.tsx`

```typescript
export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const page = await prisma.eventPage.findUnique({
    where: { slug },
    include: {
      blocks: { orderBy: { order: "asc" } }
    }
  });

  if (!page || page.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <main>
      {page.blocks.map(block => (
        <BlockRenderer
          key={block.id}
          type={block.type}
          data={block.data as Record<string, unknown>}
          pageId={page.id}
        />
      ))}
    </main>
  );
}
```

**Nota:** solo páginas `PUBLISHED` son accesibles. `DRAFT` y `ARCHIVED` devuelven 404.

## Bloques especiales con lógica propia

### FormBlock
Renderiza un `<form>` con los campos especificados en `data.fields`. On submit:
```typescript
const res = await fetch("/api/event-leads", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ pageId, name, email, phone, message })
});
```
Muestra estado de éxito/error inline.

### CountdownBlock
`"use client"`. Usa `useEffect` con `setInterval(1000)` para actualizar el display cada segundo. Muestra días/horas/minutos/segundos hasta `data.targetDate`.

### VideoBlock
Extrae el ID del video de YouTube o Vimeo de la URL y genera iframe embed:
```typescript
function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m?.[1] || null;
}
```

### GalleryBlock
Simple grid CSS con `grid-cols-{columns}`. Las imágenes vienen de `data.images` (no de la galería global, son específicas de este bloque).

### PricingBlock
Renderiza N tarjetas en grid. La tarjeta con `highlighted: true` tiene borde y fondo accent.

## Plantillas predefinidas

**Archivo:** `src/lib/event-templates.ts`

```typescript
export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  blocks: { type: string; data: Record<string, unknown> }[];
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: "webinar",
    name: "Webinar",
    description: "Página de registro para webinar",
    blocks: [
      { type: "hero", data: { title: "Webinar gratuito", subtitle: "...", ... }},
      { type: "stats", data: { ... }},
      { type: "features", data: { ... }},
      { type: "countdown", data: { targetDate: "+7 días", ... }},
      { type: "testimonials", data: { ... }},
      { type: "faq", data: { ... }},
      { type: "form", data: { heading: "Regístrate", ... }},
      // ... total 11 bloques
    ]
  },
  {
    id: "fitness",
    name: "Evento Fitness",
    description: "Evento presencial",
    blocks: [/* 12 bloques con 2 planes de precios */]
  },
  {
    id: "coaching",
    name: "Coaching",
    description: "Servicio de coaching online",
    blocks: [/* 12 bloques con 3 planes de precios */]
  }
];
```

### Flujo de creación con template

```typescript
// Cliente (event-page-list.tsx)
async function createPage(title: string, slug: string, templateId: string) {
  // 1. Crea page
  const res = await fetch("/api/event-pages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, slug, template: templateId })
  });
  const { data: page } = await res.json();

  // 2. Si template no es "custom", crea bloques del template
  if (templateId !== "custom") {
    const template = EVENT_TEMPLATES.find(t => t.id === templateId);
    for (const block of template.blocks) {
      await fetch(`/api/event-pages/${page.id}/blocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: block.type, data: block.data })
      });
    }
  }

  // 3. Navega al editor
  router.push(`/dashboard/event-pages/${page.id}`);
}
```

**Limitación:** si se crean muchos bloques, los N POSTs secuenciales toman tiempo visible (varios segundos). Mejora: endpoint batch.

## Editor admin

Ver `05-admin-panel.md` para detalle del editor. Puntos clave:

- **Auto-save con debounce 800ms** por bloque.
- **Drag-and-drop nativo HTML5** para reordenar.
- **Duplicate**: crea copia del bloque con mismo type + data.
- **Visual preview** por bloque renderizando una miniatura.
- **Sub-editores específicos** para bloques con arrays (gallery, faq, testimonials, pricing, stats, features).

## CRUD endpoints

Ver `04-api.md`:
- `GET /api/event-pages` — listar
- `POST /api/event-pages` — crear
- `GET /api/event-pages/:id` — con bloques
- `PATCH /api/event-pages/:id` — actualizar metadata
- `DELETE /api/event-pages/:id` — cascades blocks + leads
- `POST /api/event-pages/:id/blocks` — crear O reordenar (el handler detecta)
- `PATCH /api/event-pages/:id/blocks/:blockId` — actualizar data
- `DELETE /api/event-pages/:id/blocks/:blockId` — borrar + reordenar restantes

## Captura de leads

### Endpoint `POST /api/event-leads`

**Auth:** Public
**Body:** `{ pageId, name (2-100), email (valid), phone? (max 30), message? (max 500) }`

**Validaciones:**
1. `EventPage` existe.
2. `EventPage.status === "PUBLISHED"` (422 si no).

**Efectos (fire-and-forget):**
1. Crea `EventLead`.
2. Crea `Contact` (para CRM centralizado).
3. Dispara email admin.

### UI del lead

En admin, `/dashboard/event-pages` muestra count de leads por page. Al abrir la page, hay sección/tab con la lista de leads + export opcional.

También aparecen en `/dashboard/contacts` como contactos regulares.

## CSS y tema

Los bloques públicos heredan del **tema landing** (`:root` vars), no del tema admin. Usan tokens como:
- `bg-void`, `bg-surface`, `bg-elevated`
- `text-primary`, `text-secondary`
- `accent`, `accent-hover`, `accent-dim`
- `container-landing` para contenedor centrado

Esto asegura consistencia visual con el resto de la landing principal.

## Extensibilidad — añadir un nuevo tipo de bloque

1. **Definir interface** en `src/components/event-blocks/types.ts`:
   ```typescript
   interface PodcastData {
     title: string;
     episodeUrl: string;
     duration?: string;
   }
   ```

2. **Añadir a `BLOCK_TYPES`** const array:
   ```typescript
   export const BLOCK_TYPES = [..., "podcast"] as const;
   ```

3. **Añadir a `BLOCK_LABELS`**:
   ```typescript
   podcast: "Podcast",
   ```

4. **Añadir a `BLOCK_DEFAULTS`**:
   ```typescript
   podcast: { title: "Mi podcast", episodeUrl: "" },
   ```

5. **Crear componente** `src/components/event-blocks/blocks/podcast-block.tsx`.

6. **Registrar en `BLOCK_MAP`** de `block-renderer.tsx`.

7. **Actualizar `POST /api/event-pages/:id/blocks`** Zod enum con el nuevo tipo.

8. **Añadir al picker del editor** (en `event-editor.tsx`, dentro de `BLOCK_CATEGORIES`).

9. **Opcional: sub-editor** si necesita fields dinámicos complejos.
