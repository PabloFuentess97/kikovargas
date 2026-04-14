import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { updateContactStatusSchema } from "@/lib/validations/contact";
import { success, error } from "@/lib/api-response";

type Params = { params: Promise<{ id: string }> };

// GET /api/contacts/:id (admin only)
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) return error("Contacto no encontrado", 404);

    // Mark as read on first view
    if (contact.status === "PENDING") {
      await prisma.contact.update({
        where: { id },
        data: { status: "READ", readAt: new Date() },
      });
    }

    return success(contact);
  } catch {
    return error("No autorizado", 403);
  }
}

// PATCH /api/contacts/:id (admin only — update status)
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateContactStatusSchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 422);
    }

    const existing = await prisma.contact.findUnique({ where: { id } });
    if (!existing) return error("Contacto no encontrado", 404);

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        status: parsed.data.status,
        ...(parsed.data.status === "REPLIED" ? { repliedAt: new Date() } : {}),
      },
    });

    return success(contact);
  } catch {
    return error("No autorizado", 403);
  }
}

// DELETE /api/contacts/:id (admin only)
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.contact.findUnique({ where: { id } });
    if (!existing) return error("Contacto no encontrado", 404);

    await prisma.contact.delete({ where: { id } });

    return success({ deleted: true });
  } catch {
    return error("No autorizado", 403);
  }
}
