import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
  weekDay: z.number().int().min(0).max(6).optional().nullable(),
  exercises: z.array(z.any()).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; workoutId: string }> }) {
  await requireAdmin();
  const { id: clientId, workoutId } = await params;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const existing = await prisma.workout.findFirst({ where: { id: workoutId, clientId }, select: { id: true } });
  if (!existing) return error("Entrenamiento no encontrado", 404);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { ...parsed.data };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (data.exercises) data.exercises = data.exercises as any;

  const updated = await prisma.workout.update({ where: { id: workoutId }, data });
  return success(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; workoutId: string }> }) {
  await requireAdmin();
  const { id: clientId, workoutId } = await params;

  const existing = await prisma.workout.findFirst({ where: { id: workoutId, clientId }, select: { id: true } });
  if (!existing) return error("Entrenamiento no encontrado", 404);

  await prisma.workout.delete({ where: { id: workoutId } });
  return success({ deleted: true });
}
