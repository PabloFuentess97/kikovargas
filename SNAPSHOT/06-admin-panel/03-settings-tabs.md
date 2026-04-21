# Admin Panel — Settings Tabs

The settings page (`/dashboard/settings`) has 10 tabs, each editing one section of `site_config`.

## Tab 1: Colores (Theme)

Key: `theme`
```typescript
{
  accentColor: string,       // e.g., "#c9a84c"
  accentHover: string,       // e.g., "#dfc06a"
  bgVoid: string,            // "#030303"
  bgSurface: string,         // "#070707"
  bgElevated: string,        // "#0f0f0f"
  textPrimary: string,       // "#ededed"
  textSecondary: string      // "#7a7a7a"
}
```

UI: 7 color picker inputs with live preview of how colors are used.

## Tab 2: Secciones (Sections Visibility)

Key: `sections`
```typescript
{
  hero: boolean,
  about: boolean,
  stats: boolean,
  gallery: boolean,
  achievements: boolean,
  blog: boolean,
  newsletter: boolean,
  contact: boolean
}
```

UI: 8 toggle switches. Disabled sections don't render on landing.

## Tab 3: Hero

Key: `hero`
```typescript
{
  title: string,             // e.g., "KIKO"
  titleAccent: string,       // e.g., "VARGAS" (gold color)
  tagline: string,           // "IFBB Pro — Bodybuilder — Coach"
  ctaText: string,           // "Colaboraciones"
  ctaHref: string,           // "#contact"
  backgroundImage: string    // URL or /images/hero-bg.jpg
}
```

## Tab 4: Sobre mi (About)

Key: `about`
```typescript
{
  heading: string,           // "Mas que un"
  headingAccent: string,     // "deporte,"
  headingSuffix: string,     // "un estilo de vida"
  paragraphs: string[],      // Dynamic array, add/remove buttons
  portraitImage: string,
  yearLabel: string,         // "Est. 2009"
  metrics: { num: string, text: string }[]
}
```

UI:
- 3 heading parts (each single line input)
- Portrait URL with "Elegir de la galería" button
- Year label
- Paragraphs list (textarea per item, + Add button)
- Metrics list (num + text per item, + Add button)

## Tab 5: Estadisticas (Stats Bar)

Key: `stats`
```typescript
{
  items: { value: number, suffix: string, label: string }[]
}
```

UI: Dynamic list of stats. Each row: number input, suffix input (e.g., `+`, `x`), label input.

## Tab 6: Contacto

Key: `contact`
```typescript
{
  heading: string,           // "Hablemos de"
  headingAccent: string,     // "tu proyecto"
  description: string,       // Textarea
  email: string,             // "contacto@kikovargass.com"
  ctaText: string            // "Enviar mensaje"
}
```

## Tab 7: Redes (Social)

Key: `social`
```typescript
{
  instagram: string,         // Full URL
  instagramHandle: string,   // "@kikovargass"
  youtube: string,
  youtubeHandle: string,
  tiktok: string,
  tiktokHandle: string
}
```

UI: 3 social platforms × (URL + handle input).

## Tab 8: Navbar

Key: `navbar`
```typescript
{
  brandFirst: string,        // "Kiko"
  brandSecond: string,       // "Vargas"
  ctaText: string            // "Hablemos"
}
```

## Tab 9: IA (AI Configuration)

Key: `ai` (with **encrypted `openaiApiKey`**)
```typescript
{
  provider: "openai" | "local",
  openaiApiKey: string,      // Encrypted in DB, masked in UI
  openaiModel: string,       // "gpt-4o-mini" | "gpt-4o" | "gpt-4.1-mini" | "gpt-4.1"
  localEndpoint: string,     // "http://localhost:11434"
  localModel: string,        // "llama3"
  systemPrompt: string       // Multi-line textarea
}
```

UI:
- Provider radio: OpenAI / Local (Ollama)
- If OpenAI:
  - API key input (password type, masked display "sk-a••••••xyz")
  - Model dropdown
- If Local:
  - Endpoint input (default `http://localhost:11434`)
  - Model input (e.g., `llama3`)
- System Prompt textarea (always visible)
- "Test connection" button (optional)

**Encryption:** When saving, if the user didn't change the masked value, preserve the existing encrypted DB value. If they entered new plaintext, encrypt it.

## Tab 10: Email

Key: `email` (with **encrypted `resendApiKey`**)
```typescript
{
  resendApiKey: string,      // Encrypted, masked
  fromName: string,          // "Kiko Vargas Web"
  fromEmail: string,         // "noreply@kikovargass.com"
  contactEmailTo: string     // "contacto@kikovargass.com"
}
```

UI:
- Resend API key (password input, masked "re_a••••••xyz")
- From name
- From email (must be verified domain in Resend, or `onboarding@resend.dev`)
- Contact email (where notifications go)

## Save Behavior

Each tab has its own save button:
```typescript
async function saveSection(key: ConfigKey, value: object) {
  await fetch("/api/config", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value })
  });
  // Shows "Guardado" indicator for 2 seconds
  // Next.js revalidates the landing page cache
}
```

## Reset to Defaults

Each tab has "Restablecer valores por defecto" button:
1. Confirms with user
2. PATCHes the key with the default from `src/lib/config/landing-defaults.ts`
3. Reloads form

## Sensitive Fields Config

```typescript
export const SENSITIVE_FIELDS: Record<ConfigKey, string[]> = {
  theme: [],
  sections: [],
  hero: [],
  about: [],
  stats: [],
  contact: [],
  social: [],
  navbar: [],
  ai: ["openaiApiKey"],
  email: ["resendApiKey"],
};
```

Used by `encryptSensitiveFields`, `decryptSensitiveFields`, `maskSensitiveFields` helpers.

## Cache Revalidation

After PATCH, the API calls:
```typescript
revalidatePath("/", "layout");
```

This invalidates the landing page cache so changes appear immediately.
