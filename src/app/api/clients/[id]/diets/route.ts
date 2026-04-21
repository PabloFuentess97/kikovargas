import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id: clientId } = await params;

  const diets = await prisma.diet.findMany({
    where: { clientId },
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  });

  return success({ diets });
}

const mealFoodSchema = z.object({
  name: z.string(),
  grams: z.number().optional(),
  calories: z.number().optional(),
  protein: z.number().optional(),
  carbs: z.number().optional(),
  fat: z.number().optional(),
});

const mealSchema = z.object({
  name: z.string(),
  time: z.string().optional(),
  foods: z.array(mealFoodSchema).default([]),
});

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  active: z.boolean().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  meals: z.array(mealSchema).default([]),
  notes: z.string().max(4000).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id: clientId } = await params;

  const client = await prisma.user.findFirst({ where: { id: clientId, role: "USER" }, select: { id: true } });
  if (!client) return error("Cliente no encontrado", 404);

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  // If a new diet is being marked active, deactivate any previously active diet for this client
  if (parsed.data.active !== false) {
    await prisma.diet.updateMany({
      where: { clientId, active: true },
      data: { active: false },
    });
  }

  const diet = await prisma.diet.create({
    data: {
      clientId,
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      active: parsed.data.active ?? true,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      meals: parsed.data.meals as any,
      notes: parsed.data.notes ?? "",
    },
  });

  return success(diet, 201);
}
