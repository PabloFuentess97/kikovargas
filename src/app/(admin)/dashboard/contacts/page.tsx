import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";

const STATUS_LABELS: Record<string, { text: string; className: string }> = {
  PENDING: { text: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
  READ: { text: "Leído", className: "bg-blue-100 text-blue-800" },
  REPLIED: { text: "Respondido", className: "bg-green-100 text-green-800" },
  ARCHIVED: { text: "Archivado", className: "bg-gray-100 text-gray-600" },
};

export default async function ContactsPage() {
  await requireAdmin();

  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
  });

  const pending = contacts.filter((c) => c.status === "PENDING").length;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contactos</h1>
        <p className="mt-1 text-sm text-muted">
          {contacts.length} mensajes · {pending} pendientes
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="px-4 py-3 text-left font-medium text-muted">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Asunto</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Estado</th>
              <th className="px-4 py-3 text-left font-medium text-muted">Fecha</th>
              <th className="px-4 py-3 text-right font-medium text-muted">Acción</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => {
              const badge = STATUS_LABELS[contact.status] ?? STATUS_LABELS.PENDING;
              return (
                <tr key={contact.id} className="border-b border-border last:border-0 hover:bg-card/50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-xs text-muted">{contact.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted max-w-xs truncate">{contact.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
                      {badge.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(contact.createdAt).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/contacts/${contact.id}`}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-card"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">
                  No hay mensajes de contacto.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
