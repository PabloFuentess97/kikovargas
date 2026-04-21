import { redirect } from "next/navigation";
import { requireClient } from "@/lib/auth/session";
import { getClientAccess } from "@/lib/auth/client-access";
import { ToastProvider } from "@/components/admin/ui/toast";
import { ClientSidebar } from "./client-sidebar";

export default async function ClientPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireClient();
  const access = await getClientAccess(session);

  if (!access.email) {
    // Sesión huérfana: forzamos re-login
    redirect("/login?callbackUrl=/panel");
  }

  return (
    <div data-theme="admin" className="flex h-[100dvh] overflow-hidden bg-background text-foreground">
      <ToastProvider>
        <ClientSidebar
          userName={access.name}
          userEmail={access.email}
          active={access.active}
          allowedAreas={access.allowedAreas}
        />

        <main className="admin-main flex-1 overflow-auto overscroll-contain">
          <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </ToastProvider>
    </div>
  );
}
