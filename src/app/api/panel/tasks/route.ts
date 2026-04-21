import { prisma } from "@/lib/db/prisma";
import { requireClientAreaApi } from "@/lib/auth/api-client-access";
import { success } from "@/lib/api-response";

// GET /api/panel/tasks — list tasks of logged-in client
export async function GET() {
  const auth = await requireClientAreaApi("tasks");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const tasks = await prisma.clientTask.findMany({
    where: { clientId: session!.sub },
    orderBy: [{ completed: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return success({ tasks });
}
