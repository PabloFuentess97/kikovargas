# SNAPSHOT — Full Index

**46 files · ~11,000 lines · Complete 1:1 reproduction blueprint**

## Contents

### [README](./README.md)
Project overview, stack, reading order, license.

### 01 — Design System (4 files, ~700 lines)
- [01-colors.md](./01-design-system/01-colors.md) — All hex values, landing vs admin theme, Tailwind mapping
- [02-typography.md](./01-design-system/02-typography.md) — Oswald + Inter fonts, type scale, .post-content, .kb-article-content
- [03-spacing-layout.md](./01-design-system/03-spacing-layout.md) — Layout primitives, border radius, cards, inputs, scrollbars, animations
- [04-components.md](./01-design-system/04-components.md) — 15 landing components + 11 admin UI primitives + 14 event blocks

### 02 — Content (4 files, ~700 lines)
- [01-landing-copy.md](./02-content/01-landing-copy.md) — Exact verbatim texts for every section
- [02-blog-examples.md](./02-content/02-blog-examples.md) — 3 example blog posts (HTML content)
- [03-email-templates.md](./02-content/03-email-templates.md) — 8 email templates (contact, newsletter, booking, etc.)
- [04-cta-texts.md](./02-content/04-cta-texts.md) — Every button/CTA/status label in the app

### 03 — Database (3 files, ~800 lines)
- [01-full-schema.md](./03-database/01-full-schema.md) — Complete Prisma schema
- [02-relations-and-fields.md](./03-database/02-relations-and-fields.md) — Every table/field/relation explained
- [03-migrations.md](./03-database/03-migrations.md) — All 6 migrations verbatim SQL

### 04 — Features (7 files, ~1,500 lines)
- [01-blog.md](./04-features/01-blog.md) — Blog with TipTap + AI generation
- [02-gallery.md](./04-features/02-gallery.md) — Image upload, featured flag, masonry grid
- [03-booking-system.md](./04-features/03-booking-system.md) — Links, availability, booking flow, conflict prevention
- [04-ai-generation.md](./04-features/04-ai-generation.md) — OpenAI + Ollama + DALL-E, prompts, costs
- [05-landing-builder.md](./04-features/05-landing-builder.md) — 14 block types, templates, auto-save editor
- [06-knowledge-base.md](./04-features/06-knowledge-base.md) — In-app help system, search, TOC, edit mode
- [07-admin-panel.md](./04-features/07-admin-panel.md) — Admin structure overview

### 05 — API (2 files, ~700 lines)
- [01-endpoints-overview.md](./05-api/01-endpoints-overview.md) — All 37 endpoints with auth level
- [02-request-response-schemas.md](./05-api/02-request-response-schemas.md) — Every request/response schema

### 06 — Admin Panel (3 files, ~700 lines)
- [01-structure.md](./06-admin-panel/01-structure.md) — Layout, sidebar, navigation sections
- [02-sections-detail.md](./06-admin-panel/02-sections-detail.md) — Every page's purpose and UI
- [03-settings-tabs.md](./06-admin-panel/03-settings-tabs.md) — 10 settings tabs with full field specs

### 07 — Security (3 files, ~600 lines)
- [01-auth-system.md](./07-security/01-auth-system.md) — JWT, cookies, middleware, login flow
- [02-encryption.md](./07-security/02-encryption.md) — AES-256-GCM for API keys, mask/encrypt/decrypt
- [03-upload-protection.md](./07-security/03-upload-protection.md) — MIME allowlist, size limits, sanitization

### 08 — Deployment (3 files, ~800 lines)
- [01-docker-setup.md](./08-deployment/01-docker-setup.md) — Dockerfile, compose.yml, entrypoint.sh
- [02-environment-variables.md](./08-deployment/02-environment-variables.md) — Every env var with defaults and backup strategy
- [03-package-and-scripts.md](./08-deployment/03-package-and-scripts.md) — package.json, tsconfig, eslint, scripts

### 09 — Prompts (10 files, ~1,600 lines)
- [00-master-prompt.md](./09-prompts/00-master-prompt.md) — Rebuild orchestration prompt
- [01-infrastructure-prompt.md](./09-prompts/01-infrastructure-prompt.md) — Docker + config files
- [02-database-prompt.md](./09-prompts/02-database-prompt.md) — Schema + migrations + seed
- [03-auth-prompt.md](./09-prompts/03-auth-prompt.md) — JWT auth + middleware + crypto
- [04-design-system-prompt.md](./09-prompts/04-design-system-prompt.md) — Fonts, CSS, admin UI
- [05-landing-prompt.md](./09-prompts/05-landing-prompt.md) — Landing sections + config
- [06-admin-blog-prompt.md](./09-prompts/06-admin-blog-prompt.md) — Posts + TipTap + AI generation
- [07-booking-prompt.md](./09-prompts/07-booking-prompt.md) — Booking system end-to-end
- [08-event-builder-prompt.md](./09-prompts/08-event-builder-prompt.md) — Landing builder with blocks
- [09-knowledge-base-prompt.md](./09-prompts/09-knowledge-base-prompt.md) — KB with search + edit mode

### 10 — UI Structure (6 files, ~2,700 lines) **← NEW**
- [01-layout-files.md](./10-ui-structure/01-layout-files.md) — Exact root/admin/landing/auth layouts
- [02-landing-page-ui.md](./10-ui-structure/02-landing-page-ui.md) — Home composition, full Hero + Navbar code
- [03-admin-ui-primitives.md](./10-ui-structure/03-admin-ui-primitives.md) — Exact code for Button, Card, Badge, Table, Form, StatCard, PageHeader
- [04-admin-page-composition.md](./10-ui-structure/04-admin-page-composition.md) — Dashboard, list pages, form pages, detail pages, tab pages
- [05-design-replication-guide.md](./10-ui-structure/05-design-replication-guide.md) — Spacing/type scales, shadows, timings, checklist
- [06-component-usage-cookbook.md](./10-ui-structure/06-component-usage-cookbook.md) — 12 copy-paste recipes (list, form, modal, auto-save, tabs, etc.)

## Quick Facts

| Metric | Value |
|--------|-------|
| Total snapshot files | 40 |
| Total lines of documentation | ~8,266 |
| Database tables | 15 |
| API endpoints | 37 |
| Admin pages | 15+ |
| Landing components | 15 |
| Admin UI primitives | 11 |
| Event block types | 14 |
| Email templates | 8 |
| Knowledge base articles | 30+ |
| Zod validation schemas | 20+ |
| Prisma migrations | 6 |
| Environment variables | 9 |

## Recommended Rebuild Path

1. Read [README](./README.md)
2. Read [00-master-prompt](./09-prompts/00-master-prompt.md)
3. Follow prompts 01 → 09 sequentially, referring to snapshot sections as needed
4. Each prompt is self-contained and specifies the snapshot sections to reference
