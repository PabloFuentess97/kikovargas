import { redirect } from "next/navigation";
import { requireClient } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { ToastProvider } from "@/components/admin/ui/toast";
import { ClientSidebar } from "./client-sidebar";

export default async function ClientPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireClient();
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    // Sesión huérfana: forzamos re-login
    redirect("/login?callbackUrl=/panel");
  }

  return (
    <div data-theme="admin" className="flex h-[100dvh] overflow-hidden bg-background text-foreground">
      <ToastProvider>
        <ClientSidebar userName={user.name} userEmail={user.email} />

        <main className="admin-main flex-1 overflow-auto overscroll-contain">
          <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </ToastProvider>
    </div>
  );
}
