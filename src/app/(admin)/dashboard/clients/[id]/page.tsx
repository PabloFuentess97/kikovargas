import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/admin/ui";
import { ClientDetailTabs } from "./client-detail-tabs";

export const dynamic = "force-dynamic";

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const client = await prisma.user.findFirst({
    where: { id, role: "USER" },
    select: {
      id: true, name: true, email: true, phone: true, active: true,
      birthDate: true, startedAt: true, monthlyFee: true, notes: true, createdAt: true,
    },
  });

  if (!client) notFound();

  const [workouts, tasks, documents, diets, invoices] = await Promise.all([
    prisma.workout.findMany({ where: { clientId: id }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
    prisma.clientTask.findMany({ where: { clientId: id }, orderBy: [{ completed: "asc" }, { sortOrder: "asc" }] }),
    prisma.clientDocument.findMany({ where: { clientId: id }, orderBy: { createdAt: "desc" } }),
    prisma.diet.findMany({ where: { clientId: id }, orderBy: [{ active: "desc" }, { createdAt: "desc" }] }),
    prisma.invoice.findMany({ where: { clientId: id }, orderBy: { issueDate: "desc" } }),
  ]);

  return (
    <div className="admin-fade-in">
      <PageHeader
        title={client.name}
        subtitle={client.email}
        breadcrumb={[{ label: "Clientes", href: "/dashboard/clients" }, { label: client.name }]}
      />

      <ClientDetailTabs
        client={JSON.parse(JSON.stringify(client))}
        initial={{
          workouts: JSON.parse(JSON.stringify(workouts)),
          tasks: JSON.parse(JSON.stringify(tasks)),
          documents: JSON.parse(JSON.stringify(documents)),
          diets: JSON.parse(JSON.stringify(diets)),
          invoices: JSON.parse(JSON.stringify(invoices)),
        }}
      />
    </div>
  );
}
