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
    <div className="admin-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Galeria</h1>
        <p className="mt-1 text-sm text-muted">
          Sube y administra las imagenes del landing page.
        </p>
      </div>
      <GalleryManager initialImages={images} />
    </div>
  );
}
