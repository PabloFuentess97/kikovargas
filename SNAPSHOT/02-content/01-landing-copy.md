# Landing Page — Exact Copy

All texts verbatim. Stored as defaults in `src/lib/config/landing-defaults.ts` and editable from `/dashboard/settings`.

## Navbar

- **Brand part 1:** `Kiko`
- **Brand part 2 (accent):** `Vargas`
- **CTA button:** `Hablemos`

**Nav links** (filtered by enabled sections):
- `Sobre mí` → `#about`
- `Galería` → `#gallery`
- `Logros` → `#achievements`
- `Blog` → `#blog`
- `Contacto` → `#contact`

## Hero Section

- **Title line 1:** `KIKO`
- **Title line 2 (accent):** `VARGAS`
- **Tagline:** `IFBB Pro — Bodybuilder — Coach`
- **CTA text:** `Colaboraciones`
- **CTA link:** `#contact`
- **Background image:** `/images/hero-bg.jpg`

## About Section

- **Heading part 1:** `Mas que un`
- **Heading part 2 (accent):** `deporte,`
- **Heading part 3:** `un estilo de vida`

**Paragraphs:**

1. `Llevo mas de 15 anos dedicado al bodybuilding competitivo. Lo que comenzo como una disciplina personal se convirtio en mi forma de vida, mi carrera y mi manera de inspirar a otros.`

2. `Cada competencia es una prueba de compromiso. Cada entrenamiento es una decision de ser mejor. No busco atajos — busco resultados que hablen por si solos en el escenario.`

3. `Hoy, ademas de competir a nivel profesional, me dedico a preparar atletas que quieran llevar su fisico al siguiente nivel.`

- **Portrait image:** `/images/about-portrait.jpg`
- **Year label:** `Est. 2009`

**Metrics (3 cards):**
| Number | Label |
|--------|-------|
| `15+` | `Anos compitiendo` |
| `200+` | `Atletas preparados` |
| `3x` | `Campeon nacional` |

## Stats Bar

4 animated counter items:
| Value | Suffix | Label |
|-------|--------|-------|
| 15 | `+` | `Anos de experiencia` |
| 3 | `x` | `Campeon nacional` |
| 200 | `+` | `Atletas preparados` |
| 12 | `+` | `Competencias IFBB` |

## Achievements Section (hardcoded)

- **Label (eyebrow):** `Trayectoria`
- **Heading:** `Cada título se`
- **Heading accent:** `ganó en el gym`
- **Section number:** `03`

**Timeline entries:**
1. **2024** — IFBB Pro League — South American Championship — **Top 5** (Winner badge)
2. **2023** — Campeonato Nacional IFBB — Categoría Bodybuilding — **1er Lugar** (Winner badge)
3. **2022** — Arnold Classic Amateur — Men's Bodybuilding — **Top 10**
4. **2021** — Campeonato Nacional IFBB — Overall Winner — **1er Lugar** (Winner badge)
5. **2020** — Mr. Universe — NABBA — Open Division — **2do Lugar**
6. **2019** — Campeonato Nacional IFBB — Categoría Pesados — **1er Lugar** (Winner badge)

## Gallery Section

- **Label:** `Galería`
- **Heading:** `El trabajo habla`
- **Heading accent:** `por sí solo`
- **Empty state:** `Próximamente — nuevas fotos en camino.`
- **CTA:** `Ver galería completa` → `/gallery`

## Blog Section

- **Label:** `Blog`
- **Heading:** `El camino se`
- **Heading accent:** `documenta`
- **Empty state:** `Próximamente — nuevos artículos en camino.`
- **CTA:** `Ver todos` → `/blog`

## Newsletter Section

- **Eyebrow:** `Newsletter`
- **Heading:** `Contenido exclusivo en tu email`
- **Description:** `Recibe articulos, consejos de entrenamiento y novedades directamente en tu bandeja de entrada. Sin spam, solo valor.`
- **Submit button:** `Suscribirme`
- **Footnote:** `Puedes cancelar en cualquier momento. Sin spam.`

## Contact Section

- **Heading:** `Hablemos de`
- **Heading accent:** `tu proyecto`
- **Description:** `Sponsorships, colaboraciones con marcas, sesiones fotograficas y coaching personalizado para competidores.`
- **Email:** `contacto@kikovargass.com`
- **CTA:** `Enviar mensaje`

### Contact form fields

| Field | Placeholder | Required |
|-------|-------------|----------|
| Name | `Tu nombre` | Yes |
| Email | `tu@email.com` | Yes |
| Phone | `+52 555 123 4567` | No |
| Subject | `Colaboración, coaching...` | Yes |
| Message | `Cuéntame sobre tu proyecto o propuesta...` | Yes |

**Success card:**
- Title: `Mensaje enviado`
- Body: `Te responderé lo antes posible.`
- Button: `Enviar otro mensaje`

**Section labels:**
- `Colaboraciones` (section heading)
- `Email directo`
- `Redes sociales`

## Footer

### CTA Strip (above main footer)
- **Eyebrow:** `Listo para el siguiente nivel?`
- **Heading:** `Trabajemos`
- **Heading accent:** `juntos`
- **CTA:** `Iniciar conversación`

### Main Footer
- **Brand:** `Kiko Vargas`
- **Description:** `IFBB Professional Bodybuilder. Competición, coaching y marca personal.`

**Nav links (filtered by enabled sections):** same as navbar.

**Legal links:**
- `Privacidad` → `/privacy`
- `Cookies` → `/cookies`
- `Términos` → `/terms`

**Copyright:** `© [YEAR] Kiko Vargas — Desarrollado por Uxea Soluciones`

## Social Links

```typescript
{
  instagram: "https://instagram.com/kikovargass",
  instagramHandle: "@kikovargass",

  youtube: "https://youtube.com/@kikovargass",
  youtubeHandle: "Kiko Vargas",

  tiktok: "https://tiktok.com/@kikovargass",
  tiktokHandle: "@kikovargass",
}
```

## Sections Toggle

All sections can be enabled/disabled from Settings → Sections:
```typescript
{
  hero: true,
  about: true,
  stats: true,
  gallery: true,
  achievements: true,
  blog: true,
  newsletter: true,
  contact: true,
}
```
