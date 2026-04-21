# Prompt — Build Landing Page Builder (Event Pages)

## Context for LLM

```
Create a block-based landing page builder where admins can compose pages from
14 block types with drag-reorder and auto-save.

**API Routes:**

**1. src/app/api/event-pages/route.ts**
- GET: list with blocks + leads count
- POST: create
  Schema: { slug (2-100, lowercase-hyphens), title (1-200), description? (max 1000),
    template? ("custom"|"webinar"|"fitness"|"coaching", default "custom") }

**2. src/app/api/event-pages/[id]/route.ts**
- GET: fetch with blocks (order asc) + lead count
- PATCH: update title, description, status
- DELETE: cascades

**3. src/app/api/event-pages/[id]/blocks/route.ts**
- POST: create block OR reorder blocks
  Create schema: { type (one of 14), data: object }
  Reorder schema: { blockIds: string[] }
  Create logic: order = max(existing) + 1
  Reorder logic: update each block's order sequentially

**4. src/app/api/event-pages/[id]/blocks/[blockId]/route.ts**
- PATCH: { data: object } — replaces block data
- DELETE: removes block, reorders remaining to fill gaps

**5. src/app/api/event-leads/route.ts**
- GET: admin. ?pageId filter. Last 200 leads with page info.
- POST: public. { pageId, name, email, phone?, message? }
  Page must be PUBLISHED.
  Side effects: create Contact, send admin email notification.

**Block System:**

**1. src/components/event-blocks/types.ts**

```typescript
export const BLOCK_TYPES = ["hero","text","image","cta","gallery","form","countdown","faq","testimonials","video","pricing","stats","divider","features"] as const;

export type BlockType = typeof BLOCK_TYPES[number];

// 14 data interfaces: HeroData, TextData, etc.
// See SNAPSHOT/04-features/05-landing-builder.md for all schemas

export const BLOCK_LABELS: Record<BlockType, string> = {
  hero: "Hero / Cabecera",
  // ... 14 labels
};

export const BLOCK_DEFAULTS: Record<BlockType, BlockData> = {
  hero: { title: "Titulo del evento", subtitle: "Descripcion", ctaText: "Registrate", ctaHref: "#form" },
  // ... 14 defaults
};
```

**2. src/components/event-blocks/blocks/**

Create 14 React components, one per type:
- hero-block.tsx
- text-block.tsx
- image-block.tsx
- cta-block.tsx
- gallery-block.tsx
- form-block.tsx
- countdown-block.tsx
- faq-block.tsx
- testimonials-block.tsx
- video-block.tsx
- pricing-block.tsx
- stats-block.tsx
- divider-block.tsx
- features-block.tsx

Each accepts `{ data, pageId }` props and renders a section styled with landing theme tokens.

Form block submits to POST /api/event-leads.
Countdown block uses useEffect to tick every second.
Video block extracts YouTube/Vimeo ID from URL and embeds iframe.

**3. src/components/event-blocks/block-renderer.tsx**

```typescript
const BLOCK_MAP = { hero: HeroBlock, text: TextBlock, /* ...all 14 */ };

export function BlockRenderer({ type, data, pageId }) {
  const Component = BLOCK_MAP[type];
  if (!Component) return null;
  return <Component data={data} pageId={pageId} />;
}
```

**4. src/lib/event-templates.ts**

3 predefined templates:
- webinar: 11 blocks
- fitness: 12 blocks (with 2 price plans €49, €89)
- coaching: 12 blocks (with 3 price plans €149, €249, €349)

Each template: `{ id, name, description, blocks: [{ type, data }] }`.

**Admin Editor:**

**1. /dashboard/event-pages/page.tsx + event-page-list.tsx (client)**

- Table: Title, Slug, Blocks, Leads, Status, Actions
- "+ Nueva landing page" form:
  - Title, slug, template selector (4 cards with emojis)
- Create logic:
  1. POST /api/event-pages with { slug, title, template }
  2. If template != "custom", call POST /api/event-pages/{id}/blocks for each
     template block
- Actions: Edit (link to editor), Copy link, Publish toggle, Delete

**2. /dashboard/event-pages/[id]/page.tsx + event-editor.tsx (client)**

Complex editor with:

- PageHeader with title, status toggle, "Vista previa" button (opens /event/{slug})
- Vertical list of blocks, each showing:
  - Visual preview (miniature rendering of block's data)
  - Collapsed header (type icon + inline summary text)
  - Expand/collapse toggle
  - Drag handle (6-dot icon)
  - Duplicate button
  - Delete button
- Each block, when expanded, shows type-specific edit fields

Auto-save:
```typescript
const timers = useRef<Record<string, NodeJS.Timeout>>({});

function saveBlock(blockId: string, newData: object) {
  if (timers.current[blockId]) clearTimeout(timers.current[blockId]);
  timers.current[blockId] = setTimeout(async () => {
    setSavingIds(prev => new Set(prev).add(blockId));
    await fetch(`/api/event-pages/${pageId}/blocks/${blockId}`, {
      method: "PATCH",
      body: JSON.stringify({ data: newData })
    });
    setSavingIds(prev => { const s = new Set(prev); s.delete(blockId); return s; });
    setSavedIds(prev => new Set(prev).add(blockId));
    setTimeout(() => setSavedIds(prev => { ...clear blockId }), 2000);
  }, 800);
}
```

Drag and drop:
```typescript
function handleDragStart(e, blockId) { e.dataTransfer.effectAllowed = "move"; setDragging(blockId); }
function handleDragOver(e) { e.preventDefault(); }
function handleDrop(e, targetId) {
  const newOrder = reorder(blocks, dragging, targetId);
  setBlocks(newOrder);
  fetch(`/api/event-pages/${pageId}/blocks`, {
    method: "POST",
    body: JSON.stringify({ blockIds: newOrder.map(b => b.id) })
  });
}
```

Add block panel:
- Categorized tabs: Contenido / Conversion / Social proof / Layout
- Each category shows block type cards
- Click → POST /api/event-pages/{id}/blocks with default data

Block type editors (inline):
- GalleryEditor — add/remove images, pick from gallery
- FormFieldsEditor — checkboxes for name/email/phone/message
- FaqEditor — dynamic list of { question, answer }
- TestimonialsEditor — dynamic list of { name, role, text, avatar }
- PricingEditor — dynamic list of plans with features
- StatsEditor — dynamic list of { value, label }
- FeaturesEditor — dynamic list of { icon, title, description }

**Public Event Page:**

**1. src/app/event/[slug]/page.tsx**

Server component:
- Fetch EventPage by slug (include blocks ordered)
- If status !== "PUBLISHED": notFound()
- Render with <BlockRenderer /> per block

Each block component handles its own form/interaction (e.g., FormBlock posts to
/api/event-leads).

Uses landing theme (no admin tokens).
```

## Validation

1. Create `webinar` template page → 11 blocks appear in editor
2. Edit block → auto-save indicator fires → changes persist
3. Drag block to reorder → order persists
4. Duplicate block → copy created
5. Click "Vista previa" → opens `/event/{slug}` in new tab
6. Public page renders all blocks
7. Submit form → lead created, admin email sent
