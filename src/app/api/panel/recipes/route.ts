import { prisma } from "@/lib/db/prisma";
import { requireClientAreaApi } from "@/lib/auth/api-client-access";
import { success } from "@/lib/api-response";

// GET /api/panel/recipes — client's assigned recipes
export async function GET() {
  const auth = await requireClientAreaApi("recipes");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const assignments = await prisma.clientRecipe.findMany({
    where: { clientId: session!.sub },
    include: { recipe: true },
    orderBy: { assignedAt: "desc" },
  });

  return success({ assignments });
}
