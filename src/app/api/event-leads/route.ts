import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";
import { z } from "zod";
import { sendEventLeadNotification } from "@/lib/email/event-templates";

const leadSchema = z.object({
  pageId: z.string().min(1),
  name: z.string().min(2, "Nombre muy corto").max(100),
  email: z.string().email("Email invalido"),
  phone: z.string().max(30).optional(),
  message: z.string().max(500).optional(),
});

// GET /api/event-leads?pageId=xxx — list leads (admin)
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const pageId = req.nextUrl.searchParams.get("pageId");

    const where = pageId ? { pageId } : {};

    const leads = await prisma.eventLead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { page: { select: { title: true, slug: true } } },
    });

    return success(leads);
  } catch (err) {
    console.error("[event-leads] GET error:", err);
    return error("Error al obtener leads", 500);
  }
}

// POST /api/event-leads — submit lead (public)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 422);
    }

    const { pageId, name, email, phone, message } = parsed.data;

    // Verify page exists and is published
    const page = await prisma.eventPage.findUnique({ where: { id: pageId } });
    if (!page || page.status !== "PUBLISHED") {
      return error("Pagina no disponible", 404);
    }

    // Create lead
    const lead = await prisma.eventLead.create({
      data: {
        name,
        email,
        phone: phone || "",
        message: message || "",
        pageId,
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
            subject: `Lead: ${page.title}`,
            message: message || `Registro desde evento: ${page.title}`,
            status: "PENDING",
          },
        });
      }
    } catch (e) {
      console.error("[event-leads] Contact save error:", e);
    }

    // Send notification email (fire and forget)
    try {
      await sendEventLeadNotification({
        name,
        email,
        phone: phone || "",
        message: message || "",
        pageTitle: page.title,
        pageSlug: page.slug,
      });
    } catch (e) {
      console.error("[event-leads] Email error:", e);
    }

    return success({ id: lead.id }, 201);
  } catch (err) {
    console.error("[event-leads] POST error:", err);
    return error("Error al registrarse", 500);
  }
}
