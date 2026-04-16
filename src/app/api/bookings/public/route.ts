import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { success, error } from "@/lib/api-response";
import { z } from "zod";
import { sendBookingConfirmation } from "@/lib/email/booking-templates";

const bookingSchema = z.object({
  slug: z.string().min(1),
  date: z.string().datetime(), // ISO 8601
  name: z.string().min(2, "Nombre muy corto").max(100),
  email: z.string().email("Email invalido"),
  phone: z.string().max(30).optional(),
  notes: z.string().max(500).optional(),
});

// GET /api/bookings/public?slug=xxx&date=2026-04-20
// Returns booked time slots for a given link + date
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");
    const dateStr = req.nextUrl.searchParams.get("date"); // YYYY-MM-DD

    if (!slug || !dateStr) {
      return error("slug y date son requeridos", 400);
    }

    // Verify link exists and is active
    const link = await prisma.bookingLink.findUnique({ where: { slug } });
    if (!link || !link.active) {
      return error("Enlace no disponible", 404);
    }
    if (link.expiresAt && link.expiresAt < new Date()) {
      return error("Enlace expirado", 410);
    }

    // Get date range for the requested day
    const dayStart = new Date(dateStr + "T00:00:00.000Z");
    const dayEnd = new Date(dateStr + "T23:59:59.999Z");

    // Get existing bookings for this date
    const bookings = await prisma.booking.findMany({
      where: {
        linkId: link.id,
        date: { gte: dayStart, lte: dayEnd },
        status: { not: "CANCELLED" },
      },
      select: { date: true, duration: true },
    });

    // Get availability for this day of week
    const dayOfWeek = dayStart.getUTCDay();
    const availability = await prisma.availability.findUnique({
      where: { dayOfWeek },
    });

    return success({
      link: { id: link.id, title: link.title, description: link.description, duration: link.duration },
      availability: availability && availability.active
        ? { startTime: availability.startTime, endTime: availability.endTime }
        : null,
      bookedSlots: bookings.map((b) => ({
        time: b.date.toISOString(),
        duration: b.duration,
      })),
    });
  } catch (err) {
    console.error("[bookings/public] GET error:", err);
    return error("Error al obtener disponibilidad", 500);
  }
}

// POST /api/bookings/public — create booking (public)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 422);
    }

    const { slug, date, name, email, phone, notes } = parsed.data;
    const bookingDate = new Date(date);

    // Validate link
    const link = await prisma.bookingLink.findUnique({ where: { slug } });
    if (!link || !link.active) {
      return error("Enlace de reserva no disponible", 404);
    }
    if (link.expiresAt && link.expiresAt < new Date()) {
      return error("Este enlace de reserva ha expirado", 410);
    }

    // Validate availability
    const dayOfWeek = bookingDate.getUTCDay();
    const availability = await prisma.availability.findUnique({ where: { dayOfWeek } });

    if (!availability || !availability.active) {
      return error("No hay disponibilidad para este dia", 422);
    }

    // Validate time within availability window
    const bookingHour = bookingDate.getUTCHours();
    const bookingMinute = bookingDate.getUTCMinutes();
    const bookingTime = `${String(bookingHour).padStart(2, "0")}:${String(bookingMinute).padStart(2, "0")}`;

    if (bookingTime < availability.startTime || bookingTime >= availability.endTime) {
      return error(`Horario no disponible. Disponibilidad: ${availability.startTime} - ${availability.endTime}`, 422);
    }

    // Check end time fits within availability
    const endMinutes = bookingHour * 60 + bookingMinute + link.duration;
    const [endH, endM] = availability.endTime.split(":").map(Number);
    const availEndMinutes = endH * 60 + endM;

    if (endMinutes > availEndMinutes) {
      return error("La reserva excede el horario disponible", 422);
    }

    // Check no overlap with existing bookings
    const slotStart = bookingDate;
    const slotEnd = new Date(bookingDate.getTime() + link.duration * 60000);

    const overlap = await prisma.booking.findFirst({
      where: {
        linkId: link.id,
        status: { not: "CANCELLED" },
        AND: [
          { date: { lt: slotEnd } },
          {
            date: {
              gte: new Date(slotStart.getTime() - link.duration * 60000 + 60000),
            },
          },
        ],
      },
    });

    if (overlap) {
      return error("Este horario ya esta reservado", 409);
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        date: bookingDate,
        duration: link.duration,
        name,
        email,
        phone: phone || "",
        notes: notes || "",
        status: "CONFIRMED",
        linkId: link.id,
      },
    });

    // Save as contact (fire and forget)
    try {
      const existingContact = await prisma.contact.findFirst({ where: { email } });
      if (!existingContact) {
        await prisma.contact.create({
          data: {
            name,
            email,
            phone: phone || null,
            subject: `Reserva: ${link.title}`,
            message: `Reserva confirmada para ${bookingDate.toLocaleDateString("es-ES")} a las ${bookingTime}`,
            status: "READ",
          },
        });
      }
    } catch (e) {
      console.error("[bookings/public] Contact save error:", e);
    }

    // Send confirmation email (fire and forget)
    try {
      await sendBookingConfirmation({
        name,
        email,
        date: bookingDate,
        duration: link.duration,
        linkTitle: link.title,
      });
    } catch (e) {
      console.error("[bookings/public] Email send error:", e);
    }

    return success({
      id: booking.id,
      date: booking.date,
      duration: booking.duration,
      status: booking.status,
    }, 201);
  } catch (err) {
    console.error("[bookings/public] POST error:", err);
    return error("Error al crear reserva", 500);
  }
}
