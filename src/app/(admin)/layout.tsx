import { requireAdmin } from "@/lib/auth/session";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div data-theme="admin" className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <AdminSidebar userName={session.email.split("@")[0]} userEmail={session.email} />

      {/* Main content area */}
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
