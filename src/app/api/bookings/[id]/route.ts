import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
  notes: z.string().max(500).optional(),
});

// PATCH /api/bookings/[id] — update status (admin)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 422);
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.status !== undefined) data.status = parsed.data.status;
    if (parsed.data.notes !== undefined) data.notes = parsed.data.notes;

    const booking = await prisma.booking.update({
      where: { id },
      data,
      include: { link: { select: { slug: true, title: true } } },
    });

    return success(booking);
  } catch (err) {
    console.error("[bookings] PATCH error:", err);
    return error("Error al actualizar reserva", 500);
  }
}

// DELETE /api/bookings/[id] — delete (admin)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.booking.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    console.error("[bookings] DELETE error:", err);
    return error("Error al eliminar reserva", 500);
  }
}
