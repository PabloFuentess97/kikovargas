import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { EventEditor } from "./event-editor";

export default async function EventEditorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const page = await prisma.eventPage.findUnique({
    where: { id },
    include: {
      blocks: { orderBy: { order: "asc" } },
      _count: { select: { leads: true } },
    },
  });

  if (!page) return notFound();

  return (
    <div className="admin-fade-in">
      <PageHeader
        title={page.title}
        subtitle={`/event/${page.slug} · ${page._count.leads} leads`}
        breadcrumb={[
          { label: "Landing Pages", href: "/dashboard/event-pages" },
          { label: page.title },
        ]}
      />

      <EventEditor
        page={JSON.parse(JSON.stringify(page))}
      />
    </div>
  );
}
