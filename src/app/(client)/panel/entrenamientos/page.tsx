import { requireClientArea } from "@/lib/auth/client-access";
import { prisma } from "@/lib/db/prisma";
import { WorkoutsClient } from "./workouts-client";

export const dynamic = "force-dynamic";

export default async function ClientWorkoutsPage() {
  const { session } = await requireClientArea("workouts");

  const workouts = await prisma.workout.findMany({
    where: {
      clientId: session.sub,
      status: { in: ["ACTIVE", "COMPLETED"] },
    },
    orderBy: [{ status: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return <WorkoutsClient initialWorkouts={JSON.parse(JSON.stringify(workouts))} />;
}
