import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireClientAreaApi } from "@/lib/auth/api-client-access";
import { success, error } from "@/lib/api-response";

// PATCH /api/panel/tasks/:id — toggle completed
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireClientAreaApi("tasks");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const { id } = await params;
  const body = (await req.json()) as { completed?: boolean };

  if (typeof body.completed !== "boolean") {
    return error("Campo 'completed' requerido", 422);
  }

  const task = await prisma.clientTask.findUnique({
    where: { id },
    select: { clientId: true },
  });
  if (!task) return error("No encontrado", 404);
  if (session!.role !== "ADMIN" && task.clientId !== session!.sub) {
    return error("No encontrado", 404);
  }

  const updated = await prisma.clientTask.update({
    where: { id },
    data: {
      completed: body.completed,
      completedAt: body.completed ? new Date() : null,
    },
  });

  return success(updated);
}
