# Feature — Blog System

## Overview

A full-featured blog with:
- TipTap rich text editor (WYSIWYG)
- AI-powered article generation (OpenAI or Ollama)
- AI-generated cover images (DALL-E 3)
- Status workflow: Draft → Published → Archived
- Auto-slug generation from title
- Reading time estimation
- Featured cover images
- SEO-friendly URLs

## Data Model

```typescript
Post {
  id: string (cuid)
  title: string
  slug: string (unique, lowercase-hyphens)
  excerpt: string | null (max 500 chars)
  content: string (HTML)
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  publishedAt: Date | null
  authorId: FK → User
  coverId: FK? → Image (unique, SetNull on delete)
  createdAt: Date
  updatedAt: Date
}
```

## Admin Workflow

### Create a post manually
1. Navigate to `/dashboard/posts`
2. Click `+ Nuevo post`
3. Fill in:
   - Title (slug auto-generated, editable)
   - Excerpt (optional, for SEO and listings)
   - Content (TipTap editor)
   - Cover image (upload or pick from gallery)
   - Status (Draft/Published/Archived)
4. Click `Guardar`

### Create a post with AI (recommended)
1. Navigate to `/dashboard/ideas`
2. Enter a niche/topic and idea count (3/5/7/10)
3. Click `Generar ideas`
4. Pick an idea → click `Crear post`
5. The editor opens with title pre-filled
6. Click `Generar artículo` in the AI panel
7. AI generates title, content, and cover image
8. Review, edit, add personal touches
9. Change status to `Publicado`

## TipTap Editor Configuration

```typescript
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3] }
    }),
    Image,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { rel: "noopener", target: "_blank" }
    }),
    Placeholder.configure({
      placeholder: "Empieza a escribir..."
    }),
    Underline,
  ],
  content: initialContent,
  editorProps: {
    attributes: {
      class: "tiptap-content focus:outline-none min-h-[400px]"
    }
  }
});
```

### Toolbar Actions
- Bold, Italic, Underline, Strike
- Heading 2, Heading 3
- Bulleted list, Ordered list
- Blockquote
- Link (with URL input modal)
- Image upload (uses `/api/upload`)
- Undo/Redo

## Public Blog Routes

### `/blog` — Listing
Shows all PUBLISHED posts in a grid, paginated.

### `/blog/[slug]` — Post detail
- Fetches by slug
- Returns 404 if not found or not published
- Renders with `.post-content` CSS class for styled typography
- Reading time estimate in header
- Related posts at bottom (3 random from same period)

## Post Component Landing Section

```typescript
// BlogSection
async function fetchLatestPosts() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: { cover: true, author: { select: { name: true } } }
  });
  return posts;
}

// Renders via <BlogCards posts={posts} />
```

## AI Generation Flow

### Step 1 — Generate content
```http
POST /api/ai/generate
Body: { topic: "nutricion para masa muscular", context?: string }

Response:
{
  success: true,
  data: {
    title: "Nutrición para ganar masa muscular",
    content: "<p>...</p><h2>...</h2>..."
  }
}
```

### Step 2 — Generate cover
```http
POST /api/ai/generate-image
Body: { title: "Nutrición para ganar masa muscular", topic?: string }

Response:
{
  success: true,
  data: {
    imageId: "cjk2l3m4n5...",
    url: "/uploads/ai-1734567890-abc123.png"
  }
}
```

### Step 3 — Save the post
```http
POST /api/posts
Body: {
  title: "Nutrición para ganar masa muscular",
  slug: "nutricion-ganar-masa-muscular",
  excerpt: "...",
  content: "<p>...</p>",
  status: "DRAFT",
  coverId: "cjk2l3m4n5..."
}
```

## CSS Classes

- `.post-content` — Applied to published post body on landing
- `.tiptap-content` — Applied to editor content area in admin

## Status Transitions

```
DRAFT ──[Publicar]──> PUBLISHED (sets publishedAt = now())
PUBLISHED ──[Despublicar]──> DRAFT (keeps publishedAt)
* ──[Archivar]──> ARCHIVED
ARCHIVED ──[Despublicar]──> DRAFT
```

## SEO

- Each post has a unique slug
- `<meta name="description">` from excerpt
- `<meta property="og:image">` from cover
- `<time datetime>` for publishedAt
- `<article>` semantic HTML
