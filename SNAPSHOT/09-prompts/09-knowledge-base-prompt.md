# Prompt — Build Knowledge Base

## Context for LLM

```
Create an in-app documentation system with 9 categories, 30+ articles, search,
table of contents, and editability from admin.

**Database:**

Already in schema (see SNAPSHOT/03-database/01-full-schema.md):
- KbCategory (id, label, icon, description, sortOrder)
- KbArticle (id, categoryId, title, content, sortOrder)

**Static Content:**

**1. src/app/(admin)/dashboard/knowledge/kb-content.ts**

Export KB_CATEGORIES array with 9 categories:
1. getting-started 🚀 Primeros pasos (3 articles: welcome, dashboard-overview, navigation)
2. api-config 🔑 Configuracion de APIs (5 articles: what-is-api-key, openai-setup, ollama-setup, resend-setup, system-prompt)
3. blog 📝 Blog (3 articles: create-post, edit-publish, blog-seo)
4. gallery 🖼️ Galeria de imagenes (2 articles: upload-images, manage-gallery)
5. booking 📅 Sistema de reservas (4 articles: booking-overview, create-booking-link, availability-setup, manage-bookings)
6. landing-builder 🏗️ Landing Pages (4 articles: landing-overview, create-landing, edit-blocks, landing-leads)
7. ai-content 🤖 Inteligencia artificial (2 articles: ai-ideas, ai-articles)
8. email-system 📧 Emails y newsletter (3 articles: email-overview, newsletter-campaigns, manage-subscribers)
9. contacts 👥 Contactos y leads (1 article: contacts-overview)
10. troubleshooting 🔧 Solucion de problemas (5 articles: images-not-uploading, emails-not-sending, ai-not-working, booking-issues, general-issues)

Each article.content is HTML with these special classes:
- `<div class="kb-info">...</div>` — green info callout
- `<div class="kb-warning">...</div>` — amber warning callout
- `<div class="kb-code">code here</div>` — monospace code block
- `<code>inline</code>` — inline code with gold tint

Article IDs are of the form "{categoryId}/{articleId}" once stored in DB.

Full content bodies are in SNAPSHOT but can be regenerated from these templates
for each feature:
- Introduction paragraph (what and why)
- How-to steps (numbered ol)
- Tips/warnings (kb-info/kb-warning)
- Code examples if relevant (kb-code)

**API Routes:**

**1. src/app/api/kb/articles/route.ts**
- GET: admin. Fetch all KbCategory and KbArticle, return { categories, articles }

**2. src/app/api/kb/articles/[id]/route.ts**
- PATCH: admin. { title?, content? }. Update. Return 404 if not found.

**3. src/app/api/kb/seed/route.ts**
- POST: admin. Iterate KB_CATEGORIES from kb-content.ts.
  For each category: upsert (create if missing).
  For each article: id = "{catId}/{artId}", upsert if missing.
  Returns { categoriesCreated, articlesCreated, message }

**UI:**

**1. src/app/(admin)/dashboard/knowledge/page.tsx**
Server component: await requireAdmin() then render <KnowledgeBase />.

**2. src/app/(admin)/dashboard/knowledge/knowledge-base.tsx** (client)

Main features:
- Home view: category grid (3 cols desktop) + hero + search bar
- Article view: sidebar (categories expandable) + main content
- Search (Cmd/Ctrl+K to focus)
- Reading time calculation
- Table of contents (if article has ≥3 h2 headings)
- Prev/Next navigation at article bottom
- Code block copy-to-clipboard buttons
- Edit modal (DB mode only)

State:
- activeCategoryId, activeArticleId
- search (string)
- mobileSidebarOpen
- dbCategories, dbArticles (loaded on mount)
- editingArticle (for modal)
- saveStatus ("idle" | "saving" | "saved")

On mount: fetch /api/kb/articles. If DB has data, use it (otherwise use static KB_CATEGORIES).

Build categories array from DB records (merge with static), fallback to KB_CATEGORIES.

Home view:
- Hero: book icon + "Centro de ayuda"
- Stat: "N categorias · N articulos"
- If DB empty: banner "La documentacion esta en modo estatico" + button "Sincronizar con base de datos"
  - Click → POST /api/kb/seed → refetch GET /api/kb/articles
- Search bar with Ctrl+K kbd
- Category grid cards (when no search)
- Search results list (when searching)

Article view:
- Breadcrumb (Inicio › Category › Article)
- Title + "Editar" button (DB mode only)
- Reading time + category
- TOC (if ≥3 headings)
- Content (rendered from HTML)
- Prev/Next buttons

Edit modal:
- Title input
- Content textarea (monospace, HTML)
- Live preview below
- Save → PATCH /api/kb/articles/:id

Helper functions:
- estimateReadingTime(html): max(1, ceil(words / 200))
- stripHtml(html): remove all tags
- extractHeadings(html): regex /<h2[^>]*>(.*?)<\/h2>/gi → [{id, text}]
- processHtml(html): inject id attributes into h2 tags for anchor links
- renderContent(html): splits at kb-code divs, wraps each with CopyButton

Keyboard shortcuts:
- Cmd/Ctrl+K → focus search
- Esc → close modal / clear search / close mobile sidebar

**CSS:**

Already in globals.css — see SNAPSHOT/01-design-system. Key classes:
- .kb-category-card (with hover lift)
- .kb-article-content (typography)
- .kb-article-content ol li::before (gold numbered circles)
- .kb-article-content ul li::before (gold dots)
- .kb-article-content .kb-info (green)
- .kb-article-content .kb-warning (amber)
- .kb-article-content .kb-code (dark monospace)
- .kb-code-wrapper (container with copy button)
- .kb-toc (table of contents box)

**Sidebar nav entry:**

Add to admin-sidebar.tsx in a new section "Ayuda":
```typescript
{
  label: "Ayuda",
  items: [
    { href: "/dashboard/knowledge", label: "Guia de uso", icon: <BookIcon /> }
  ]
}
```
```

## Validation

1. Navigate to `/dashboard/knowledge` → home view loads
2. Search "API" → results appear ranked by relevance
3. Click a category card → sidebar + article view
4. Article with 3+ h2 → TOC appears on right
5. Click TOC link → smooth scrolls to section
6. Prev/Next buttons navigate between articles
7. Code blocks show "Copiar" button → copies to clipboard
8. Click "Sincronizar con base de datos" → articles seed
9. "Editar" button appears on each article
10. Edit title/content → save → live preview updates in real time
11. After save, article updates in the main view
