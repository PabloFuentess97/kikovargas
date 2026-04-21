import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

// GET /api/panel/workouts — list the logged-in client's workouts (ACTIVE + COMPLETED)
export async function GET() {
  const session = await getSession();
  if (!session) return error("Unauthorized", 401);

  const workouts = await prisma.workout.findMany({
    where: {
      clientId: session.sub,
      status: { in: ["ACTIVE", "COMPLETED"] },
    },
    orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return success({ workouts });
}
