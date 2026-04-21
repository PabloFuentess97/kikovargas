import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/admin/ui";
import { TemplatesClient } from "./templates-client";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  await requireAdmin();

  const [workoutTemplates, dietTemplates] = await Promise.all([
    prisma.workoutTemplate.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.dietTemplate.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <div className="admin-fade-in">
      <PageHeader
        title="Plantillas"
        subtitle="Reutiliza entrenamientos y dietas entre clientes"
      />

      <TemplatesClient
        initialWorkouts={JSON.parse(JSON.stringify(workoutTemplates))}
        initialDiets={JSON.parse(JSON.stringify(dietTemplates))}
      />
    </div>
  );
}
