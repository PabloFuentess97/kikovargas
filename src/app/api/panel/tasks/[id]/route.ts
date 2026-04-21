import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

// PATCH /api/panel/tasks/:id — toggle completed
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return error("Unauthorized", 401);

  const { id } = await params;
  const body = (await req.json()) as { completed?: boolean };

  if (typeof body.completed !== "boolean") {
    return error("Campo 'completed' requerido", 422);
  }

  const task = await prisma.clientTask.findUnique({
    where: { id },
    select: { clientId: true },
  });
  if (!task || task.clientId !== session.sub) {
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
