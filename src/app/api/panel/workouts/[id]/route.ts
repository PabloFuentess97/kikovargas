import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

// PATCH /api/panel/workouts/:id — client can update the `exercises` JSON (mark as completed, etc.)
// Strict isolation: only allowed if workout belongs to session.sub
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return error("Unauthorized", 401);

  const { id } = await params;
  const body = (await req.json()) as { exercises?: unknown };

  if (body.exercises === undefined) {
    return error("Campo 'exercises' requerido", 422);
  }

  // Enforce ownership BEFORE update
  const workout = await prisma.workout.findUnique({
    where: { id },
    select: { clientId: true },
  });
  if (!workout || workout.clientId !== session.sub) {
    return error("No encontrado", 404);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await prisma.workout.update({
    where: { id },
    data: { exercises: body.exercises as any },
  });

  return success(updated);
}
