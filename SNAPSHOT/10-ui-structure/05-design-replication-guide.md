# UI Structure — Design Replication Guide

Practical guide to replicating the exact look & feel, including every micro-detail.

## The 10 Non-Negotiable Design Principles

### 1. Dual theme, switched by `data-theme`
- Landing: `:root` scope, near-black `#030303`, sharp corners (`radius: 0`)
- Admin: `[data-theme="admin"]` scope, dark gray `#08080a`, rounded corners (`8-12px`)
- Wrap admin layout with `<div data-theme="admin">...</div>`

### 2. Gold accent (`#c9a84c`) used sparingly
- CTAs, active states, focus rings, links
- Never used as a background for large areas
- Hover variant: `#dfc06a` (lighter)
- Dim variant: `rgba(201, 168, 76, 0.06)` for subtle tinted backgrounds

### 3. Oswald for headings, Inter for body
- Headings: uppercase, tight letter-spacing (`-0.02em` to `-0.03em`)
- Body: normal case, `line-height: 1.6-1.9`
- Display font scales with `clamp(2.75rem, 5.5vw, 5rem)` for hero-level, smaller for h2/h3

### 4. Section padding: `clamp(6rem, 14vw, 12rem)` top and bottom
- Uses `.section-py` class
- NEVER fixed rem/px — always clamp for fluid responsiveness

### 5. Container max-width: 1300px
- `.container-landing` utility class
- Horizontal padding: `clamp(1.25rem, 5vw, 3rem)`

### 6. Gold accent patterns
Three recurring visual motifs:
- **1px gold line** before section labels (`section-label::before`)
- **Gold diamond (◆)** as bullet markers in blog content (`post-content ul li::before`)
- **Gold H2 prefix** — thin 2px line before every blog h2 (`post-content h2::before`)

### 7. Numbered navigation
Desktop nav shows `01 Sobre mí`, `02 Galería`, etc. — the numbers are `font-mono`, small (`text-[0.55rem]`), accent color at 30% opacity, going to 100% on hover.

### 8. Text reveal animations
Hero title uses `overflow-hidden` wrapper + `y: 110% → 0` translate. Each line staggered by 0.1s.

### 9. Scroll behavior
- Navbar hides on scroll down past 400px
- Navbar reappears on scroll up
- Smooth scroll behavior on `html` (`scroll-behavior: smooth`)
- `scroll-padding-top: 5.5rem` to offset fixed nav when clicking anchor links

### 10. Cookie banner + Page tracker mounted at root
Both are client components that run on every page. Cookie banner uses `localStorage.getItem("cookie-consent")`. Page tracker POSTs to `/api/analytics/track` on route change.

## Exact Spacing Scale

| Token | Rem | Px | Usage |
|-------|-----|-----|-------|
| Page padding (mobile) | 1rem | 16 | `p-4` |
| Page padding (desktop) | 1.5rem | 24 | `md:p-6` |
| Card padding default | 1.25rem | 20 | `p-5` |
| Card header padding | 1rem/1.25rem | 16/20 | `px-5 py-4` |
| Form field vertical | 0.75rem | 12 | `py-3` |
| Form input horizontal | 1rem | 16 | `px-4` |
| Button sm | 0.75rem/0.375rem | 12/6 | `px-3 py-1.5` |
| Button md | 1rem/0.625rem | 16/10 | `px-4 py-2.5` |
| Button lg | 1.5rem/0.75rem | 24/12 | `px-6 py-3` |
| Stat card padding | 1.25rem | 20 | `p-5` |
| Sidebar nav item | 0.75rem/0.5rem | 12/8 | `px-3 py-2` |
| Section margin-bottom | 2rem | 32 | `mb-8` |

## Exact Typography Scale

| Size Token | CSS Value | Usage |
|------------|-----------|-------|
| `text-[0.55rem]` | 8.8px | Micro labels, numbered nav |
| `text-[0.6rem]` | 9.6px | Uppercase tracker labels |
| `text-[0.65rem]` | 10.4px | Section labels, nav items, table headers |
| `text-[0.7rem]` | 11.2px | Tagline, small metadata |
| `text-xs` | 12px | Secondary text, timestamps |
| `text-sm` | 14px | Body text, buttons, card headers |
| `text-base` | 16px | Standard body |
| `text-lg` | 18px | Subheadings |
| `text-xl` | 20px | Page titles |
| `text-2xl` | 24px | Large stats, h1 |
| Hero | `clamp(3.5rem, 14vw, 12rem)` | ONLY the hero title |

## Letter Spacing Scale

| Value | Use |
|-------|-----|
| `-0.03em` | Hero title (tight) |
| `-0.02em` | Section headings |
| `-0.01em` | Subheadings |
| Normal | Body text |
| `0.12em` | Small uppercase labels (form labels, table headers) |
| `0.15em` | Eyebrow labels |
| `0.18em` | Logo brand |
| `0.2em` | Desktop nav links |
| `0.25em` | Hero tagline, CTA text |
| `0.3em` | Vertical scroll indicator, section labels |
| `0.35em` | Hero tagline |
| `0.4em` | Vertical "Scroll" text |

## Border Width & Color Patterns

- Default admin borders: `rgba(255, 255, 255, 0.06)` (very subtle)
- Hover admin borders: `rgba(255, 255, 255, 0.1)`
- Accent border hover: `rgba(201, 168, 76, 0.2)`
- Landing borders: `rgba(255, 255, 255, 0.05)`
- Error borders: `border-danger/20`
- Success borders: `border-success/15`

## Shadow Patterns

```css
/* Card hover lift */
0 4px 20px rgba(0, 0, 0, 0.3)

/* Hero title text shadow */
0 2px 40px rgba(0, 0, 0, 0.5)

/* Scrolled navbar */
0 1px 60px rgba(0, 0, 0, 0.5)

/* Hero vignette */
inset 0 0 200px rgba(0, 0, 0, 0.5)

/* Modal (admin) */
0 25px 50px -12px rgba(0, 0, 0, 0.25)

/* Focus ring (admin) */
0 0 0 3px rgba(201, 168, 76, 0.25)
```

## Transition Timing

| Element | Duration | Easing |
|---------|----------|--------|
| Color/background | 200ms | default |
| Border change | 200ms | default |
| Transform (card lift) | 150ms | default |
| Navbar show/hide | 500ms | custom ease |
| Hero title | 900ms | custom ease |
| Mobile menu | 350ms | default |
| Scroll cue loops | 2500ms | ease-in-out |
| CTA arrow pulse | 2500ms | ease-in-out |

Custom ease is defined in `src/lib/animations.ts`:
```typescript
export const ease = [0.25, 0.1, 0.25, 1] as const;   // cubic-bezier
```

## SVG Icon Rules

- **All icons are inline SVG** (no icon library like Lucide or Heroicons)
- Stroke style: `stroke="currentColor" strokeWidth={1.5}` (for subtle icons)
- For action icons / UI chrome: `strokeWidth={2}`
- Sizes:
  - Navigation: `h-[18px] w-[18px]` or `h-5 w-5`
  - Card headers: `h-5 w-5`
  - Small actions: `h-3.5 w-3.5` or `h-4 w-4`
  - Empty states: `h-6 w-6` inside a circle
  - Dashboard stat icons: `h-5 w-5`

## Loading / Skeleton States

```tsx
<div className="skeleton-admin h-4 w-32 rounded" />
```

The `.skeleton-admin` class is a shimmering gradient. Always with specific width/height.

## Mobile Breakpoints

Tailwind's defaults, no customization:
- `sm:` ≥ 640px
- `md:` ≥ 768px
- `lg:` ≥ 1024px
- `xl:` ≥ 1280px

Use `md:` for the main desktop vs. mobile switch. `lg:` is for hiding/showing 4-column layouts.

## Accessibility patterns

- `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }`
- All images have meaningful alt text
- Form inputs always paired with `<FormLabel htmlFor>`
- Keyboard navigation works everywhere (never relies on hover)
- Color contrast: `text-primary` on `bg-void` = 18.3:1 (AAA)

## Exact JSX patterns to copy

### Pill-style filter tabs
```tsx
<div className="inline-flex gap-1 p-1 rounded-lg bg-card border border-border mb-6">
  {tabs.map(tab => (
    <button
      key={tab.id}
      onClick={() => setFilter(tab.id)}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
        filter === tab.id
          ? "bg-a-accent/10 text-a-accent"
          : "text-muted hover:text-foreground"
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
```

### Navbar / tab-style filter tabs
```tsx
<div className="flex gap-1 mb-6 border-b border-border">
  {tabs.map(tab => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors border-b-2 -mb-px ${
        activeTab === tab.id
          ? "border-a-accent text-a-accent"
          : "border-transparent text-muted hover:text-foreground"
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
```

### Hover lift card (admin)
```tsx
<Link href="..." className="admin-card admin-card-interactive p-5 block group">
  {/* Content. group- prefix activates hover effects on children */}
  <div className="text-muted transition-colors group-hover:text-a-accent">
    {/* Icon changes color on card hover */}
  </div>
</Link>
```

### Landing link with underline reveal
```tsx
<a href="#" className="relative group text-secondary/60 hover:text-primary transition-colors">
  Label
  <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-accent transition-all duration-500 group-hover:w-full" />
</a>
```

### Two-line stagger reveal
```tsx
<div className="mb-5 md:mb-7">
  {lines.map((line, i) => (
    <div key={line} className="overflow-hidden">
      <motion.h1
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5 + i * 0.1, duration: 0.9, ease }}
      >
        {line}
      </motion.h1>
    </div>
  ))}
</div>
```

### Status dot + text
```tsx
<span className="inline-flex items-center gap-1.5">
  <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
  <span className="text-[0.65rem] font-medium">Activo</span>
</span>
```

### Breadcrumb trail
```tsx
<nav className="flex items-center gap-2 text-xs text-muted mb-2">
  <Link href="/dashboard" className="hover:text-a-accent transition-colors">Dashboard</Link>
  <span>/</span>
  <span>Current page</span>
</nav>
```

## Checklist Before Shipping

- [ ] Every page starts with `<div className="admin-fade-in">`
- [ ] `<PageHeader>` is the first element inside pages (admin only)
- [ ] Tables use `Table > TableHead > TableHeader > TableBody > TableRow > TableCell`
- [ ] Empty states use `TableEmpty` (inside tables) or `EmptyState` (elsewhere)
- [ ] Forms use `FormField > FormLabel + FormInput/Textarea/Select`
- [ ] Buttons use `<Button variant="...">` not raw `<button>`
- [ ] Status badges use `<PostStatusBadge />` or `<ContactStatusBadge />`
- [ ] Links use `<Link>` from `next/link`, never `<a href>` for internal routes
- [ ] Icons are inline SVG, `strokeWidth={1.5}` for most, `2` for controls
- [ ] Animations use `framer-motion` with custom `ease` from `@/lib/animations`
- [ ] Responsive: `hidden sm:table-cell`, `hidden md:table-cell` for table columns
- [ ] Mobile sidebar = drawer, desktop sidebar = static 250px wide
- [ ] Landing sharp corners (radius 0), admin rounded corners (8-12px)
- [ ] Gold accent for: CTA buttons, active nav, links, focus rings, status success
- [ ] Never use Tailwind colors like `bg-blue-500` — always semantic tokens
