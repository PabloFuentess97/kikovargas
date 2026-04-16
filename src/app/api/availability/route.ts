import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";
import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const availabilitySchema = z.object({
  slots: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(timeRegex, "Formato HH:mm"),
    endTime: z.string().regex(timeRegex, "Formato HH:mm"),
    active: z.boolean(),
  })),
});

// GET /api/availability — list all (public-safe, also used by admin)
export async function GET() {
  try {
    const slots = await prisma.availability.findMany({
      orderBy: { dayOfWeek: "asc" },
    });

    return success(slots);
  } catch (err) {
    console.error("[availability] GET error:", err);
    return error("Error al obtener disponibilidad", 500);
  }
}

// PUT /api/availability — replace all (admin)
export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = availabilitySchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 422);
    }

    // Validate start < end
    for (const slot of parsed.data.slots) {
      if (slot.startTime >= slot.endTime) {
        return error(`Dia ${slot.dayOfWeek}: la hora de inicio debe ser anterior a la hora de fin`, 422);
      }
    }

    // Delete all and recreate — transactional
    await prisma.$transaction(async (tx) => {
      await tx.availability.deleteMany();
      await tx.availability.createMany({
        data: parsed.data.slots.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          active: s.active,
        })),
      });
    });

    const slots = await prisma.availability.findMany({ orderBy: { dayOfWeek: "asc" } });
    return success(slots);
  } catch (err) {
    console.error("[availability] PUT error:", err);
    return error("Error al guardar disponibilidad", 500);
  }
}
