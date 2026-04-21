import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  category: z.string().max(50).optional(),
  meals: z.array(z.any()).optional(),
  notes: z.string().max(4000).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const existing = await prisma.dietTemplate.findUnique({ where: { id } });
  if (!existing) return error("Plantilla no encontrada", 404);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { ...parsed.data };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (data.meals) data.meals = data.meals as any;

  const updated = await prisma.dietTemplate.update({ where: { id }, data });
  return success(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const existing = await prisma.dietTemplate.findUnique({ where: { id } });
  if (!existing) return error("Plantilla no encontrada", 404);

  await prisma.dietTemplate.delete({ where: { id } });
  return success({ deleted: true });
}
