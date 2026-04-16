import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { EventPageList } from "./event-page-list";

export default async function EventPagesPage() {
  await requireAdmin();

  const [pages, totalLeads] = await Promise.all([
    prisma.eventPage.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { blocks: true, leads: true } } },
    }),
    prisma.eventLead.count(),
  ]);

  const published = pages.filter((p) => p.status === "PUBLISHED").length;

  return (
    <div className="admin-fade-in">
      <PageHeader
        title="Landing Pages"
        subtitle="Crea y gestiona paginas de eventos con bloques personalizables."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Paginas" value={pages.length} />
        <StatCard label="Publicadas" value={published} accent />
        <StatCard label="Total leads" value={totalLeads} />
        <StatCard label="Borradores" value={pages.length - published} />
      </div>

      <EventPageList initialPages={JSON.parse(JSON.stringify(pages))} />
    </div>
  );
}
