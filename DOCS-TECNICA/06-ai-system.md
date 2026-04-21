# 06 · Sistema de IA

## Arquitectura

Dos providers soportados, configurables desde el panel (`/dashboard/settings` → tab IA):

1. **OpenAI** (default) — via `https://api.openai.com/v1/*`
2. **Local** — endpoint compatible con Ollama (`http://localhost:11434/api/chat`)

La elección se hace por `SiteConfig.value.ai.provider` (`"openai"` | `"local"`).

**Archivos clave:**
- `src/app/api/ai/generate/route.ts` — generación de artículos
- `src/app/api/ai/generate-ideas/route.ts` — generación de ideas
- `src/app/api/ai/generate-image/route.ts` — generación de imágenes (solo OpenAI)

## Configuración (`site_config.ai`)

```typescript
interface AIConfig {
  provider: "openai" | "local";
  openaiApiKey: string;      // cifrado AES-256-GCM en DB
  openaiModel: string;       // "gpt-4o-mini" | "gpt-4o" | "gpt-4.1-mini" | "gpt-4.1"
  localEndpoint: string;     // default: "http://localhost:11434"
  localModel: string;        // default: "llama3"
  systemPrompt: string;      // instrucción global
}
```

El `systemPrompt` por defecto:
```
Eres un coach profesional de bodybuilding y fitness. Escribe articulos
informativos, motivadores y con autoridad. Usa un tono profesional pero
cercano. El contenido debe ser util para atletas y entusiastas del fitness.
```

## Flujo de selección de provider

```typescript
// src/app/api/ai/generate/route.ts (conceptual)

async function callAI(messages, settings) {
  const config = await getLandingConfig();
  const ai = config.ai;

  if (ai.provider === "local") {
    return callOllama(ai.localEndpoint, ai.localModel, messages, settings);
  }

  // OpenAI
  const apiKey = ai.openaiApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("No OpenAI API key configured");
  return callOpenAI(ai.openaiModel, apiKey, messages, settings);
}
```

**Fallback a env var:** si la API key no está en DB pero sí en `process.env.OPENAI_API_KEY`, se usa esa. Útil para dev/staging.

## Generación de artículos

**Endpoint:** `POST /api/ai/generate`

**Request:**
```typescript
{
  topic: string (min 3),
  context?: string
}
```

**User prompt construido:**
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

**Settings OpenAI:**
```typescript
{
  model: config.ai.openaiModel,
  messages: [
    { role: "system", content: config.ai.systemPrompt },
    { role: "user", content: userPrompt }
  ],
  temperature: 0.7,
  max_tokens: 4000,
  response_format: { type: "json_object" }  // fuerza JSON válido
}
```

**Settings Ollama:**
```typescript
{
  model: config.ai.localModel,
  messages: [...same...],
  stream: false,
  format: "json"
}
```

## Generación de ideas

**Endpoint:** `POST /api/ai/generate-ideas`

**Request:** `{ niche?: string, count?: number (1-10, default 5) }`

**User prompt:**
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

**Settings:** `temperature: 0.9`, `max_tokens: 2000`.

## Generación de imágenes

**Endpoint:** `POST /api/ai/generate-image`

**Solo disponible con provider `openai`.** Si `provider === "local"`, retorna 400. Ollama no tiene capacidad de imagen.

**Request:** `{ topic?: string, title?: string }` (al menos uno).

**Prompt template:**
```typescript
const prompt = `Professional fitness blog cover image about "${title || topic}".
Style: dark and moody atmosphere with black tones and gold accents.
High-quality photography, editorial feel, dramatic lighting.
No text, no watermarks, no logos. Cinematic composition.`;
```

**Call:**
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

**Post-procesamiento:**
1. OpenAI retorna URL temporal (válida ~1 hora).
2. Descarga la imagen a buffer.
3. Guarda en `public/uploads/ai-{timestamp}-{hash}.png`.
4. Crea registro `Image` en DB:
   ```typescript
   await prisma.image.create({
     data: {
       url: `/uploads/${filename}`,
       key: filename,
       alt: title || topic,
       mime: "image/png",
       gallery: false,
       // width/height/size no se calculan (performance)
     }
   });
   ```
5. Retorna `{ imageId, url }` al cliente.

**Coste aproximado:** ~$0.04 USD por imagen (DALL-E 3 standard 1792x1024).

## Parsing de respuestas

El contenido de `response.choices[0].message.content` puede ser:
1. JSON válido (si `response_format: json_object` funcionó) → parsear directamente.
2. JSON envuelto en markdown fences (```json ... ```) → regex extract.
3. Texto sin estructura (fallback Ollama especialmente).

**Fallback robusto:**
```typescript
function parseAIResponse(raw: string): { title: string; content: string } | null {
  // 1. JSON directo
  try {
    const obj = JSON.parse(raw);
    if (obj.title && obj.content) return obj;
  } catch {}

  // 2. Markdown fence
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenced) {
    try {
      const obj = JSON.parse(fenced[1]);
      if (obj.title && obj.content) return obj;
    } catch {}
  }

  // 3. Heuristics (TITULO:, CONTENIDO:, # markers)
  const titleMatch = raw.match(/(?:title|t[íi]tulo)[:\s]+(.+?)(?:\n|$)/i);
  const title = titleMatch?.[1]?.trim();
  if (title) {
    const content = raw.replace(titleMatch[0], "").trim();
    return { title, content };
  }

  // 4. Desesperado: primera línea como título, resto content
  const lines = raw.trim().split("\n");
  if (lines.length > 1) {
    return { title: lines[0], content: lines.slice(1).join("\n") };
  }

  return null;
}
```

## Manejo de errores

- `401` de OpenAI → "Clave API inválida o sin permisos".
- `429` de OpenAI → "Límite de rate o saldo insuficiente. Ver platform.openai.com/billing".
- Error de red a Ollama → "No se puede conectar al endpoint local ({endpoint}). ¿Ollama está corriendo?".
- `404` de Ollama (modelo no descargado) → sugerir `ollama pull {model}`.
- Parse falla → retornar 500 con el raw de la IA en el log (no al cliente).

Todos los errores al cliente están en español, user-friendly.

## Costes estimados OpenAI

| Operación | Modelo | Tokens IN | Tokens OUT | Coste aproximado |
|-----------|--------|-----------|------------|------------------|
| Artículo (1000 palabras) | gpt-4o-mini | ~500 | ~2000 | $0.005 |
| Artículo (1000 palabras) | gpt-4o | ~500 | ~2000 | $0.03 |
| 5 ideas | gpt-4o-mini | ~200 | ~600 | $0.002 |
| Imagen DALL-E 3 standard 1792x1024 | — | — | — | $0.04 |

**Mensual (10 artículos + 10 covers):** ~$0.50–$1.00 con gpt-4o-mini.

## Requisitos de Ollama local

- Ollama instalado (`ollama.ai`)
- Modelo descargado: `ollama pull llama3` (o el que se especifique)
- Servicio corriendo en `localhost:11434`
- Si la app está en Docker/VPS, el endpoint debe ser accesible (network, firewall)

**Limitación:** Ollama no puede generar imágenes. El cliente debe subir las portadas manualmente.

**Limitación calidad:** la calidad generada por Llama 3 es típicamente inferior a GPT-4o. Aceptable para borradores; revisar siempre.

## Extensibilidad

Para añadir un nuevo provider (ej. Anthropic Claude):

1. Añadir `"claude"` al type `AIConfig["provider"]`.
2. Añadir campos `claudeApiKey`, `claudeModel` a `AIConfig`.
3. Añadir la key `"claudeApiKey"` a `SENSITIVE_FIELDS.ai` en `src/lib/crypto.ts`.
4. Implementar `callClaude(apiKey, model, messages, settings)` en `/api/ai/generate/route.ts`.
5. Dispatch en la función principal según `ai.provider`.
6. Actualizar el tab "IA" de settings para mostrar/ocultar campos correspondientes.
