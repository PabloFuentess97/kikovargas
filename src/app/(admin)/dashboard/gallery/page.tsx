import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { GalleryManager } from "./gallery-manager";
import { PageHeader } from "@/components/admin/ui";

export default async function GalleryPage() {
  await requireAdmin();

  const images = await prisma.image.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="admin-fade-in">
      <PageHeader
        title="Galeria"
        subtitle="Sube y administra las imagenes. Las marcadas con estrella aparecen en el landing."
      />
      <GalleryManager initialImages={images} />
    </div>
  );
}
