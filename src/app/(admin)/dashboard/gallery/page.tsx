import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { GalleryManager } from "./gallery-manager";

export default async function GalleryPage() {
  await requireAdmin();

  const images = await prisma.image.findMany({
    where: { gallery: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Galería</h1>
      <p className="mt-1 text-sm text-muted">
        Sube y administra las imágenes del landing page.
      </p>
      <div className="mt-8">
        <GalleryManager initialImages={images} />
      </div>
    </div>
  );
}
