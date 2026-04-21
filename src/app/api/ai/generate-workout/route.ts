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
      temperature: 0.6,
      max_tokens: 2000,
      response_format: { type: "json_object" },
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
      format: "json",
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Local AI error (${res.status}): ${text.slice(0, 200) || res.statusText}`);
  }
  const data = await res.json();
  return data.message?.content || data.response || "";
}

const SYSTEM_PROMPT = `Eres un entrenador profesional IFBB Pro que disena rutinas de entrenamiento para clientes.

REGLAS:
- Responde SOLO con JSON valido, sin texto adicional.
- Adapta la intensidad (series, repeticiones, peso) al nivel declarado.
- Respeta las lesiones/limitaciones: evita ejercicios problematicos, reduce carga en zonas afectadas.
- Usa ejercicios reconocibles en Espana (press banca, sentadilla, peso muerto, dominada, remo, etc.).
- Incluye calentamiento en notas si es relevante.
- El peso puede ser descriptivo ("moderado", "60-70% RM") si no se sabe el 1RM.

FORMATO DE RESPUESTA:
{
  "title": "Nombre del entreno",
  "description": "Descripcion breve del enfoque",
  "weekDay": 1-6 o 0 (domingo) o null,
  "exercises": [
    {
      "name": "Nombre del ejercicio",
      "sets": 4,
      "reps": "8-10" o numero,
      "weight": "60 kg" o "moderado",
      "restSec": 90,
      "notes": "Tip tecnico o cuidado importante"
    }
  ]
}

IMPORTANTE: si hay lesion, anade siempre una "notes" con la precaucion relevante.`;

const DIFFICULTY_DESC: Record<string, string> = {
  beginner: "principiante (nunca ha entrenado o <6 meses)",
  intermediate: "intermedio (6-24 meses entrenando)",
  advanced: "avanzado (2+ anos entrenando)",
  pro: "competidor avanzado",
};

const DURATION_DESC: Record<string, string> = {
  short: "corto (30-45 min, 4-6 ejercicios)",
  medium: "medio (45-60 min, 6-8 ejercicios)",
  long: "largo (60-90 min, 8-10 ejercicios)",
};

function buildUserPrompt(opts: {
  muscleGroup?: string;
  goal?: string;
  difficulty?: string;
  equipment?: string;
  duration?: string;
  injuries?: string[];
  extra?: string;
}): string {
  const parts: string[] = [];
  if (opts.muscleGroup) parts.push(`Crea un entreno para: ${opts.muscleGroup}.`);
  else parts.push("Crea un entreno full body.");

  if (opts.goal) parts.push(`Objetivo: ${opts.goal}.`);
  if (opts.difficulty) parts.push(`Nivel: ${DIFFICULTY_DESC[opts.difficulty] || opts.difficulty}.`);
  if (opts.duration) parts.push(`Duracion ${DURATION_DESC[opts.duration] || opts.duration}.`);
  if (opts.equipment) parts.push(`Material disponible: ${opts.equipment}.`);

  if (opts.injuries && opts.injuries.length > 0) {
    parts.push(`IMPORTANTE - Lesiones/limitaciones: ${opts.injuries.join(", ")}. Adapta carga, rango y seleccion de ejercicios para no agravar estas zonas. Si es lesion de hombro, evita press militar estricto; si es rodilla, evita sentadillas profundas con peso alto; etc.`);
  }
  if (opts.extra) parts.push(`Notas adicionales: ${opts.extra}.`);
  return parts.join(" ");
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return jsonResponse({ success: false, error: "No autorizado" }, 401);
  }

  try {
    const body = await req.json();
    const ai = await getConfigSection("ai");
    const effectiveConfig: AIConfig = {
      ...ai,
      openaiApiKey: ai.openaiApiKey || process.env.OPENAI_API_KEY || "",
    };

    if (effectiveConfig.provider === "openai" && !effectiveConfig.openaiApiKey) {
      return jsonResponse({ success: false, error: "OpenAI no configurado" }, 400);
    }

    const userPrompt = buildUserPrompt(body as Parameters<typeof buildUserPrompt>[0]);

    let raw: string;
    if (effectiveConfig.provider === "local") {
      raw = await callLocal(effectiveConfig, SYSTEM_PROMPT, userPrompt);
    } else {
      raw = await callOpenAI(effectiveConfig, SYSTEM_PROMPT, userPrompt);
    }

    let parsed: Record<string, unknown> | null = null;
    try { parsed = JSON.parse(raw); } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch { /* noop */ } }
    }
    if (!parsed || typeof parsed !== "object") {
      return jsonResponse({ success: false, error: "La IA no devolvio un entreno valido" }, 500);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawExercises = Array.isArray((parsed as any).exercises) ? (parsed as any).exercises : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exercises = rawExercises.map((e: any) => ({
      name: String(e.name || ""),
      sets: e.sets != null ? (typeof e.sets === "number" ? e.sets : String(e.sets)) : undefined,
      reps: e.reps != null ? String(e.reps) : undefined,
      weight: e.weight != null ? String(e.weight) : undefined,
      restSec: e.restSec != null && !Number.isNaN(Number(e.restSec)) ? Number(e.restSec) : undefined,
      notes: e.notes != null ? String(e.notes) : undefined,
    })).filter((e: { name: string }) => e.name.length > 0);

    return jsonResponse({
      success: true,
      data: {
        title: String(parsed.title || "Entrenamiento"),
        description: String(parsed.description || ""),
        weekDay: parsed.weekDay != null && parsed.weekDay !== "null" ? Number(parsed.weekDay) : null,
        exercises,
      },
    });
  } catch (err) {
    return jsonResponse(
      { success: false, error: err instanceof Error ? err.message : "Error interno" },
      500,
    );
  }
}
