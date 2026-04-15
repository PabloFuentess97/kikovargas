import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/client";

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt: Date;
}

export default async function UsersPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="admin-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
        <p className="mt-1 text-sm text-muted">
          {users.length} usuarios registrados
        </p>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3.5 text-left text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">Nombre</th>
              <th className="px-5 py-3.5 text-left text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">Email</th>
              <th className="px-5 py-3.5 text-left text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">Rol</th>
              <th className="px-5 py-3.5 text-left text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">Estado</th>
              <th className="px-5 py-3.5 text-left text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">Creado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user: UserRow) => (
              <tr key={user.id} className="transition-colors hover:bg-card-hover">
                <td className="px-5 py-4 font-medium">{user.name}</td>
                <td className="px-5 py-4 text-muted">{user.email}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-a-accent-dim px-2.5 py-1 text-[0.65rem] font-medium text-a-accent">
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        user.active ? "bg-success" : "bg-danger"
                      }`}
                    />
                    <span className="text-xs text-muted">{user.active ? "Activo" : "Inactivo"}</span>
                  </span>
                </td>
                <td className="px-5 py-4 text-muted tabular-nums">
                  {user.createdAt.toLocaleDateString("es-ES")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
