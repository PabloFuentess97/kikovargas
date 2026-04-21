import { requireClient } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { ChecklistClient } from "./checklist-client";

export const dynamic = "force-dynamic";

export default async function ClientChecklistPage() {
  const session = await requireClient();

  const tasks = await prisma.clientTask.findMany({
    where: { clientId: session.sub },
    orderBy: [{ completed: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return <ChecklistClient initialTasks={JSON.parse(JSON.stringify(tasks))} />;
}
