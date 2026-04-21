import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  category: z.string().max(50).optional(),
  servings: z.number().int().min(1).max(50).optional(),
  prepTimeMin: z.number().int().min(0).max(600).optional().nullable(),
  cookTimeMin: z.number().int().min(0).max(600).optional().nullable(),
  allergens: z.array(z.string()).optional(),
  ingredients: z.array(z.any()).optional(),
  steps: z.array(z.string()).optional(),
  macros: z.any().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const existing = await prisma.recipe.findUnique({ where: { id } });
  if (!existing) return error("Receta no encontrada", 404);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { ...parsed.data };

  const updated = await prisma.recipe.update({ where: { id }, data });
  return success(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const existing = await prisma.recipe.findUnique({ where: { id } });
  if (!existing) return error("Receta no encontrada", 404);

  await prisma.recipe.delete({ where: { id } });
  return success({ deleted: true });
}
