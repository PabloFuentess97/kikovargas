# Prompt — Build Admin Blog + AI Generation

## Context for LLM

```
Create the admin blog section with TipTap editor and AI content generation.

**API Routes:**

**1. src/app/api/posts/route.ts**
- GET: paginated list. Admin sees all statuses; public only PUBLISHED.
  Query params: page (default 1), limit (default 10, max 50), status (admin only)
- POST: create post. Admin only. Validate with createPostSchema:
  - title (1-200), slug (1-200, lowercase-hyphens regex), excerpt (max 500, optional),
    content (min 1), status (default DRAFT), coverId (optional)
  Set publishedAt if status=PUBLISHED.
  Validate slug uniqueness.

**2. src/app/api/posts/[id]/route.ts**
- GET: fetch by ID or slug. Public sees only PUBLISHED; admin sees all.
- PATCH: update. Partial createPostSchema. Set publishedAt on first PUBLISHED transition.
- DELETE: delete post.

**3. src/app/api/ai/generate/route.ts**
- POST: generate article with OpenAI or Ollama (based on config.ai.provider)
- Body: { topic (min 3), context? }
- Uses systemPrompt from config
- User prompt asks for JSON with title + HTML content
- Temperature: 0.7, max_tokens: 4000
- Parses JSON response (with fallbacks)
- Returns { success: true, data: { title, content } }

**4. src/app/api/ai/generate-ideas/route.ts**
- POST: generate blog post ideas
- Body: { niche?, count? (1-10, default 5) }
- Temperature: 0.9, max_tokens: 2000
- Returns array of { title, description, tags }

**5. src/app/api/ai/generate-image/route.ts**
- POST: DALL-E 3 cover image
- Body: { title? | topic? }
- Size 1792x1024, standard quality
- Prompt: "Professional fitness blog cover image about "{title}". Dark moody
  atmosphere, black tones, gold accents. Editorial photography, dramatic lighting.
  No text, no watermarks."
- Downloads to /public/uploads/, creates Image record
- Returns { imageId, url }
- Only works with OpenAI (not Ollama)

See SNAPSHOT/04-features/04-ai-generation.md for exact prompts.

**Admin Pages:**

**1. src/app/(admin)/dashboard/posts/page.tsx**
Server component:
- Fetches all posts
- Renders PageHeader + filter tabs + table
- Columns: Title, Status, Date, Actions (Edit, Delete)

**2. src/app/(admin)/dashboard/posts/new/page.tsx**
Server component wrapping <PostForm mode="create" />

**3. src/app/(admin)/dashboard/posts/[id]/page.tsx**
Server component wrapping <PostForm mode="edit" initialData={post} />

**4. src/app/(admin)/dashboard/posts/post-form.tsx** (client)

Complex client component with:
- Title input (auto-generates slug on change unless manually edited)
- Slug input (editable)
- Excerpt textarea
- Cover image picker (shows thumbnail, opens gallery picker modal)
- AI panel (shown if content is empty and mode=create):
  - Topic input
  - Context textarea
  - "Generar articulo" button
  - Shows loading state during AI call
- TipTap editor (see editor setup below)
- Status select (Draft/Published/Archived)
- Save button
- Delete button (edit mode only)

AI flow:
1. POST /api/ai/generate with topic + context
2. Get { title, content }
3. Set form state with these values
4. POST /api/ai/generate-image with title
5. Get { imageId, url }
6. Set coverId
7. User reviews and manually clicks Save

**5. src/app/(admin)/dashboard/posts/post-form.tsx — TipTap setup:**

```typescript
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";

const editor = useEditor({
  extensions: [
    StarterKit.configure({ heading: { levels: [2, 3] } }),
    Image,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { rel: "noopener", target: "_blank" }
    }),
    Placeholder.configure({ placeholder: "Empieza a escribir..." }),
    Underline
  ],
  content: initialContent,
  editorProps: {
    attributes: {
      class: "tiptap-content focus:outline-none min-h-[400px]"
    }
  }
});
```

Toolbar buttons:
- Bold, Italic, Underline, Strike (toggle)
- H2, H3 (toggle headings)
- Bulleted list, Ordered list
- Blockquote
- Link (opens URL input modal)
- Image (calls /api/upload, inserts <img>)
- Undo/Redo

**6. src/app/(admin)/dashboard/ideas/page.tsx** + ideas-generator.tsx

Client component:
- Niche input
- Count selector (3/5/7/10)
- Generate button → POST /api/ai/generate-ideas
- Results list with 3 actions per idea:
  - Copy title to clipboard
  - Save (localStorage "kv-saved-ideas")
  - Create post → router.push("/dashboard/posts/new?idea=" + encodeURIComponent(title))
- Saved ideas panel (reads localStorage)

**7. src/lib/validations/post.ts**

```typescript
export const createPostSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido"),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "El contenido es obligatorio"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  coverId: z.string().optional(),
});

export const updatePostSchema = createPostSchema.partial();
```
```

## Validation

1. Navigate to `/dashboard/posts` (logged in as admin)
2. Click "+ Nuevo post"
3. Enter a topic in AI panel, click "Generar articulo"
4. AI generates title + HTML content (wait ~5-20s)
5. Cover image generates automatically
6. Review, make edits in TipTap
7. Change status to "Publicado", save
8. Visit `/blog/{slug}` → article displays with styled typography
