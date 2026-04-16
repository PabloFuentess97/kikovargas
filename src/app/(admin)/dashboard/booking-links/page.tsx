import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { BookingLinkList } from "./booking-link-list";

export default async function BookingLinksPage() {
  await requireAdmin();

  const [links, totalBookings] = await Promise.all([
    prisma.bookingLink.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { bookings: true } } },
    }),
    prisma.booking.count(),
  ]);

  const active = links.filter((l) => l.active).length;

  return (
    <div className="admin-fade-in">
      <PageHeader
        title="Enlaces de Reserva"
        subtitle="Crea y gestiona enlaces unicos para que tus clientes reserven citas."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total enlaces" value={links.length} />
        <StatCard label="Activos" value={active} accent />
        <StatCard label="Total reservas" value={totalBookings} />
      </div>

      <BookingLinkList initialLinks={JSON.parse(JSON.stringify(links))} />
    </div>
  );
}
