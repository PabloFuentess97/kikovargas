import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

// GET /api/panel/diets — list client's diets (active first)
export async function GET() {
  const session = await getSession();
  if (!session) return error("Unauthorized", 401);

  const diets = await prisma.diet.findMany({
    where: { clientId: session.sub },
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  });

  return success({ diets });
}
