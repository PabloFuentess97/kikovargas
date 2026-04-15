import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { GalleryManager } from "./gallery-manager";
import { PageHeader } from "@/components/admin/ui";

export default async function GalleryPage() {
  await requireAdmin();

  const images = await prisma.image.findMany({
    where: { gallery: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="admin-fade-in">
      <PageHeader
        title="Galeria"
        subtitle="Sube y administra las imagenes del landing page."
      />
      <GalleryManager initialImages={images} />
    </div>
  );
}
