# Design System — Components

## Landing Page Components

**Directory:** `src/components/landing/`

| Component | File | Purpose |
|-----------|------|---------|
| `HeroSection` | `hero-section.tsx` | Full-height hero with parallax BG, animated text reveal, CTA |
| `AboutSection` | `about-section.tsx` | Portrait + 3 paragraphs + 3 metrics |
| `StatsBar` | `stats-bar.tsx` | Animated counter stats (4 items) |
| `AchievementsSection` | `achievements-section.tsx` | Timeline of competitive achievements |
| `GallerySection` | `gallery-section.tsx` | Fetches images, renders `<GalleryGrid>` |
| `GalleryGrid` | `gallery-grid.tsx` | Masonry grid + lightbox modal + keyboard nav |
| `BlogSection` | `blog-section.tsx` | Fetches posts, renders `<BlogCards>` |
| `BlogCards` | `blog-cards.tsx` | 3-column responsive post grid with metadata |
| `ContactSection` | `contact-section.tsx` | Form + social/email info panel |
| `NewsletterSection` | `newsletter-section.tsx` | Subscription form w/ validation & success state |
| `Navbar` | `navbar.tsx` | Fixed sticky header + mobile hamburger menu |
| `Footer` | `footer.tsx` | CTA strip + nav + legal + copyright |
| `Divider` | `divider.tsx` | Animated gradient separator |
| `ThemeProvider` | `theme-provider.tsx` | Theme context wrapper |
| `SectionWrapper` | `section-wrapper.tsx` | Shared section layout |
| `LegalLayout` | `legal-layout.tsx` | Layout for privacy/terms/cookies pages |

### Landing component prop signatures

```typescript
// HeroSection
{ config: HeroContent }
// HeroContent: { title, titleAccent, tagline, ctaText, ctaHref, backgroundImage }

// AboutSection
{ config: AboutContent }
// AboutContent: { heading, headingAccent, headingSuffix, paragraphs[], portraitImage, yearLabel, metrics[] }

// StatsBar
{ config: StatsContent }
// StatsContent: { items: { value: number, suffix: string, label: string }[] }

// GalleryGrid
{ images: GalleryImage[] }
// GalleryImage: { id, url, alt }
// Layout: index 0 = 2x2 span, index 3 = row-span-2, others = 1x1

// BlogCards
{ posts: BlogPost[] }
// Shows max 3 posts, computes reading time

// ContactSection
{ config: ContactContent; social: SocialLinks }

// NewsletterSection
// no props (self-contained state)

// Navbar
{ config: NavbarContent; social: SocialLinks; sections: SectionsConfig }

// Footer
{ social: SocialLinks; navbar: NavbarContent; sections: SectionsConfig }
```

## Admin UI Primitives

**Directory:** `src/components/admin/ui/`

Exported from `src/components/admin/ui/index.ts` as a barrel.

### Button

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button(props): JSX.Element
export function LinkButton({ href, variant, size, children, icon, className }): JSX.Element
```

**Variant classes:**
```
primary:   bg-a-accent text-black hover:bg-a-accent-hover
secondary: border border-border text-muted hover:border-foreground/20
danger:    border border-danger/20 text-danger hover:bg-danger/10
ghost:     text-muted hover:text-foreground hover:bg-card-hover
```

**Size classes:**
```
sm: px-3 py-1.5 text-xs
md: px-4 py-2.5 text-sm
lg: px-6 py-3 text-sm
```

### Card

```typescript
interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  as?: "div" | "article" | "section";
}

export function Card(props)
export function CardHeader({ title: string; action?: ReactNode; className })
export function CardContent({ children; className; padded?: boolean })
```

### Badge

```typescript
type BadgeVariant = "warning" | "success" | "danger" | "info" | "muted" | "accent";

export function Badge({ children, variant, dot, className })
export function StatusDot({ active: boolean; label?: string })
export function PostStatusBadge({ status: "DRAFT"|"PUBLISHED"|"ARCHIVED" })
export function ContactStatusBadge({ status: "PENDING"|"READ"|"REPLIED"|"ARCHIVED" })

// Status maps
POST_STATUS_MAP: { DRAFT: warning, PUBLISHED: success, ARCHIVED: muted }
CONTACT_STATUS_MAP: { PENDING: warning, READ: info, REPLIED: success, ARCHIVED: muted }
```

### Form Elements

```typescript
export function FormField({ children, className })
export function FormLabel({ htmlFor, children, optional, aside, className })
export function FormInput({ error?: string, ...InputHTMLAttributes })
export function FormTextarea({ error?: string, ...TextareaHTMLAttributes })
export function FormSelect({ error?: string, children, ...SelectHTMLAttributes })
export function FormError({ message: string })
export function FormActions({ children })
```

### Table

```typescript
export function Table({ children, className })
export function TableHead({ children })
export function TableHeader({ children, align?: "left"|"center"|"right", className })
export function TableBody({ children })
export function TableRow({ children, className })
export function TableCell({ children, align, colSpan, className })
export function TableEmpty({ colSpan: number; icon; message; action? })
```

### PageHeader

```typescript
interface BreadcrumbItem { label: string; href?: string }

export function Breadcrumb({ items: BreadcrumbItem[] })
export function PageHeader({ title, subtitle, eyebrow, action, breadcrumb, className })
```

### StatCard

```typescript
interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;        // Sub-label (e.g., "+12% this month")
  href?: string;       // Optional link; renders <Link> if present
  accent?: boolean;    // Use gold accent styling
  icon?: ReactNode;
}

// Numbers formatted with Intl.NumberFormat("es-MX")
```

### EmptyState

```typescript
interface EmptyStateProps {
  icon: ReactNode;
  message: string;
  action?: ReactNode;
  className?: string;
}
```

### ProgressBar

```typescript
interface ProgressBarProps {
  value: number;
  max?: number;       // default 100
  label?: string;
  detail?: string;    // e.g., "42 / 100"
  className?: string;
}
// Animated fill with gold accent color
```

### InfoRow

```typescript
interface InfoRowProps {
  label: string;
  value: string;
  href?: string;    // If present, renders as link (tel:, mailto:, or URL)
}
```

## Event Block Components

**Directory:** `src/components/event-blocks/blocks/`

14 block components for the Landing Builder, each rendering one of the block types:

- `HeroBlock`
- `TextBlock`
- `ImageBlock`
- `CtaBlock`
- `GalleryBlock`
- `FormBlock`
- `CountdownBlock`
- `FaqBlock`
- `TestimonialsBlock`
- `VideoBlock`
- `PricingBlock`
- `StatsBlock`
- `DividerBlock`
- `FeaturesBlock`

**Central dispatcher:** `src/components/event-blocks/block-renderer.tsx`
```typescript
const BLOCK_MAP = {
  hero: HeroBlock,
  text: TextBlock,
  // ... all 14
};

export function BlockRenderer({ type, data, pageId }) {
  const Component = BLOCK_MAP[type];
  return <Component data={data} pageId={pageId} />;
}
```

## Knowledge Base Components

**Directory:** `src/app/(admin)/dashboard/knowledge/`

- `knowledge-base.tsx` — Main client component (home grid, category sidebar, article view, edit modal)
- `kb-content.ts` — Static content (9 categories, 30+ articles)

Features: search, Ctrl+K, reading time, TOC extraction, code block copy, editable via DB.

## UI Patterns

### Eyebrow Label Pattern
```html
<div class="section-label">
  <!-- ::before pseudo renders the gold line -->
  Blog
</div>
```

### Bi-tone Heading Pattern
Used in all section headings:
```html
<h2 class="section-heading">
  El camino se
  <span class="text-accent">documenta</span>
</h2>
```

### Card Hover Pattern
```css
border → gold tint + subtle shadow + slight translateY
```

### Breadcrumb Pattern (admin)
```
Inicio › Categoria › Articulo
```
With ChevronIcon separators and hover states.

### Inline Auto-save Pattern (event editor)
```
[•  Guardando...]   →  [✓  Guardado]
```
Debounced 800ms via useRef timer.
