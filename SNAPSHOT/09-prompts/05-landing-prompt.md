# Prompt — Build Landing Page

## Context for LLM

```
Create the public landing page with 8 configurable sections, fed from site_config
in the database (with fallbacks to static defaults).

**1. src/lib/config/landing-defaults.ts**

TypeScript interfaces and default values for:
- ThemeConfig (7 colors)
- SectionsConfig (8 boolean toggles)
- HeroContent (title, titleAccent, tagline, ctaText, ctaHref, backgroundImage)
- AboutContent (heading parts, paragraphs, portrait, yearLabel, metrics)
- StatsContent (items with value/suffix/label)
- ContactContent
- SocialLinks (instagram, youtube, tiktok + handles)
- NavbarContent (brandFirst, brandSecond, ctaText)
- AIConfig (provider, keys, models, systemPrompt)
- EmailConfig (resendApiKey, fromName, fromEmail, contactEmailTo)

See SNAPSHOT/02-content/01-landing-copy.md for the EXACT default values.

CONFIG_KEYS array for type safety:
["theme", "sections", "hero", "about", "stats", "contact", "social", "navbar", "ai", "email"]

**2. src/lib/config/get-config.ts**

Server-side helper that fetches site_config from DB and merges with defaults:
```typescript
export async function getLandingConfig(): Promise<LandingConfig> {
  const configs = await prisma.siteConfig.findMany();
  const merged = { ...DEFAULT_CONFIG };
  for (const cfg of configs) {
    if (cfg.key in merged) {
      merged[cfg.key] = { ...merged[cfg.key], ...cfg.value };
    }
  }
  // Decrypt sensitive fields if needed
  return merged;
}
```

**3. src/app/page.tsx** (landing home)

Server component:
- Fetches config via getLandingConfig()
- Fetches latest 3 PUBLISHED posts
- Fetches 6 gallery=true images
- Renders sections conditionally based on sections.* flags:
  <Navbar /> (always)
  {sections.hero && <HeroSection />}
  <Divider />
  {sections.about && <AboutSection />}
  {sections.stats && <StatsBar />}
  {sections.gallery && <GallerySection images={...} />}
  {sections.achievements && <AchievementsSection />}
  {sections.blog && <BlogSection posts={...} />}
  {sections.newsletter && <NewsletterSection />}
  {sections.contact && <ContactSection />}
  <Footer />

**4. src/components/landing/** — Create 15 components:

- navbar.tsx — Fixed sticky header, mobile hamburger
- hero-section.tsx — Full-height, parallax BG, animated text, CTA button
- divider.tsx — Animated gradient line
- about-section.tsx — Portrait + 3 paragraphs + 3 metrics
- stats-bar.tsx — 4 animated counter items
- gallery-section.tsx → renders gallery-grid.tsx (masonry + lightbox)
- achievements-section.tsx — Timeline of 6 competitions
- blog-section.tsx → blog-cards.tsx (3-column post grid)
- newsletter-section.tsx — Email form with success state
- contact-section.tsx — Form + social/email panel
- footer.tsx — CTA strip + nav + legal + copyright
- section-wrapper.tsx — Shared section layout
- legal-layout.tsx — For privacy/terms/cookies pages
- theme-provider.tsx (optional)

Each component:
- Accepts typed props matching landing-defaults interfaces
- Uses `clamp()` for responsive sizing
- Uses Oswald for headings (font-display class)
- Uses Inter for body
- Landing color tokens (accent, void, surface, etc.)
- NO admin theme classes (no bg-card, no border-border)

**5. Animations:**

Use framer-motion for:
- Hero text reveal on load
- Section fade-in on scroll
- Stats number counter (from 0 to target over 1.5s)
- Nav hide on scroll down, show on scroll up

**6. Legal pages:**
- src/app/privacy/page.tsx
- src/app/cookies/page.tsx
- src/app/terms/page.tsx

Each uses <LegalLayout> and hardcoded text (Spanish legal boilerplate).

**7. Blog public pages:**
- src/app/blog/page.tsx — List all PUBLISHED posts, paginated (9/page)
- src/app/blog/[slug]/page.tsx — Single post with .post-content typography

**8. Gallery public page:**
- src/app/gallery/page.tsx — Full gallery, all gallery=true images, larger grid
```

## Validation

Visit `/` and verify:
- Hero loads with animated title reveal
- Gallery section shows featured images in masonry grid
- Lightbox opens on image click (keyboard nav works)
- Blog section shows latest 3 posts
- Newsletter form validates email and shows success
- Contact form submits to /api/contacts
- Navbar hides/shows on scroll
- Mobile: hamburger menu works, all sections responsive

Visit `/blog` → listing works, pagination works
Visit `/blog/[slug]` → styled post with diamond bullets, h2 accent lines

Edit `site_config.hero.title` in DB → changes appear after cache revalidation
