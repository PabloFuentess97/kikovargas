# Prompt — Build Design System

## Context for LLM

```
Create the complete design system for a premium dark athletic website.

**1. src/app/layout.tsx**

Root layout with:
- Oswald (display) and Inter (body) fonts from next/font/google
- Both as variables: --font-oswald, --font-inter, weights 400/500/600/700
- Spanish lang attribute
- Apply both font variables to <html>
- Import globals.css
- Metadata: title, description, openGraph
- Analytics script (optional)

**2. src/app/globals.css**

Complete CSS file with:

a) Tailwind import:
```css
@import "tailwindcss";
```

b) Scrollbar-hide utility:
```css
@utility scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
}
```

c) :root variables (landing theme) — see SNAPSHOT/01-design-system/01-colors.md
d) [data-theme="admin"] variables — see same file
e) @theme inline block mapping all vars to Tailwind color namespace
f) Base resets (html, body, ::selection, :focus-visible)
g) Layout utilities (.section-py, .container-landing, .section-label, .hr-accent)
h) Film grain overlay (.grain::after with SVG noise)
i) Shimmer and admin-fade-in animations
j) .admin-card, .admin-card-interactive, .admin-nav-item styles
k) Admin input/textarea/select styling with focus states
l) Admin scrollbar styling
m) .tiptap-content styles (editor typography)
n) .post-content styles (blog post typography, with diamond bullets ◆ and h2::before accent line)
o) .kb-article-content styles (KB typography with numbered ol, gold callouts, code blocks)

See SNAPSHOT/01-design-system/02-typography.md and 03-spacing-layout.md for exact values.

Key design tokens to preserve:
- --radius: 0px (sharp corners on landing)
- --accent: #c9a84c (gold)
- --bg-void: #030303 (near-black)
- Font: Oswald headings, Inter body
- Landing headings: uppercase + clamp() responsive sizing
- Admin: rounded 8-12px, gold focus rings with rgba(201,168,76,0.25)

**3. Admin UI primitives** (src/components/admin/ui/):

Create these files with exact signatures from SNAPSHOT/01-design-system/04-components.md:
- button.tsx (Button + LinkButton, 4 variants, 3 sizes)
- card.tsx (Card + CardHeader + CardContent)
- badge.tsx (Badge + StatusDot + PostStatusBadge + ContactStatusBadge)
- form.tsx (FormField, FormLabel, FormInput, FormTextarea, FormSelect, FormError, FormActions)
- table.tsx (Table + TableHead + TableHeader + TableBody + TableRow + TableCell + TableEmpty)
- page-header.tsx (PageHeader + Breadcrumb)
- stat-card.tsx (StatCard with formatted numbers, optional link)
- empty-state.tsx
- progress-bar.tsx (animated fill)
- info-row.tsx
- index.ts (barrel export)

All use Tailwind utilities mapped via @theme:
- bg-card, bg-background, bg-a-surface
- text-foreground, text-muted, text-danger, text-success
- border-border
- a-accent, a-accent-hover, a-accent-dim
```

## Validation

Create a test page to verify the design system:

```tsx
// src/app/test/page.tsx
export default function TestPage() {
  return (
    <div data-theme="admin" className="p-8 space-y-4">
      <Card>
        <CardHeader title="Test Card" action={<Button>Action</Button>} />
        <CardContent>
          <p className="text-muted">Body text in muted color</p>
          <Badge variant="success" dot>Active</Badge>
          <Badge variant="warning">Draft</Badge>
          <Badge variant="danger">Error</Badge>
        </CardContent>
      </Card>

      <FormField>
        <FormLabel>Email</FormLabel>
        <FormInput type="email" placeholder="your@email.com" />
      </FormField>
    </div>
  );
}
```

Visit `/test` and verify:
- Dark background (#08080a)
- Gold accent on buttons
- Rounded corners on card
- Form input has gold focus ring
- Badges have correct color coding
