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
    <div>
      <div className="mb-8">
        <p className="text-xs text-muted mb-1">
          Recibido el{" "}
          {new Date(contact.createdAt).toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{contact.subject}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Message */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{contact.message}</p>
        </div>

        {/* Info sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <InfoRow label="Nombre" value={contact.name} />
            <InfoRow
              label="Email"
              value={contact.email}
              href={`mailto:${contact.email}`}
            />
            {contact.phone && <InfoRow label="Teléfono" value={contact.phone} href={`tel:${contact.phone}`} />}
            <InfoRow
              label="Estado"
              value={
                contact.status === "PENDING" ? "Pendiente" :
                contact.status === "READ" ? "Leído" :
                contact.status === "REPLIED" ? "Respondido" : "Archivado"
              }
            />
            {contact.readAt && (
              <InfoRow label="Leído" value={new Date(contact.readAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} />
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
      <p className="text-[0.65rem] font-medium uppercase tracking-wider text-muted mb-0.5">{label}</p>
      {href ? (
        <a href={href} className="text-sm text-a-primary hover:underline">{value}</a>
      ) : (
        <p className="text-sm">{value}</p>
      )}
    </div>
  );
}
