import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

// GET /api/clients/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const client = await prisma.user.findFirst({
    where: { id, role: "USER" },
    select: {
      id: true, name: true, email: true, active: true, phone: true,
      birthDate: true, startedAt: true, monthlyFee: true, notes: true,
      createdAt: true,
    },
  });
  if (!client) return error("Cliente no encontrado", 404);

  return success(client);
}

// PATCH /api/clients/:id
const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).max(100).optional(),  // sólo si el admin lo resetea
  phone: z.string().max(30).optional().nullable(),
  birthDate: z.string().datetime().optional().nullable(),
  startedAt: z.string().datetime().optional().nullable(),
  monthlyFee: z.number().int().min(0).optional().nullable(),
  heightCm: z.number().int().min(50).max(260).optional().nullable(),
  notes: z.string().max(2000).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const existing = await prisma.user.findFirst({ where: { id, role: "USER" } });
  if (!existing) return error("Cliente no encontrado", 404);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { ...parsed.data };
  if (data.password) data.password = await bcrypt.hash(data.password, 12);
  if (data.birthDate !== undefined) data.birthDate = data.birthDate ? new Date(data.birthDate) : null;
  if (data.startedAt !== undefined) data.startedAt = data.startedAt ? new Date(data.startedAt) : null;

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true },
  });

  return success(updated);
}

// DELETE /api/clients/:id — cascade deletes workouts/tasks/docs/diets/invoices
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const existing = await prisma.user.findFirst({ where: { id, role: "USER" } });
  if (!existing) return error("Cliente no encontrado", 404);

  await prisma.user.delete({ where: { id } });
  return success({ deleted: true });
}
