import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { createImageSchema } from "@/lib/validations/image";
import { success, error } from "@/lib/api-response";

// GET /api/images — list images (admin only)
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = req.nextUrl;
    const galleryOnly = searchParams.get("gallery") === "true";

    const where = galleryOnly ? { gallery: true } : {};

    const images = await prisma.image.findMany({
      where,
      orderBy: galleryOnly
        ? [{ order: "asc" }, { createdAt: "desc" }]
        : { createdAt: "desc" },
      include: {
        post: { select: { id: true, title: true } },
      },
    });

    return success(images);
  } catch {
    return error("No autorizado", 403);
  }
}

// POST /api/images — register image metadata (admin only)
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = createImageSchema.safeParse(body);

    if (!parsed.success) {
      return error(parsed.error.issues[0].message, 422);
    }

    const image = await prisma.image.create({ data: parsed.data });

    return success(image, 201);
  } catch {
    return error("No autorizado", 403);
  }
}
