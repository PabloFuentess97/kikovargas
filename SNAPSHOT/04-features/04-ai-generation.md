# Feature — AI Content Generation

## Overview

AI-powered content creation integrated throughout the admin. Supports:
- Blog post generation (full articles)
- Idea brainstorming (title + description + tags)
- Cover image generation (DALL-E 3)

**Two providers:**
1. **OpenAI** (recommended) — GPT-4o-mini / GPT-4o + DALL-E 3
2. **Ollama local** (privacy-focused) — Llama 3, Mistral, etc.

## Configuration

Stored in `site_config` under key `ai`:
```typescript
{
  provider: "openai" | "local",
  openaiApiKey: string,        // Encrypted AES-256-GCM
  openaiModel: string,         // "gpt-4o-mini" | "gpt-4o" | "gpt-4.1-mini" | "gpt-4.1"
  localEndpoint: string,       // "http://localhost:11434"
  localModel: string,          // "llama3"
  systemPrompt: string         // Context for all generations
}
```

**Default system prompt:**
```
Eres un coach profesional de bodybuilding y fitness. Escribe articulos
informativos, motivadores y con autoridad. Usa un tono profesional pero
cercano. El contenido debe ser util para atletas y entusiastas del fitness.
```

## Provider Selection Logic

```typescript
if (config.ai.provider === "local") {
  // Use Ollama at localEndpoint
  return callOllama(config.ai.localModel, messages);
}

// Default: OpenAI
const apiKey = config.ai.openaiApiKey || process.env.OPENAI_API_KEY;
return callOpenAI(config.ai.openaiModel, apiKey, messages);
```

## 1. Article Generation

### Endpoint
```http
POST /api/ai/generate
Auth: Admin
Body: {
  topic: "nutricion para ganar masa muscular",
  context?: "Enfocado en principiantes, con dieta semanal"
}
```

### User Prompt Template
```
Escribe un artículo de blog completo sobre: "{topic}"

{context ? `Contexto adicional: ${context}` : ''}

REQUISITOS:
- El artículo debe tener entre 800 y 1500 palabras.
- Usa una estructura clara con encabezados (h2, h3).
- Incluye listas con viñetas cuando sea apropiado.
- Usa negrita (<strong>) para puntos clave.
- Incluye al menos un blockquote con una idea importante.
- El contenido debe ser en español.

FORMATO DE RESPUESTA (JSON estricto):
{
  "title": "Título atractivo optimizado para SEO (50-70 caracteres)",
  "content": "<p>Párrafo introductorio...</p><h2>Primer tema</h2>..."
}

El HTML puede usar: p, h2, h3, strong, em, ul, li, ol, blockquote.
NO uses clases CSS ni estilos inline.
```

### OpenAI Call
```typescript
const response = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model: config.ai.openaiModel,
    messages: [
      { role: "system", content: config.ai.systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: "json_object" }
  })
});
```

### Response Parsing

Tries in order:
1. JSON parse (`response_format: json_object`)
2. Regex extraction for `"title":` and `"content":`
3. Line-based fallback (first line = title, rest = content)

Returns:
```json
{
  "success": true,
  "data": {
    "title": "Nutrición para ganar masa muscular",
    "content": "<p>...</p>"
  }
}
```

## 2. Ideas Generation

### Endpoint
```http
POST /api/ai/generate-ideas
Auth: Admin
Body: {
  niche?: "fitness femenino",
  count?: 5  // 1-10
}
```

### User Prompt Template
```
Genera {count} ideas de artículos de blog sobre: "{niche || 'fitness y bodybuilding'}".

Cada idea debe ser ÚNICA y específica. No repitas enfoques.

FORMATO DE RESPUESTA (JSON estricto):
{
  "ideas": [
    {
      "title": "Título específico y atractivo",
      "description": "Resumen de 2-3 líneas de lo que cubriría el artículo",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}

REQUISITOS:
- Títulos entre 40-70 caracteres.
- Descripciones claras y concretas.
- Tags específicos (no genéricos como "fitness").
- Contenido en español.
```

### Settings
- Temperature: `0.9` (high creativity)
- Max tokens: `2000`

### Response
```json
{
  "success": true,
  "data": {
    "ideas": [
      {
        "title": "5 ejercicios de pierna que no puedes faltar",
        "description": "Análisis detallado de los ejercicios más efectivos...",
        "tags": ["piernas", "entrenamiento", "hipertrofia"]
      }
    ]
  }
}
```

## 3. Image Generation (DALL-E 3)

### Endpoint
```http
POST /api/ai/generate-image
Auth: Admin
Body: {
  title?: "Nutrición para masa muscular",
  topic?: "nutrición"
}
```

### Prompt Engineered
```typescript
const prompt = `Professional fitness blog cover image about "${title || topic}".
Style: dark and moody atmosphere with black tones and gold accents.
High-quality photography, editorial feel, dramatic lighting.
No text, no watermarks, no logos. Cinematic composition.`;
```

### OpenAI Call
```typescript
const response = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  },
  body: JSON.stringify({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1792x1024",
    quality: "standard"
  })
});
```

### Post-processing
1. Download generated image from OpenAI URL
2. Save to `/public/uploads/ai-{timestamp}-{hash}.png`
3. Create `Image` DB record (with `gallery: false`)
4. Return `{ imageId, url }`

**Note:** Only works with OpenAI. Ollama does not generate images.

## Costs (OpenAI approx.)

| Operation | Model | Approx. Cost |
|-----------|-------|-------------|
| Article (1000 words) | gpt-4o-mini | $0.01-0.03 |
| Article (1000 words) | gpt-4o | $0.08-0.15 |
| 5 ideas | gpt-4o-mini | $0.005 |
| Cover image | dall-e-3 standard 1792x1024 | $0.04 |

**Monthly estimate** (10 articles + 10 covers): ~$0.50–$1.00

## Ollama Local Call

```typescript
const response = await fetch(`${config.ai.localEndpoint}/api/chat`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: config.ai.localModel,
    messages: [
      { role: "system", content: config.ai.systemPrompt },
      { role: "user", content: userPrompt }
    ],
    stream: false,
    format: "json"     // Request JSON output
  })
});

const data = await response.json();
const content = data.message.content;  // String to parse
```

### Setup Requirements
```bash
# Install Ollama from ollama.ai
# Then pull a model:
ollama pull llama3

# Verify:
ollama run llama3 "Hola"

# Ollama auto-starts as service; accessible at :11434
```

## Error Handling

Common errors returned:
- `401` — Invalid API key or no key configured
- `429` — Rate limit or insufficient credits
- `500` — Model error or network failure
- `400` — Invalid response format (couldn't parse JSON)

All errors return user-friendly Spanish messages.

## System Prompt Best Practices

**Good:**
```
Eres el asistente de contenido de Kiko Vargas, un profesional IFBB Pro
especializado en fitness, nutrición deportiva y preparación de competidores.
El tono debe ser profesional pero cercano. El público objetivo son atletas
avanzados y entusiastas del fitness. Todo el contenido en español.
```

**Too generic (avoid):**
```
Genera contenido de fitness.
```

Customizable from `/dashboard/settings` → AI tab.
