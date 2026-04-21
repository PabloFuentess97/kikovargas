import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

export async function GET() {
  await requireAdmin();
  const recipes = await prisma.recipe.findMany({ orderBy: [{ category: "asc" }, { createdAt: "desc" }] });
  return success({ recipes });
}

const ingredientSchema = z.object({
  name: z.string(),
  grams: z.number().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
});

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().max(50).optional(),
  servings: z.number().int().min(1).max(50).optional(),
  prepTimeMin: z.number().int().min(0).max(600).optional().nullable(),
  cookTimeMin: z.number().int().min(0).max(600).optional().nullable(),
  allergens: z.array(z.string()).optional(),
  ingredients: z.array(ingredientSchema).default([]),
  steps: z.array(z.string()).default([]),
  macros: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
  }).optional(),
  aiGenerated: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  await requireAdmin();
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const recipe = await prisma.recipe.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      category: parsed.data.category ?? "general",
      servings: parsed.data.servings ?? 1,
      prepTimeMin: parsed.data.prepTimeMin ?? null,
      cookTimeMin: parsed.data.cookTimeMin ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      allergens: (parsed.data.allergens ?? []) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ingredients: parsed.data.ingredients as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      steps: parsed.data.steps as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      macros: (parsed.data.macros ?? {}) as any,
      aiGenerated: parsed.data.aiGenerated ?? false,
    },
  });
  return success(recipe, 201);
}
