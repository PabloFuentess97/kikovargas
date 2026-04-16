import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";

// GET /api/bookings — list all (admin)
export async function GET() {
  try {
    await requireAdmin();

    const bookings = await prisma.booking.findMany({
      orderBy: { date: "desc" },
      take: 200,
      include: {
        link: { select: { slug: true, title: true } },
      },
    });

    return success(bookings);
  } catch (err) {
    console.error("[bookings] GET error:", err);
    return error("Error al obtener reservas", 500);
  }
}
