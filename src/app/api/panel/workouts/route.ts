import { prisma } from "@/lib/db/prisma";
import { requireClientAreaApi } from "@/lib/auth/api-client-access";
import { success } from "@/lib/api-response";

// GET /api/panel/workouts — list the logged-in client's workouts (ACTIVE + COMPLETED)
export async function GET() {
  const auth = await requireClientAreaApi("workouts");
  if (!auth.ok) return auth.response;
  const { session } = auth;

  const workouts = await prisma.workout.findMany({
    where: {
      clientId: session!.sub,
      status: { in: ["ACTIVE", "COMPLETED"] },
    },
    orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return success({ workouts });
}
