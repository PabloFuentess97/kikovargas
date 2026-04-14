import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { createContactSchema } from "@/lib/validations/contact";
import { sendContactNotification } from "@/lib/email/resend";
import { success, error } from "@/lib/api-response";

// GET /api/contacts — list contacts (admin only)
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 10));
    const skip = (page - 1) * limit;

    const where = status ? { status: status as "PENDING" | "READ" | "REPLIED" | "ARCHIVED" } : {};

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ]);

    return success({ contacts, total, page, limit });
  } catch {
    return error("No autorizado", 403);
  }
}

// POST /api/contacts — create contact (public)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createContactSchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 422);
    }

    const contact = await prisma.contact.create({ data: parsed.data });

    // Fire-and-forget: don't block the response on email delivery
    sendContactNotification(parsed.data).catch((err) => {
      console.error("Failed to send contact notification email:", err);
    });

    return success({ id: contact.id }, 201);
  } catch {
    return error("Error al enviar el mensaje", 500);
  }
}
