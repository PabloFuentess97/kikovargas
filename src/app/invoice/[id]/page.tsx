import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { InvoiceView } from "./invoice-view";

export const dynamic = "force-dynamic";

function formatCurrency(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(cents / 100);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export default async function InvoicePrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { id } = await params;
  const { print } = await searchParams;

  const session = await getSession();
  if (!session) notFound();

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
    },
  });

  if (!invoice) notFound();

  // Isolation: admins see any; clients see only their own
  if (session.role !== "ADMIN" && invoice.clientId !== session.sub) {
    notFound();
  }

  // Get business data from config
  const businessConfig = await prisma.siteConfig.findUnique({ where: { key: "navbar" } });
  const businessName =
    ((businessConfig?.value as Record<string, string>)?.brandFirst ?? "Kiko") +
    " " +
    ((businessConfig?.value as Record<string, string>)?.brandSecond ?? "Vargas");

  const contactConfig = await prisma.siteConfig.findUnique({ where: { key: "contact" } });
  const businessEmail = (contactConfig?.value as Record<string, string>)?.email ?? "contacto@kikovargass.com";

  const socialConfig = await prisma.siteConfig.findUnique({ where: { key: "social" } });
  const instagramHandle =
    (socialConfig?.value as Record<string, string>)?.instagramHandle ?? "@kikovargass";

  const STATUS_LABEL: Record<string, { text: string; color: string }> = {
    DRAFT:     { text: "Borrador",    color: "#6b6b76" },
    PENDING:   { text: "Pendiente",   color: "#f59e0b" },
    PAID:      { text: "Pagada",      color: "#10b981" },
    CANCELLED: { text: "Cancelada",   color: "#6b6b76" },
    OVERDUE:   { text: "Vencida",     color: "#ef4444" },
  };

  const status = STATUS_LABEL[invoice.status] ?? STATUS_LABEL.PENDING;

  return (
    <InvoiceView
      autoPrint={print === "1"}
      data={{
        number: invoice.number,
        concept: invoice.concept,
        amount: invoice.amount,
        currency: invoice.currency,
        statusText: status.text,
        statusColor: status.color,
        issueDate: formatDate(invoice.issueDate),
        dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : null,
        paidAt: invoice.paidAt ? formatDate(invoice.paidAt) : null,
        notes: invoice.notes,
        formattedAmount: formatCurrency(invoice.amount, invoice.currency),
        client: {
          name: invoice.client.name,
          email: invoice.client.email,
          phone: invoice.client.phone,
        },
        business: {
          name: businessName,
          email: businessEmail,
          instagram: instagramHandle,
        },
      }}
    />
  );
}
