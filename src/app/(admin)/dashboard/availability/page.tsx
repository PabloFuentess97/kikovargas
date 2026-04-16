import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/ui";
import { AvailabilityEditor } from "./availability-editor";

export default async function AvailabilityPage() {
  await requireAdmin();

  const slots = await prisma.availability.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  return (
    <div className="admin-fade-in">
      <PageHeader
        title="Disponibilidad"
        subtitle="Configura tus dias y horarios disponibles para reservas."
      />

      <AvailabilityEditor
        initialSlots={JSON.parse(JSON.stringify(slots))}
      />
    </div>
  );
}
