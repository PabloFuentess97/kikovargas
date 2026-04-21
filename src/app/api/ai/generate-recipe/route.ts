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
      temperature: 0.7,
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

const SYSTEM_PROMPT = `Eres un nutricionista experto que crea recetas detalladas para clientes de fitness y culturismo.

REGLAS:
- Responde SOLO con JSON valido, sin texto adicional.
- Los valores de macros son POR RACION (no totales).
- Respeta los alergenos indicados: NO uses ingredientes que los contengan.
- Si se pide objetivo calorico/macro especifico, ajusta cantidades.
- Pasos claros y concisos, en orden.
- Usa ingredientes comunes en Espana, gramos preferibles a "cucharada".

FORMATO DE RESPUESTA:
{
  "title": "Nombre de la receta",
  "description": "Resumen de 1-2 lineas",
  "category": "desayuno" | "comida" | "cena" | "snack",
  "servings": number (raciones),
  "prepTimeMin": number,
  "cookTimeMin": number,
  "allergens": string[] (alergenos reales de la receta final: ["gluten", "lactosa", ...]),
  "ingredients": [
    { "name": "Pechuga de pollo", "grams": 150, "notes": "a la plancha" }
  ],
  "steps": [
    "Paso 1 describiendo lo que hacer",
    "Paso 2 ...",
    "..."
  ],
  "macros": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number
  }
}`;

function buildUserPrompt(opts: {
  dishName?: string;
  goal?: string;
  allergens?: string[];
  targetCalories?: number;
  targetProtein?: number;
  preferences?: string;
  category?: string;
}): string {
  const parts: string[] = [];
  if (opts.dishName) parts.push(`Crea una receta de "${opts.dishName}".`);
  else parts.push(`Crea una receta ${opts.category ? `de tipo ${opts.category}` : "adecuada para fitness"}.`);

  if (opts.goal) parts.push(`Objetivo nutricional: ${opts.goal}.`);
  if (opts.targetCalories) parts.push(`Apunta a ~${opts.targetCalories} kcal por racion.`);
  if (opts.targetProtein) parts.push(`Prioriza al menos ${opts.targetProtein}g de proteina por racion.`);
  if (opts.allergens && opts.allergens.length > 0) parts.push(`IMPORTANTE - Alergenos a EVITAR: ${opts.allergens.join(", ")}. No uses ningun ingrediente que los contenga.`);
  if (opts.preferences) parts.push(`Preferencias/notas: ${opts.preferences}.`);

  return parts.join(" ");
}

function cleanNum(n: unknown): number {
  if (typeof n === "number" && Number.isFinite(n)) return Math.round(n * 10) / 10;
  if (typeof n === "string") {
    const p = parseFloat(n.replace(",", "."));
    if (!Number.isNaN(p)) return Math.round(p * 10) / 10;
  }
  return 0;
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return jsonResponse({ success: false, error: "No autorizado" }, 401);
  }

  try {
    const body = await req.json();
    const { dishName, goal, allergens, targetCalories, targetProtein, preferences, category } = body as {
      dishName?: string;
      goal?: string;
      allergens?: string[];
      targetCalories?: number;
      targetProtein?: number;
      preferences?: string;
      category?: string;
    };

    const ai = await getConfigSection("ai");
    const effectiveConfig: AIConfig = {
      ...ai,
      openaiApiKey: ai.openaiApiKey || process.env.OPENAI_API_KEY || "",
    };

    if (effectiveConfig.provider === "openai" && !effectiveConfig.openaiApiKey) {
      return jsonResponse({ success: false, error: "OpenAI no configurado" }, 400);
    }

    const userPrompt = buildUserPrompt({ dishName, goal, allergens, targetCalories, targetProtein, preferences, category });

    let raw: string;
    if (effectiveConfig.provider === "local") {
      raw = await callLocal(effectiveConfig, SYSTEM_PROMPT, userPrompt);
    } else {
      raw = await callOpenAI(effectiveConfig, SYSTEM_PROMPT, userPrompt);
    }

    // Parse
    let parsed: Record<string, unknown> | null = null;
    try { parsed = JSON.parse(raw); } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch { /* noop */ } }
    }
    if (!parsed || typeof parsed !== "object") {
      return jsonResponse({ success: false, error: "La IA no devolvio una receta valida" }, 500);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawIngredients = Array.isArray((parsed as any).ingredients) ? (parsed as any).ingredients : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ingredients = rawIngredients.map((i: any) => ({
      name: String(i.name || ""),
      grams: typeof i.grams === "number" ? i.grams : (i.grams ? Number(i.grams) : undefined),
      unit: typeof i.unit === "string" ? i.unit : undefined,
      notes: typeof i.notes === "string" ? i.notes : undefined,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawSteps = Array.isArray((parsed as any).steps) ? (parsed as any).steps : [];
    const steps = rawSteps.map((s: unknown) => String(s));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawAllergens = Array.isArray((parsed as any).allergens) ? (parsed as any).allergens : (allergens || []);
    const allergensOut = rawAllergens.map((a: unknown) => String(a));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = (parsed as any).macros || {};
    const macros = {
      calories: cleanNum(m.calories ?? m.kcal),
      protein: cleanNum(m.protein ?? m.proteinas ?? m.p),
      carbs: cleanNum(m.carbs ?? m.carbohidratos ?? m.c),
      fat: cleanNum(m.fat ?? m.grasa ?? m.g),
    };

    return jsonResponse({
      success: true,
      data: {
        title: String(parsed.title || "Receta"),
        description: String(parsed.description || ""),
        category: String(parsed.category || category || "general"),
        servings: Number(parsed.servings || 1),
        prepTimeMin: parsed.prepTimeMin != null ? Number(parsed.prepTimeMin) : null,
        cookTimeMin: parsed.cookTimeMin != null ? Number(parsed.cookTimeMin) : null,
        allergens: allergensOut,
        ingredients,
        steps,
        macros,
      },
    });
  } catch (err) {
    return jsonResponse(
      { success: false, error: err instanceof Error ? err.message : "Error interno" },
      500,
    );
  }
}
