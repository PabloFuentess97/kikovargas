import { prisma } from "@/lib/db/prisma";
import { requireClientAreaApi } from "@/lib/auth/api-client-access";
import { success } from "@/lib/api-response";

// GET /api/panel/diets — list client's diets (active first)
export async function GET() {
  const auth = await requireClientAreaApi("diet");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const diets = await prisma.diet.findMany({
    where: { clientId: session!.sub },
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  });

  return success({ diets });
}
