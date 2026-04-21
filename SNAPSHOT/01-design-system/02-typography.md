# Design System — Typography

## Font Families

Configured in `src/app/layout.tsx` using Next.js font optimization:

```typescript
import { Oswald, Inter } from "next/font/google";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
```

### Usage
- **`--font-oswald`** — Display/Headings (editorial, condensed, sports feel)
- **`--font-inter`** — Body text, forms, UI (high legibility)

### Monospace (KB code blocks, inline code)
```css
"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace
```

## CSS Variables

```css
:root {
  --font-display: var(--font-oswald);
  --font-body: var(--font-inter);
}

body {
  font-family: var(--font-body), system-ui, sans-serif;
  line-height: 1.6;
}
```

## Type Scale

### Landing Section Headings
```css
.section-heading {
  font-family: var(--font-display);    /* Oswald */
  font-size: clamp(2.75rem, 5.5vw, 5rem);
  font-weight: 700;
  text-transform: uppercase;
  line-height: 0.92;
  letter-spacing: -0.02em;
}
```

### Section Label (eyebrow)
```css
.section-label {
  font-family: var(--font-body);
  font-size: 0.625rem;          /* 10px */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: var(--accent);
}

.section-label::before {
  content: "";
  width: 2.5rem;
  height: 1px;
  background: var(--accent);
}
```

### Blog Post Typography (`.post-content`)

```css
.post-content {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.9;
}

.post-content h2 {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3vw, 1.75rem);
  font-weight: 700;
  text-transform: uppercase;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  margin-top: 2.5em;
  margin-bottom: 0.75em;
}

.post-content h2::before {
  content: "";
  display: inline-block;
  width: 1.5rem;
  height: 2px;
  background: var(--accent);
  opacity: 0.5;
  margin-right: 0.75rem;
  vertical-align: middle;
}

.post-content h3 {
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 2.5vw, 1.35rem);
  font-weight: 600;
  text-transform: uppercase;
  line-height: 1.2;
  opacity: 0.9;
}
```

### Blog Post Bullets — Diamond markers
```css
.post-content ul li::before {
  content: "\25C6";           /* ◆ diamond */
  position: absolute;
  left: 0;
  top: 0.35em;
  font-size: 0.45rem;
  color: var(--accent);
}
```

### Admin TipTap Editor
```css
.tiptap-content h2 {
  font-size: 1.4em;
  font-weight: 700;
  line-height: 1.2;
  margin-top: 1.5em;
  color: var(--admin-fg);
}

.tiptap-content h3 {
  font-size: 1.15em;
  font-weight: 600;
  line-height: 1.3;
}

.tiptap-content blockquote {
  border-left: 3px solid var(--admin-accent);
  padding-left: 1em;
  font-style: italic;
  opacity: 0.8;
}
```

### Knowledge Base Article
```css
.kb-article-content {
  color: rgba(240, 240, 242, 0.7);
  font-size: 0.875rem;
  line-height: 1.85;
}

.kb-article-content h2 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--admin-fg);
  border-bottom: 1px solid var(--admin-border);
  padding-bottom: 0.5em;
}

.kb-article-content h3 {
  font-size: 0.95rem;
  font-weight: 600;
}
```

## Font Rendering

```css
html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  scroll-padding-top: 5.5rem;
}
```

## Text Selection Style

```css
::selection {
  background: var(--accent);    /* Gold highlight */
  color: var(--bg-void);         /* Black text */
}
```

## Typography Philosophy

1. **Display** = Oswald (condensed, athletic, uppercase). Reserved for headings only.
2. **Body** = Inter (highly legible, comfortable reading).
3. **Uppercase + tight letter-spacing** for hero headings; normal case for body.
4. **Relative sizing with `clamp()`** for fluid responsive typography (no breakpoints needed).
5. **Gold accent ornaments** (lines, diamonds, section-label dividers) used sparingly for editorial feel.
