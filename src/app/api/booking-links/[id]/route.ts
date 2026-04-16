import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  duration: z.number().int().min(15).max(480).optional(),
  active: z.boolean().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

// GET /api/booking-links/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    const link = await prisma.bookingLink.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true } } },
    });

    if (!link) return error("Enlace no encontrado", 404);
    return success(link);
  } catch (err) {
    console.error("[booking-links] GET by id error:", err);
    return error("Error al obtener enlace", 500);
  }
}

// PATCH /api/booking-links/[id]
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
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.duration !== undefined) data.duration = parsed.data.duration;
    if (parsed.data.active !== undefined) data.active = parsed.data.active;
    if (parsed.data.expiresAt !== undefined) data.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;

    const link = await prisma.bookingLink.update({ where: { id }, data });
    return success(link);
  } catch (err) {
    console.error("[booking-links] PATCH error:", err);
    return error("Error al actualizar enlace", 500);
  }
}

// DELETE /api/booking-links/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.bookingLink.delete({ where: { id } });
    return success({ deleted: true });
  } catch (err) {
    console.error("[booking-links] DELETE error:", err);
    return error("Error al eliminar enlace", 500);
  }
}
