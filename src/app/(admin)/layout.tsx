import { requireAdmin } from "@/lib/auth/session";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div data-theme="admin" className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar (desktop: static, mobile: drawer) */}
      <AdminSidebar userName={session.email.split("@")[0]} userEmail={session.email} />

      {/* Main content area */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
