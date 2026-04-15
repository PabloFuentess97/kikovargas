import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getConfigSection } from "@/lib/config/get-config";
import type { AIConfig } from "@/lib/config/landing-defaults";

export const runtime = "nodejs";

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

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
      temperature: 0.9,
      max_tokens: 2000,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI error (${res.status}): ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

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
    throw new Error(`Local AI error (${res.status}): ${text.slice(0, 200) || res.statusText}`);
  }

  const data = await res.json();
  return data.message?.content || data.response || "";
}

interface Idea {
  title: string;
  description: string;
  tags: string[];
}

function parseIdeas(raw: string): Idea[] {
  // Try JSON array
  const jsonMatch = raw.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
        return parsed.map((item: Record<string, unknown>) => ({
          title: String(item.title || ""),
          description: String(item.description || ""),
          tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
        }));
      }
    } catch {
      // fall through
    }
  }

  // Fallback: numbered list
  const ideas: Idea[] = [];
  const lines = raw.split("\n").filter((l) => l.trim());
  let current: Partial<Idea> | null = null;

  for (const line of lines) {
    const titleMatch = line.match(/^\d+[\.\)]\s*\*{0,2}(.+?)\*{0,2}\s*$/);
    if (titleMatch) {
      if (current?.title) ideas.push({ title: current.title, description: current.description || "", tags: current.tags || [] });
      current = { title: titleMatch[1].replace(/^["']|["']$/g, "").trim() };
    } else if (current) {
      current.description = ((current.description || "") + " " + line.trim()).trim();
    }
  }
  if (current?.title) ideas.push({ title: current.title, description: current.description || "", tags: current.tags || [] });

  return ideas;
}

// POST /api/ai/generate-ideas
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return jsonResponse({ success: false, error: "No autorizado" }, 403);
  }

  try {
    const body = await req.json();
    const { niche, count = 5 } = body as { niche?: string; count?: number };

    const aiConfig = await getConfigSection("ai");

    if (aiConfig.provider === "openai" && !aiConfig.openaiApiKey) {
      return jsonResponse(
        { success: false, error: "API key de OpenAI no configurada. Ve a Configuracion > IA." },
        400,
      );
    }

    const systemPrompt = aiConfig.systemPrompt;

    const userPrompt = `Genera exactamente ${Math.min(count, 10)} ideas originales para articulos de blog${niche ? ` sobre el nicho: "${niche}"` : " sobre fitness, bodybuilding y vida saludable"}.

Responde EXCLUSIVAMENTE con un JSON array valido (sin markdown, sin backticks, solo el JSON):
[
  {
    "title": "Titulo atractivo del articulo",
    "description": "Descripcion breve de 1-2 frases sobre que trataria el articulo",
    "tags": ["tag1", "tag2", "tag3"]
  }
]

Las ideas deben ser:
- Variadas entre si (no repetir temas similares)
- Con titulos atractivos y clickables
- Enfocadas en aportar valor al lector
- En espanol`;

    let rawResponse: string;

    if (aiConfig.provider === "local") {
      rawResponse = await callLocal(aiConfig, systemPrompt, userPrompt);
    } else {
      rawResponse = await callOpenAI(aiConfig, systemPrompt, userPrompt);
    }

    const ideas = parseIdeas(rawResponse);

    if (ideas.length === 0) {
      throw new Error("No se pudieron generar ideas. Intenta de nuevo.");
    }

    return jsonResponse({ success: true, data: { ideas } });
  } catch (err) {
    console.error("[ai/generate-ideas] Error:", err);
    const message = err instanceof Error ? err.message : "Error al generar ideas";
    return jsonResponse({ success: false, error: message }, 500);
  }
}
