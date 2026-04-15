import { prisma } from "@/lib/db/prisma";
import { GalleryGrid } from "./gallery-grid";

export async function GallerySection() {
  const images = await prisma.image.findMany({
    where: { gallery: true },
    select: { id: true, url: true, alt: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    take: 8,
  });

  return <GalleryGrid images={images} />;
}
