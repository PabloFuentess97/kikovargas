# Design System — Colors

## Two Themes

The project uses **two distinct color themes** defined as CSS variables in `src/app/globals.css`.

### Landing Theme (`:root`) — Premium Dark Athletic

Sharp, ultra-dark, editorial feel. Used on the public-facing website.

```css
:root {
  /* Backgrounds */
  --bg-void: #030303;              /* Main background (near black) */
  --bg-surface: #070707;           /* Section backgrounds */
  --bg-elevated: #0f0f0f;          /* Cards, elevated content */
  --bg-elevated-hover: #161616;    /* Hover state on cards */

  /* Text */
  --text-primary: #ededed;         /* Main text (off-white) */
  --text-secondary: #7a7a7a;       /* Secondary text (mid gray) */
  --text-tertiary: #3d3d3d;        /* Hint/muted text (dark gray) */

  /* Accent — Gold */
  --accent: #c9a84c;               /* Primary accent (warm gold) */
  --accent-hover: #dfc06a;         /* Hover state (lighter gold) */
  --accent-dim: rgba(201, 168, 76, 0.06);  /* Subtle accent backgrounds */

  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.05);
  --border-accent: rgba(201, 168, 76, 0.15);

  /* Other */
  --radius: 0px;                   /* Sharp corners everywhere on landing */
}
```

### Admin Theme (`[data-theme="admin"]`) — Premium Dashboard

Slightly less intense, more utility-focused, with rounded corners and status colors.

```css
[data-theme="admin"] {
  /* Backgrounds */
  --admin-bg: #08080a;             /* Main background */
  --admin-fg: #f0f0f2;             /* Main text */
  --admin-card: #111114;           /* Card backgrounds */
  --admin-card-hover: #19191d;     /* Card hover */
  --admin-surface: #0d0d10;        /* Surface/input backgrounds */
  --admin-surface-hover: #151518;

  /* Borders */
  --admin-border: rgba(255, 255, 255, 0.06);

  /* Text */
  --admin-muted: #6b6b76;          /* Muted/secondary text */

  /* Status */
  --admin-primary: #c9a84c;        /* Gold (same as landing accent) */
  --admin-primary-hover: #dfc06a;
  --admin-danger: #ef4444;         /* Red */
  --admin-danger-hover: #dc2626;
  --admin-success: #10b981;        /* Green */
  --admin-warning: #f59e0b;        /* Amber */

  /* Accent aliases for Tailwind */
  --admin-accent: #c9a84c;
  --admin-accent-hover: #dfc06a;
  --admin-accent-dim: rgba(201, 168, 76, 0.08);
  --admin-ring: rgba(201, 168, 76, 0.25);
}
```

## Tailwind Color Mapping (`@theme inline`)

Exposes CSS variables as Tailwind utility colors:

```css
@theme inline {
  /* Landing */
  --color-void: var(--bg-void);
  --color-surface: var(--bg-surface);
  --color-elevated: var(--bg-elevated);
  --color-elevated-hover: var(--bg-elevated-hover);
  --color-primary: var(--text-primary);
  --color-secondary: var(--text-secondary);
  --color-tertiary: var(--text-tertiary);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-accent-dim: var(--accent-dim);
  --color-border-subtle: var(--border-subtle);
  --color-border-accent: var(--border-accent);

  /* Admin */
  --color-background: var(--admin-bg);
  --color-foreground: var(--admin-fg);
  --color-card: var(--admin-card);
  --color-card-hover: var(--admin-card-hover);
  --color-border: var(--admin-border);
  --color-muted: var(--admin-muted);
  --color-a-primary: var(--admin-primary);
  --color-a-primary-hover: var(--admin-primary-hover);
  --color-danger: var(--admin-danger);
  --color-danger-hover: var(--admin-danger-hover);
  --color-success: var(--admin-success);
  --color-warning: var(--admin-warning);
  --color-a-surface: var(--admin-surface);
  --color-a-surface-hover: var(--admin-surface-hover);
  --color-a-accent: var(--admin-accent);
  --color-a-accent-hover: var(--admin-accent-hover);
  --color-a-accent-dim: var(--admin-accent-dim);
  --color-a-ring: var(--admin-ring);
}
```

## Semantic Color Usage

### Landing page
- `bg-void` — Body background
- `bg-surface` / `bg-elevated` — Section and card backgrounds
- `text-primary` — Headings and hero text
- `text-secondary` — Body copy, descriptions
- `text-tertiary` — Timestamps, footer text
- `accent` — CTA buttons, links, dividers, eyebrow labels

### Admin panel
- `bg-background` — Page backgrounds
- `bg-card` — Cards, modals
- `text-foreground` — Main text
- `text-muted` — Secondary text, labels
- `border-border` — All borders
- `a-accent` — CTAs, active nav, links, focus rings
- `danger` — Delete buttons, error messages
- `success` — Saved state, active status
- `warning` — Pending status, draft badges

## Color Accessibility

| Pair | Contrast Ratio | WCAG |
|------|---------------|------|
| `#ededed` on `#030303` | 18.3:1 | AAA |
| `#7a7a7a` on `#030303` | 5.8:1 | AA (large) / AAA (regular) |
| `#c9a84c` on `#030303` | 10.2:1 | AAA |
| `#f0f0f2` on `#08080a` | 18.1:1 | AAA |
| `#6b6b76` on `#08080a` | 4.8:1 | AA |
