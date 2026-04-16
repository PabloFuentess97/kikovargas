import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";
import { z } from "zod";

const createSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Solo letras minusculas, numeros y guiones"),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  duration: z.number().int().min(15).max(480).optional(),
  active: z.boolean().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

// GET /api/booking-links — list all (admin)
export async function GET() {
  try {
    await requireAdmin();

    const links = await prisma.bookingLink.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { bookings: true } } },
    });

    return success(links);
  } catch (err) {
    console.error("[booking-links] GET error:", err);
    return error("Error al obtener enlaces", 500);
  }
}

// POST /api/booking-links — create (admin)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 422);
    }

    const { slug, title, description, duration, active, expiresAt } = parsed.data;

    // Check unique slug
    const existing = await prisma.bookingLink.findUnique({ where: { slug } });
    if (existing) {
      return error("Ya existe un enlace con ese slug", 409);
    }

    const link = await prisma.bookingLink.create({
      data: {
        slug,
        title: title || "Reserva tu cita",
        description: description || "",
        duration: duration || 60,
        active: active ?? true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return success(link, 201);
  } catch (err) {
    console.error("[booking-links] POST error:", err);
    return error("Error al crear enlace", 500);
  }
}
