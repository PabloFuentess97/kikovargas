import { requireAdmin } from "@/lib/auth/session";
import { getLandingConfig } from "@/lib/config/get-config";
import { PageHeader } from "@/components/admin/ui";
import { SettingsEditor } from "./settings-editor";

export default async function SettingsPage() {
  await requireAdmin();
  const config = await getLandingConfig();

  return (
    <div className="admin-fade-in">
      <PageHeader
        title="Configuracion"
        subtitle="Personaliza el landing page: colores, textos y secciones."
      />
      <SettingsEditor initialConfig={config} />
    </div>
  );
}
