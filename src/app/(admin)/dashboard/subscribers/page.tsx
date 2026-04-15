import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { SubscriberList } from "./subscriber-list";

export default async function SubscribersPage() {
  await requireAdmin();

  const [subscribers, total, active] = await Promise.all([
    prisma.subscriber.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.subscriber.count(),
    prisma.subscriber.count({ where: { active: true } }),
  ]);

  return (
    <div className="admin-fade-in">
      <PageHeader
        title="Suscriptores"
        subtitle="Gestiona los suscriptores de la newsletter."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total" value={total} />
        <StatCard label="Activos" value={active} accent />
        <StatCard label="Dados de baja" value={total - active} />
      </div>

      <SubscriberList initialSubscribers={subscribers} />
    </div>
  );
}
