import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";
import { z } from "zod";
import { sendBatch, unsubscribeUrl } from "@/lib/email/send-newsletter";
import { newPostTemplate, customTemplate } from "@/lib/email/newsletter-templates";

const createSchema = z.object({
  subject: z.string().min(1, "Asunto obligatorio").max(200),
  content: z.string().min(1, "Contenido obligatorio"),
  template: z.enum(["custom", "new_post"]).default("custom"),
  postId: z.string().optional(),
});

// GET /api/newsletter/campaigns — admin: list campaigns
export async function GET() {
  try {
    await requireAdmin();

    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return success({ campaigns });
  } catch {
    return error("No autorizado", 403);
  }
}

// POST /api/newsletter/campaigns — admin: create + optionally send
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { send, ...rest } = body as { send?: boolean } & Record<string, unknown>;
    const parsed = createSchema.safeParse(rest);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 422);
    }

    const data = parsed.data;
    const baseUrl = process.env.NEXT_PUBLIC_URL || "https://kikovargas.fit";

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        subject: data.subject,
        content: data.content,
        template: data.template,
        postId: data.postId || null,
      },
    });

    // Send immediately if requested
    if (send) {
      const subscribers = await prisma.subscriber.findMany({
        where: { active: true },
        select: { email: true },
      });

      const emails = subscribers.map((s) => s.email);

      if (emails.length === 0) {
        return success({ campaign, sent: 0, message: "No hay suscriptores activos" });
      }

      let sentCount: number;

      if (data.template === "new_post" && data.postId) {
        // Fetch post data for the template
        const post = await prisma.post.findUnique({
          where: { id: data.postId },
          select: { title: true, excerpt: true, slug: true, cover: { select: { url: true } } },
        });

        if (!post) return error("Post no encontrado", 404);

        sentCount = await sendBatch(emails, data.subject, (email) =>
          newPostTemplate(
            { title: post.title, excerpt: post.excerpt, slug: post.slug, coverUrl: post.cover?.url },
            baseUrl,
            unsubscribeUrl(baseUrl, email),
          ),
        );
      } else {
        sentCount = await sendBatch(emails, data.subject, (email) =>
          customTemplate(data.content, unsubscribeUrl(baseUrl, email)),
        );
      }

      // Update campaign status
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: "SENT", sentAt: new Date(), sentCount },
      });

      return success({ campaign: { ...campaign, status: "SENT", sentCount }, sent: sentCount });
    }

    return success({ campaign }, 201);
  } catch (err) {
    console.error("[newsletter/campaigns] Error:", err);
    const msg = err instanceof Error ? err.message : "Error al crear campana";
    return error(msg, 500);
  }
}
