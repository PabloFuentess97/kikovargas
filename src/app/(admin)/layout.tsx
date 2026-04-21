import { requireAdmin } from "@/lib/auth/session";
import { AdminSidebar } from "./admin-sidebar";
import { ToastProvider } from "@/components/admin/ui/toast";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div data-theme="admin" className="flex h-[100dvh] overflow-hidden bg-background text-foreground">
      <ToastProvider>
        <AdminSidebar userName={session.email.split("@")[0]} userEmail={session.email} />

        <main className="admin-main flex-1 overflow-auto overscroll-contain">
          <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
      </ToastProvider>
    </div>
  );
}
