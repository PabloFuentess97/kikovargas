import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  active: z.boolean().optional(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  meals: z.array(z.any()).optional(),
  notes: z.string().max(4000).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; dietId: string }> }) {
  await requireAdmin();
  const { id: clientId, dietId } = await params;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const existing = await prisma.diet.findFirst({ where: { id: dietId, clientId }, select: { id: true, active: true } });
  if (!existing) return error("Dieta no encontrada", 404);

  // If becoming active, deactivate siblings
  if (parsed.data.active === true && !existing.active) {
    await prisma.diet.updateMany({
      where: { clientId, active: true, id: { not: dietId } },
      data: { active: false },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { ...parsed.data };
  if (data.startDate !== undefined) data.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.endDate !== undefined) data.endDate = data.endDate ? new Date(data.endDate) : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (data.meals) data.meals = data.meals as any;

  const updated = await prisma.diet.update({ where: { id: dietId }, data });
  return success(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; dietId: string }> }) {
  await requireAdmin();
  const { id: clientId, dietId } = await params;

  const existing = await prisma.diet.findFirst({ where: { id: dietId, clientId }, select: { id: true } });
  if (!existing) return error("Dieta no encontrada", 404);

  await prisma.diet.delete({ where: { id: dietId } });
  return success({ deleted: true });
}
