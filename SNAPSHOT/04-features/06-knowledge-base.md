# Feature — Knowledge Base (In-app Help)

## Overview

Professional SaaS-style in-app documentation at `/dashboard/knowledge`. Complete help system with:
- 9 categories, 30+ articles
- Full-text search (Ctrl+K)
- Table of contents auto-extracted from h2 headings
- Reading time estimation
- Copy-to-clipboard for code blocks
- Prev/next article navigation
- Styled callout boxes (info, warning)
- **Editable from admin panel** (DB-backed with static fallback)

## Categories

| ID | Icon | Label | Description |
|----|------|-------|-------------|
| `getting-started` | 🚀 | Primeros pasos | Aprende a usar tu panel desde cero |
| `api-config` | 🔑 | Configuracion de APIs | Conecta OpenAI, Ollama y Resend |
| `blog` | 📝 | Blog | Crea, edita y publica articulos con IA |
| `gallery` | 🖼️ | Galeria de imagenes | Sube y organiza fotos |
| `booking` | 📅 | Sistema de reservas | Crea enlaces y gestiona agenda |
| `landing-builder` | 🏗️ | Landing Pages | Crea paginas profesionales |
| `ai-content` | 🤖 | Inteligencia artificial | Genera ideas, articulos e imagenes |
| `email-system` | 📧 | Emails y newsletter | Envia campanas y notificaciones |
| `contacts` | 👥 | Contactos y leads | Gestion CRM |
| `troubleshooting` | 🔧 | Solucion de problemas | Problemas comunes |

## Article Structure

Every article is HTML with these class conventions:

### Info callout (green)
```html
<div class="kb-info">
  <strong>Consejo:</strong> Texto informativo...
</div>
```

### Warning callout (amber)
```html
<div class="kb-warning">
  <strong>Importante:</strong> Advertencia...
</div>
```

### Code block (monospace, with copy button)
```html
<div class="kb-code">ollama pull llama3</div>
```

### Inline code (gold tint)
```html
Abre <code>Configuracion > IA</code> para cambiar...
```

## Data Models

### KbCategory
```typescript
{
  id: string,            // e.g., "getting-started"
  label: string,         // "Primeros pasos"
  icon: string,          // "🚀"
  description: string,
  sortOrder: number
}
```

### KbArticle
```typescript
{
  id: string,            // e.g., "getting-started/welcome"
  categoryId: string,    // "getting-started"
  title: string,
  content: string,       // Full HTML
  sortOrder: number
}
```

## Static vs. Database Mode

**Default:** Articles come from `src/app/(admin)/dashboard/knowledge/kb-content.ts` (hardcoded).

**Editable mode:** When admin clicks "Sincronizar con base de datos":
1. POST `/api/kb/seed` copies all static content to `kb_categories` and `kb_articles` tables
2. Subsequent GETs to `/api/kb/articles` return DB content (overrides static)
3. Edit button appears on each article

## UI Components

**File:** `src/app/(admin)/dashboard/knowledge/knowledge-base.tsx`

### Home view
- Hero with book icon
- Search bar (Ctrl+K focuses it)
- Grid of category cards (3 columns desktop, 2 tablet, 1 mobile)
- Each card shows: icon, label, description, article count, first 2 article titles

### Article view
- Left sidebar with collapsed categories (expanded for current)
- Main area:
  - Breadcrumb (Inicio › Category › Article)
  - Title + edit button (DB mode only)
  - Reading time + category
  - Table of contents (shown if ≥3 h2 headings)
  - Article content
  - Prev/Next buttons at bottom

### Edit modal
- Title input
- Content textarea (HTML, monospace font)
- Reference showing available classes: `kb-info`, `kb-warning`, `kb-code`
- Live preview below (renders the HTML)
- Save → PATCH to `/api/kb/articles/:id`

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/kb/articles` | Fetch all categories + articles from DB |
| PATCH | `/api/kb/articles/:id` | Update title or content |
| POST | `/api/kb/seed` | Seed DB from static content (idempotent) |

## Search Implementation

```typescript
const searchResults = useMemo(() => {
  if (!search.trim()) return null;
  const q = search.toLowerCase();
  const results = [];
  for (const cat of categories) {
    for (const art of cat.articles) {
      const titleMatch = art.title.toLowerCase().includes(q);
      const contentMatch = art.content.toLowerCase().includes(q);
      if (titleMatch || contentMatch) {
        results.push({
          category: cat,
          article: art,
          matchType: titleMatch ? "title" : "content"
        });
      }
    }
  }
  // Title matches first
  results.sort((a, b) => a.matchType === "title" ? -1 : 1);
  return results;
}, [search, categories]);
```

## Reading Time Calculation

```typescript
function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ");
  const words = text.split(" ").length;
  return Math.max(1, Math.ceil(words / 200));  // 200 WPM
}
```

## TOC Auto-Extraction

```typescript
function extractHeadings(html: string) {
  const regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  const headings = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = stripHtml(match[1]);
    headings.push({
      id: text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      text
    });
  }
  return headings;
}
```

The TOC is shown if the article has 3+ h2 headings, with anchor links that smooth-scroll to each heading.

## Keyboard Shortcuts

- `Ctrl/Cmd + K` — Focus search
- `Esc` — Clear search or close mobile sidebar
- Arrow keys — Navigate results (in dropdown)

## Mobile Responsive

- Sidebar becomes a drawer (280px wide, slides from left)
- Overlay backdrop with blur
- Hamburger button in header
- Auto-closes on navigation

## CSS Classes Defined

```css
.kb-category-card         /* Home grid cards */
.kb-article-content       /* Article typography container */
.kb-article-content h2    /* With underline + scroll-margin */
.kb-article-content h3
.kb-article-content ol li::before   /* Gold numbered circles */
.kb-article-content ul li::before   /* Gold dots */
.kb-article-content code            /* Inline gold tint */
.kb-article-content .kb-info        /* Green callout */
.kb-article-content .kb-warning     /* Amber callout */
.kb-article-content .kb-code        /* Dark monospace block */
.kb-code-wrapper                    /* Wraps kb-code with copy button */
.kb-toc                             /* Table of contents box */
```

Full CSS in `src/app/globals.css`.
