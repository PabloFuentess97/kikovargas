import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { success, error } from "@/lib/api-response";
import { z } from "zod";

const createSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Solo letras minusculas, numeros y guiones"),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  template: z.enum(["custom", "webinar", "fitness", "coaching"]).optional(),
});

// GET /api/event-pages — list all (admin)
export async function GET() {
  try {
    await requireAdmin();

    const pages = await prisma.eventPage.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { blocks: true, leads: true } },
      },
    });

    return success(pages);
  } catch (err) {
    console.error("[event-pages] GET error:", err);
    return error("Error al obtener paginas", 500);
  }
}

// POST /api/event-pages — create (admin)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 422);
    }

    const { slug, title, description, template } = parsed.data;

    const existing = await prisma.eventPage.findUnique({ where: { slug } });
    if (existing) {
      return error("Ya existe una pagina con ese slug", 409);
    }

    const page = await prisma.eventPage.create({
      data: {
        slug,
        title,
        description: description || "",
        template: template || "custom",
      },
    });

    return success(page, 201);
  } catch (err) {
    console.error("[event-pages] POST error:", err);
    return error("Error al crear pagina", 500);
  }
}
