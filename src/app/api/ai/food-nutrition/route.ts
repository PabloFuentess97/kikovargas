import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getConfigSection } from "@/lib/config/get-config";
import type { AIConfig } from "@/lib/config/landing-defaults";

export const runtime = "nodejs";

function jsonResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

/* ─── AI callers (shared pattern) ─────────────────── */

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
      temperature: 0.2, // determinista — los macros no son creativos
      max_tokens: 300,
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

/* ─── Parse ───────────────────────────────────────── */

interface NutritionResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
}

function clean(n: unknown): number {
  if (typeof n === "number" && !Number.isNaN(n) && Number.isFinite(n)) {
    return Math.round(n * 10) / 10; // 1 decimal
  }
  if (typeof n === "string") {
    const parsed = parseFloat(n.replace(",", "."));
    if (!Number.isNaN(parsed)) return Math.round(parsed * 10) / 10;
  }
  return 0;
}

function parseNutrition(raw: string): NutritionResult | null {
  // Try direct JSON
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === "object") {
      return {
        calories: clean(obj.calories ?? obj.kcal ?? obj.calorias),
        protein: clean(obj.protein ?? obj.proteinas ?? obj.proteina ?? obj.p),
        carbs: clean(obj.carbs ?? obj.carbohydrates ?? obj.carbohidratos ?? obj.c),
        fat: clean(obj.fat ?? obj.fats ?? obj.grasa ?? obj.grasas ?? obj.g),
        notes: typeof obj.notes === "string" ? obj.notes : undefined,
      };
    }
  } catch {
    /* fall through */
  }

  // Extract first JSON object from text
  const match = raw.match(/\{[\s\S]*?\}/);
  if (match) {
    try {
      const obj = JSON.parse(match[0]);
      return {
        calories: clean(obj.calories ?? obj.kcal),
        protein: clean(obj.protein ?? obj.proteinas ?? obj.p),
        carbs: clean(obj.carbs ?? obj.c),
        fat: clean(obj.fat ?? obj.g),
        notes: typeof obj.notes === "string" ? obj.notes : undefined,
      };
    } catch {
      /* fall */
    }
  }

  return null;
}

/* ─── Handler ─────────────────────────────────────── */

const SYSTEM_PROMPT = `Eres un asistente nutricional especializado. Tu tarea es devolver los macronutrientes EXACTOS de un alimento en la cantidad especificada.

REGLAS:
- Responde SOLO con JSON valido, sin texto adicional, sin markdown.
- Usa valores medios estandar de referencia (USDA, BEDCA, tablas espanolas estandar).
- Si el alimento es generico (ej. "pollo"), asume la version mas comun (pollo a la plancha sin piel).
- Si el alimento no es real o es ambiguo, devuelve todos los valores en 0 y un campo "notes" con el motivo.
- Los valores son para la cantidad EXACTA solicitada (no por 100g).

FORMATO DE RESPUESTA:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number
}

Todos los valores en gramos excepto calories (kcal). Acepta 1 decimal de precision.`;

function buildUserPrompt(name: string, grams: number): string {
  return `Dame los macros para ${grams}g de "${name}". Responde solo con el JSON.`;
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return jsonResponse({ success: false, error: "No autorizado" }, 401);
  }

  try {
    const body = await req.json();
    const { name, grams } = body as { name?: string; grams?: number };

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return jsonResponse(
        { success: false, error: "Nombre del alimento requerido (min 2 caracteres)" },
        422,
      );
    }

    const g = typeof grams === "number" && grams > 0 ? grams : 100;
    if (g > 5000) {
      return jsonResponse(
        { success: false, error: "La cantidad es excesiva (max 5000g)" },
        422,
      );
    }

    const ai = await getConfigSection("ai");

    // Fallback to env var if DB config is empty
    const effectiveConfig: AIConfig = {
      ...ai,
      openaiApiKey: ai.openaiApiKey || process.env.OPENAI_API_KEY || "",
    };

    if (effectiveConfig.provider === "openai" && !effectiveConfig.openaiApiKey) {
      return jsonResponse(
        { success: false, error: "OpenAI no configurado. Ve a Configuracion > IA." },
        400,
      );
    }

    const userPrompt = buildUserPrompt(name.trim(), g);

    let raw: string;
    try {
      if (effectiveConfig.provider === "local") {
        raw = await callLocal(effectiveConfig, SYSTEM_PROMPT, userPrompt);
      } else {
        raw = await callOpenAI(effectiveConfig, SYSTEM_PROMPT, userPrompt);
      }
    } catch (err) {
      return jsonResponse(
        { success: false, error: err instanceof Error ? err.message : "Error al llamar a la IA" },
        500,
      );
    }

    const nutrition = parseNutrition(raw);
    if (!nutrition) {
      return jsonResponse(
        { success: false, error: "La IA no devolvio un resultado valido. Intenta con otro nombre." },
        500,
      );
    }

    // If all zeros, signal to the client
    const isEmpty = !nutrition.calories && !nutrition.protein && !nutrition.carbs && !nutrition.fat;

    return jsonResponse({
      success: true,
      data: {
        name: name.trim(),
        grams: g,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        empty: isEmpty,
        notes: nutrition.notes,
      },
    });
  } catch (err) {
    console.error("[ai/food-nutrition] Error:", err);
    return jsonResponse(
      { success: false, error: "Error interno al procesar la peticion" },
      500,
    );
  }
}
