import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import {
  Table, TableHead, TableHeader, TableBody, TableRow, TableCell, TableEmpty,
  PageHeader, ContactStatusBadge, Badge, LinkButton,
} from "@/components/admin/ui";

const IconMail = (
  <svg className="h-6 w-6 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

export default async function ContactsPage() {
  await requireAdmin();

  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
  });

  const pending = contacts.filter((c) => c.status === "PENDING").length;

  return (
    <div className="admin-fade-in">
      <PageHeader
        title="Contactos"
        subtitle={
          <span>
            {contacts.length} mensajes
            {pending > 0 && (
              <Badge variant="warning" className="ml-2 align-middle">
                {pending} pendientes
              </Badge>
            )}
          </span>
        }
      />

      <Table>
        <TableHead>
          <TableHeader>Nombre</TableHeader>
          <TableHeader className="hidden md:table-cell">Asunto</TableHeader>
          <TableHeader>Estado</TableHeader>
          <TableHeader className="hidden sm:table-cell">Fecha</TableHeader>
          <TableHeader align="right">Accion</TableHeader>
        </TableHead>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                <p className="font-medium">{contact.name}</p>
                <p className="mt-0.5 text-xs text-muted">{contact.email}</p>
              </TableCell>
              <TableCell className="text-muted max-w-xs truncate hidden md:table-cell">
                {contact.subject}
              </TableCell>
              <TableCell>
                <ContactStatusBadge status={contact.status} />
              </TableCell>
              <TableCell className="text-muted hidden sm:table-cell">
                {new Date(contact.createdAt).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell align="right">
                <LinkButton href={`/dashboard/contacts/${contact.id}`} variant="secondary" size="sm">
                  Ver
                </LinkButton>
              </TableCell>
            </TableRow>
          ))}
          {contacts.length === 0 && (
            <TableEmpty colSpan={5} icon={IconMail} message="No hay mensajes de contacto" />
          )}
        </TableBody>
      </Table>
    </div>
  );
}
