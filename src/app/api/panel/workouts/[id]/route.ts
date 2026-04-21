import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireClientAreaApi } from "@/lib/auth/api-client-access";
import { success, error } from "@/lib/api-response";

// PATCH /api/panel/workouts/:id — client updates the `exercises` JSON
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireClientAreaApi("workouts");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const body = (await req.json()) as { exercises?: unknown };

  if (body.exercises === undefined) {
    return error("Campo 'exercises' requerido", 422);
  }

  const workout = await prisma.workout.findUnique({
    where: { id },
    select: { clientId: true },
  });
  if (!workout) return error("No encontrado", 404);

  // Admins can modify any; clients only their own
  if (session!.role !== "ADMIN" && workout.clientId !== session!.sub) {
    return error("No encontrado", 404);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await prisma.workout.update({
    where: { id },
    data: { exercises: body.exercises as any },
  });

  return success(updated);
}
