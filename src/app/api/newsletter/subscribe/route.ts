import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { success, error } from "@/lib/api-response";
import { z } from "zod";
import { welcomeTemplate } from "@/lib/email/newsletter-templates";
import { unsubscribeUrl } from "@/lib/email/send-newsletter";

const subscribeSchema = z.object({
  email: z.string().email("Email invalido"),
  name: z.string().max(100).optional(),
});

// POST /api/newsletter/subscribe — public
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 422);
    }

    const { email, name } = parsed.data;

    // Check if already subscribed
    const existing = await prisma.subscriber.findUnique({ where: { email } });

    if (existing) {
      if (existing.active) {
        return success({ message: "Ya estas suscrito!" });
      }
      // Reactivate
      await prisma.subscriber.update({
        where: { email },
        data: { active: true, name: name || existing.name, unsubscribedAt: null, confirmedAt: new Date() },
      });
      return success({ message: "Te has vuelto a suscribir!" });
    }

    // Create subscriber
    await prisma.subscriber.create({
      data: {
        email,
        name: name || "",
        active: true,
        confirmedAt: new Date(),
      },
    });

    // Send welcome email (fire and forget)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_URL || "https://kikovargas.fit";
      const unsub = unsubscribeUrl(baseUrl, email);

      const { getNewsletterResend } = await import("@/lib/email/send-newsletter");
      const { resend, fromName, fromEmail } = await getNewsletterResend();

      await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: email,
        subject: "Bienvenido a la newsletter de Kiko Vargas!",
        html: welcomeTemplate(name || "", unsub),
      });
    } catch (err) {
      console.error("[newsletter] Welcome email failed:", err);
    }

    return success({ message: "Suscripcion exitosa!" }, 201);
  } catch (err) {
    console.error("[newsletter/subscribe] Error:", err);
    return error("Error al suscribirse", 500);
  }
}
