import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { BookingList } from "./booking-list";

export default async function BookingsPage() {
  await requireAdmin();

  const [bookings, total, confirmed, cancelled] = await Promise.all([
    prisma.booking.findMany({
      orderBy: { date: "desc" },
      take: 200,
      include: { link: { select: { slug: true, title: true } } },
    }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({ where: { status: "CANCELLED" } }),
  ]);

  return (
    <div className="admin-fade-in">
      <PageHeader
        title="Reservas"
        subtitle="Visualiza y gestiona todas las reservas."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={total} />
        <StatCard label="Confirmadas" value={confirmed} accent />
        <StatCard label="Canceladas" value={cancelled} />
        <StatCard label="Pendientes" value={total - confirmed - cancelled} />
      </div>

      <BookingList initialBookings={JSON.parse(JSON.stringify(bookings))} />
    </div>
  );
}
