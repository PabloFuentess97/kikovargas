import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/ui";
import { IdeasGenerator } from "./ideas-generator";

export default async function IdeasPage() {
  await requireAdmin();

  return (
    <div className="admin-fade-in">
      <PageHeader
        title="Generador de Ideas"
        subtitle="Genera ideas para articulos con IA y llevalas al creador de posts."
      />
      <IdeasGenerator />
    </div>
  );
}
