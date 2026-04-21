import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id: clientId } = await params;

  const workouts = await prisma.workout.findMany({
    where: { clientId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return success({ workouts });
}

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
  weekDay: z.number().int().min(0).max(6).optional().nullable(),
  exercises: z.array(z.object({
    name: z.string(),
    sets: z.union([z.number(), z.string()]).optional(),
    reps: z.union([z.number(), z.string()]).optional(),
    weight: z.string().optional(),
    restSec: z.number().int().optional(),
    notes: z.string().optional(),
    completed: z.boolean().optional(),
  })).default([]),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id: clientId } = await params;

  const client = await prisma.user.findFirst({ where: { id: clientId, role: "USER" }, select: { id: true } });
  if (!client) return error("Cliente no encontrado", 404);

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0].message, 422);

  const workout = await prisma.workout.create({
    data: {
      clientId,
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      status: parsed.data.status ?? "ACTIVE",
      weekDay: parsed.data.weekDay ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exercises: parsed.data.exercises as any,
    },
  });

  return success(workout, 201);
}
