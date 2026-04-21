import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/admin/ui";
import { DEFAULT_INACTIVE_ACCESS } from "@/lib/auth/client-access";
import { AccessConfigForm } from "./form";

export const dynamic = "force-dynamic";

export default async function InactiveAccessConfigPage() {
  await requireAdmin();

  const config = await prisma.siteConfig.findUnique({ where: { key: "inactiveClientAccess" } });
  const current = (config?.value as Partial<Record<string, boolean>> | null) ?? {};

  const initial: Record<string, boolean> = {
    ...DEFAULT_INACTIVE_ACCESS,
    ...current,
    home: true, // siempre true
  };

  return (
    <div className="admin-fade-in max-w-2xl">
      <PageHeader
        title="Acceso de clientes inactivos"
        subtitle="Controla que secciones siguen disponibles cuando desactivas a un cliente"
        breadcrumb={[
          { label: "Clientes", href: "/dashboard/clients" },
          { label: "Acceso inactivos" },
        ]}
      />

      <AccessConfigForm initial={initial} />
    </div>
  );
}
