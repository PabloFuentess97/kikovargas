import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  category: z.enum(["DAILY", "WEEKLY", "GENERAL"]).optional(),
  completed: z.boolean().optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  await requireAdmin();
  const { id: clientId, taskId } = await params;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const existing = await prisma.clientTask.findFirst({ where: { id: taskId, clientId }, select: { id: true } });
  if (!existing) return error("Tarea no encontrada", 404);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { ...parsed.data };
  if (data.completed !== undefined) data.completedAt = data.completed ? new Date() : null;
  if (data.dueDate !== undefined) data.dueDate = data.dueDate ? new Date(data.dueDate) : null;

  const updated = await prisma.clientTask.update({ where: { id: taskId }, data });
  return success(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  await requireAdmin();
  const { id: clientId, taskId } = await params;

  const existing = await prisma.clientTask.findFirst({ where: { id: taskId, clientId }, select: { id: true } });
  if (!existing) return error("Tarea no encontrada", 404);

  await prisma.clientTask.delete({ where: { id: taskId } });
  return success({ deleted: true });
}
