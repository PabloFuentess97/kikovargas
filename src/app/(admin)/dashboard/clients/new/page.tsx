import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/ui";
import { NewClientForm } from "./new-client-form";

export default async function NewClientPage() {
  await requireAdmin();

  return (
    <div className="admin-fade-in max-w-2xl">
      <PageHeader
        title="Nuevo cliente"
        subtitle="Crea el acceso al panel privado"
        breadcrumb={[{ label: "Clientes", href: "/dashboard/clients" }, { label: "Nuevo" }]}
      />
      <NewClientForm />
    </div>
  );
}
