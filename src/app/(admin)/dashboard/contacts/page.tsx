import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";

const STATUS: Record<string, { text: string; dot: string; bg: string }> = {
  PENDING: { text: "Pendiente", dot: "bg-warning", bg: "bg-warning/10 text-warning" },
  READ: { text: "Leido", dot: "bg-a-primary", bg: "bg-a-primary/10 text-a-primary" },
  REPLIED: { text: "Respondido", dot: "bg-success", bg: "bg-success/10 text-success" },
  ARCHIVED: { text: "Archivado", dot: "bg-muted", bg: "bg-muted/10 text-muted" },
};

export default async function ContactsPage() {
  await requireAdmin();

  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
  });

  const pending = contacts.filter((c) => c.status === "PENDING").length;

  return (
    <div className="admin-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Contactos</h1>
        <p className="mt-1 text-sm text-muted">
          {contacts.length} mensajes
          {pending > 0 && (
            <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2 py-0.5 text-[0.65rem] font-medium text-warning">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              {pending} pendientes
            </span>
          )}
        </p>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3.5 text-left text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">Nombre</th>
              <th className="px-5 py-3.5 text-left text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted hidden md:table-cell">Asunto</th>
              <th className="px-5 py-3.5 text-left text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">Estado</th>
              <th className="px-5 py-3.5 text-left text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted hidden sm:table-cell">Fecha</th>
              <th className="px-5 py-3.5 text-right text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">Accion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contacts.map((contact) => {
              const badge = STATUS[contact.status] ?? STATUS.PENDING;
              return (
                <tr key={contact.id} className="transition-colors hover:bg-card-hover">
                  <td className="px-5 py-4">
                    <p className="font-medium">{contact.name}</p>
                    <p className="mt-0.5 text-xs text-muted">{contact.email}</p>
                  </td>
                  <td className="px-5 py-4 text-muted max-w-xs truncate hidden md:table-cell">{contact.subject}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-medium ${badge.bg}`}>
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                      {badge.text}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-muted hidden sm:table-cell">
                    {new Date(contact.createdAt).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/dashboard/contacts/${contact.id}`}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-all hover:text-foreground hover:border-a-accent/30 hover:bg-a-accent-dim"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-a-accent-dim">
                      <svg className="h-6 w-6 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted">No hay mensajes de contacto</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
