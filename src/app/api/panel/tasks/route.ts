import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

// GET /api/panel/tasks — list tasks of logged-in client
export async function GET() {
  const session = await getSession();
  if (!session) return error("Unauthorized", 401);

  const tasks = await prisma.clientTask.findMany({
    where: { clientId: session.sub },
    orderBy: [{ completed: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return success({ tasks });
}
