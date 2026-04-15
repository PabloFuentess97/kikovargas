import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { ContactActions } from "./contact-actions";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) notFound();

  // Mark as read on first view
  if ((contact.status as string) === "PENDING") {
    await prisma.contact.update({
      where: { id },
      data: { status: "READ", readAt: new Date() },
    });
  }

  return (
    <div className="admin-fade-in">
      {/* Breadcrumb + header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-muted mb-2">
          <Link href="/dashboard/contacts" className="hover:text-a-accent transition-colors">Contactos</Link>
          <span>/</span>
          <span className="truncate max-w-[200px]">{contact.name}</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{contact.subject}</h1>
        <p className="mt-1 text-xs text-muted">
          Recibido el{" "}
          {new Date(contact.createdAt).toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Message */}
        <div className="lg:col-span-2 admin-card p-6">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{contact.message}</p>
        </div>

        {/* Info sidebar */}
        <div className="space-y-4">
          <div className="admin-card p-5 space-y-4">
            <InfoRow label="Nombre" value={contact.name} />
            <InfoRow label="Email" value={contact.email} href={`mailto:${contact.email}`} />
            {contact.phone && <InfoRow label="Telefono" value={contact.phone} href={`tel:${contact.phone}`} />}
            <InfoRow
              label="Estado"
              value={
                contact.status === "PENDING" ? "Pendiente" :
                contact.status === "READ" ? "Leido" :
                contact.status === "REPLIED" ? "Respondido" : "Archivado"
              }
            />
            {contact.readAt && (
              <InfoRow label="Leido" value={new Date(contact.readAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} />
            )}
            {contact.repliedAt && (
              <InfoRow label="Respondido" value={new Date(contact.repliedAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} />
            )}
          </div>

          <ContactActions contactId={contact.id} currentStatus={contact.status} email={contact.email} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted mb-1">{label}</p>
      {href ? (
        <a href={href} className="text-sm font-medium text-a-accent hover:text-a-accent-hover transition-colors">{value}</a>
      ) : (
        <p className="text-sm">{value}</p>
      )}
    </div>
  );
}
