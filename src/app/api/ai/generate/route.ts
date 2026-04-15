import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getConfigSection } from "@/lib/config/get-config";
import type { AIConfig } from "@/lib/config/landing-defaults";

export const runtime = "nodejs";

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

/** Call OpenAI Chat Completions API */
async function callOpenAI(config: AIConfig, systemPrompt: string, userPrompt: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: config.openaiModel || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `OpenAI error (${res.status}): ${err.error?.message || res.statusText}`,
    );
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

/** Call local Ollama-compatible API */
async function callLocal(config: AIConfig, systemPrompt: string, userPrompt: string) {
  const endpoint = (config.localEndpoint || "http://localhost:11434").replace(/\/$/, "");

  const res = await fetch(`${endpoint}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.localModel || "llama3",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      stream: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Local AI error (${res.status}): ${text.slice(0, 200) || res.statusText}`,
    );
  }

  const data = await res.json();
  return data.message?.content || data.response || "";
}

/** Parse the AI response to extract title and content */
function parseResponse(raw: string): { title: string; content: string } {
  // Try to extract JSON from the response
  const jsonMatch = raw.match(/\{[\s\S]*"title"[\s\S]*"content"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.title && parsed.content) {
        return { title: parsed.title, content: parsed.content };
      }
    } catch {
      // Fall through to text parsing
    }
  }

  // Try to extract from markers
  const titleMatch = raw.match(/(?:TITULO|TITLE|# )[:：]?\s*(.+)/i);
  const contentMatch = raw.match(
    /(?:CONTENIDO|CONTENT)[:：]?\s*([\s\S]+)/i,
  );

  if (titleMatch && contentMatch) {
    return {
      title: titleMatch[1].trim().replace(/^["']|["']$/g, ""),
      content: contentMatch[1].trim(),
    };
  }

  // Fallback: first line is title, rest is content
  const lines = raw.trim().split("\n");
  const title = lines[0].replace(/^#+\s*/, "").replace(/^["']|["']$/g, "").trim();
  const content = lines.slice(1).join("\n").trim();

  return { title: title || "Articulo generado", content: content || raw };
}

// POST /api/ai/generate
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return jsonResponse({ success: false, error: "No autorizado" }, 403);
  }

  try {
    const body = await req.json();
    const { topic, context } = body as { topic?: string; context?: string };

    if (!topic || topic.trim().length < 3) {
      return jsonResponse(
        { success: false, error: "El tema debe tener al menos 3 caracteres" },
        400,
      );
    }

    // Get AI config
    const aiConfig = await getConfigSection("ai");

    if (aiConfig.provider === "openai" && !aiConfig.openaiApiKey) {
      return jsonResponse(
        { success: false, error: "API key de OpenAI no configurada. Ve a Configuracion > IA." },
        400,
      );
    }

    // Build prompts — global context is ALWAYS used as system prompt
    const systemPrompt = aiConfig.systemPrompt;

    const extraContext = context ? `\nContexto adicional: ${context}\n` : "";

    const userPrompt = `${extraContext}Genera un articulo de blog sobre el siguiente tema: "${topic}"

Responde EXCLUSIVAMENTE con un JSON valido con esta estructura (sin markdown, sin backticks, solo el JSON):
{
  "title": "titulo del articulo",
  "content": "contenido completo en HTML"
}

El contenido debe estar en HTML con estas etiquetas:
- <h2> para secciones principales
- <h3> para subsecciones
- <p> para parrafos
- <strong> para texto importante
- <em> para enfasis
- <ul> y <li> para listas
- <blockquote> para citas destacadas

El articulo debe tener al menos 500 palabras, ser informativo y profesional.
Escribe en espanol.`;

    // Call the appropriate provider
    let rawResponse: string;

    if (aiConfig.provider === "local") {
      rawResponse = await callLocal(aiConfig, systemPrompt, userPrompt);
    } else {
      rawResponse = await callOpenAI(aiConfig, systemPrompt, userPrompt);
    }

    // Parse the response
    const { title, content } = parseResponse(rawResponse);

    return jsonResponse({
      success: true,
      data: { title, content },
    });
  } catch (err) {
    console.error("[ai/generate] Error:", err);
    const message = err instanceof Error ? err.message : "Error al generar contenido";
    return jsonResponse({ success: false, error: message }, 500);
  }
}
