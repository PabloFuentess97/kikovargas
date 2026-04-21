# Design System — Spacing & Layout

## Layout Primitives

### Section vertical padding
```css
.section-py {
  padding-top: clamp(6rem, 14vw, 12rem);      /* 96–192px */
  padding-bottom: clamp(6rem, 14vw, 12rem);
}
```

### Container (landing)
```css
.container-landing {
  max-width: 1300px;
  margin-inline: auto;
  padding-inline: clamp(1.25rem, 5vw, 3rem);  /* 20–48px */
}
```

## Admin Panel Layout

- **Sidebar width (desktop):** `250px`
- **Sidebar width (mobile drawer):** `280px`
- **Main content padding:** `24px` (6 in Tailwind scale)
- **Card padding (default):** `20px` (5)
- **Card padding (padded):** `24px` (6)

## Border Radius

| Context | Radius | CSS |
|---------|--------|-----|
| Landing | Sharp | `--radius: 0px` |
| Admin — Cards | Rounded | `border-radius: 12px` |
| Admin — Buttons | Rounded | `border-radius: 8px` |
| Admin — Inputs | Rounded | `border-radius: 8px` |
| Admin — Small (badges) | Rounded-sm | `border-radius: 4-6px` |
| Admin — Full pills | Rounded-full | `border-radius: 9999px` |

## Admin Card

```css
.admin-card {
  background: var(--admin-card);
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.admin-card:hover {
  border-color: rgba(255, 255, 255, 0.1);
}

.admin-card-interactive:hover {
  border-color: rgba(201, 168, 76, 0.2);
  box-shadow: 0 0 0 1px rgba(201, 168, 76, 0.05), 0 4px 20px rgba(0, 0, 0, 0.3);
}
```

## Input Styling (admin)

```css
[data-theme="admin"] input:not([type="checkbox"]):not([type="radio"]):not([type="file"]),
[data-theme="admin"] textarea,
[data-theme="admin"] select {
  background: var(--admin-surface);
  border: 1px solid var(--admin-border);
  color: var(--admin-fg);
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

[data-theme="admin"] input:focus,
[data-theme="admin"] textarea:focus,
[data-theme="admin"] select:focus {
  border-color: var(--admin-accent);
  box-shadow: 0 0 0 3px var(--admin-ring);   /* rgba(201, 168, 76, 0.25) */
  outline: none;
}

[data-theme="admin"] input::placeholder,
[data-theme="admin"] textarea::placeholder {
  color: var(--admin-muted);
  opacity: 0.6;
}
```

## Scrollbar (admin)

```css
[data-theme="admin"] ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

[data-theme="admin"] ::-webkit-scrollbar-track {
  background: transparent;
}

[data-theme="admin"] ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
}

[data-theme="admin"] ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}
```

## Sidebar Nav Item

```css
.admin-nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--admin-muted);
  transition: all 0.2s;
}

.admin-nav-item:hover {
  color: var(--admin-fg);
  background: rgba(255, 255, 255, 0.04);
}

.admin-nav-item.active {
  color: var(--admin-accent);
  background: var(--admin-accent-dim);
}

.admin-nav-item.active::before {
  content: "";
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--admin-accent);
  border-radius: 0 3px 3px 0;
}
```

## Animations

### Shimmer (skeleton loaders)
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton, .skeleton-admin {
  background: linear-gradient(90deg,
    rgba(255, 255, 255, 0.03) 25%,
    rgba(255, 255, 255, 0.06) 50%,
    rgba(255, 255, 255, 0.03) 75%);
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
}
```

### Admin fade-in
```css
@keyframes admin-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.admin-fade-in {
  animation: admin-fade-in 0.4s ease-out;
}
```

### Slide down (collapsibles)
```css
@keyframes slideDown {
  from { opacity: 0; max-height: 0; transform: translateY(-4px); }
  to { opacity: 1; max-height: 800px; transform: translateY(0); }
}
```

### Pulse glow (status indicators)
```css
@keyframes admin-pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(201, 168, 76, 0); }
  50% { box-shadow: 0 0 20px 2px rgba(201, 168, 76, 0.08); }
}
```

## Film-grain Overlay (landing)

Subtle noise texture layered over all landing pages:

```css
.grain::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.022;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,...");  /* SVG fractal noise */
}
```

## Focus Ring

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

## Utility: Hide scrollbar
```css
@utility scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}
```

## Horizontal Rule (accent)

```css
.hr-accent {
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    var(--accent) 20%,
    var(--accent) 80%,
    transparent);
  opacity: 0.15;
}
```
