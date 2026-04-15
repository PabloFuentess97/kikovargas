import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/client";
import {
  Table, TableHead, TableHeader, TableBody, TableRow, TableCell,
  PageHeader, Badge, StatusDot,
} from "@/components/admin/ui";

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
      <PageHeader title="Usuarios" subtitle={`${users.length} usuarios registrados`} />

      <Table>
        <TableHead>
          <TableHeader>Nombre</TableHeader>
          <TableHeader>Email</TableHeader>
          <TableHeader>Rol</TableHeader>
          <TableHeader>Estado</TableHeader>
          <TableHeader>Creado</TableHeader>
        </TableHead>
        <TableBody>
          {users.map((user: UserRow) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-muted">{user.email}</TableCell>
              <TableCell>
                <Badge variant="accent" dot={false}>{user.role}</Badge>
              </TableCell>
              <TableCell>
                <StatusDot active={user.active} label={user.active ? "Activo" : "Inactivo"} />
              </TableCell>
              <TableCell className="text-muted tabular-nums">
                {user.createdAt.toLocaleDateString("es-ES")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
