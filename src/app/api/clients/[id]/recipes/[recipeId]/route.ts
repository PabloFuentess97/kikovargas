import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

// DELETE /api/clients/[id]/recipes/[recipeId] — unassign a recipe from the client
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; recipeId: string }> },
) {
  await requireAdmin();
  const { id: clientId, recipeId } = await params;

  try {
    await prisma.clientRecipe.delete({
      where: { clientId_recipeId: { clientId, recipeId } },
    });
  } catch {
    return error("Asignación no encontrada", 404);
  }

  return success({ ok: true });
}
