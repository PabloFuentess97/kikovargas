import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { ContactActions } from "./contact-actions";
import { PageHeader, Card, CardContent, InfoRow } from "@/components/admin/ui";

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

  const statusLabel =
    contact.status === "PENDING" ? "Pendiente" :
    contact.status === "READ" ? "Leido" :
    contact.status === "REPLIED" ? "Respondido" : "Archivado";

  return (
    <div className="admin-fade-in">
      <PageHeader
        title={contact.subject}
        subtitle={`Recibido el ${new Date(contact.createdAt).toLocaleDateString("es-MX", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`}
        breadcrumb={[
          { label: "Contactos", href: "/dashboard/contacts" },
          { label: contact.name },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Message */}
        <Card className="lg:col-span-2">
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{contact.message}</p>
          </CardContent>
        </Card>

        {/* Info sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4">
              <InfoRow label="Nombre" value={contact.name} />
              <InfoRow label="Email" value={contact.email} href={`mailto:${contact.email}`} />
              {contact.phone && <InfoRow label="Telefono" value={contact.phone} href={`tel:${contact.phone}`} />}
              <InfoRow label="Estado" value={statusLabel} />
              {contact.readAt && (
                <InfoRow
                  label="Leido"
                  value={new Date(contact.readAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                />
              )}
              {contact.repliedAt && (
                <InfoRow
                  label="Respondido"
                  value={new Date(contact.repliedAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                />
              )}
            </CardContent>
          </Card>

          <ContactActions contactId={contact.id} currentStatus={contact.status} email={contact.email} />
        </div>
      </div>
    </div>
  );
}
