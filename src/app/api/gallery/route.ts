import { prisma } from "@/lib/db/prisma";
import { success } from "@/lib/api-response";

// GET /api/gallery — public, returns gallery images sorted by order
export async function GET() {
  const images = await prisma.image.findMany({
    where: { gallery: true },
    select: { id: true, url: true, alt: true, width: true, height: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return success(images);
}
