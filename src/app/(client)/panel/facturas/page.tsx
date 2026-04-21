import { requireClient } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

function formatCurrency(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency }).format(cents / 100);
}

const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  DRAFT:     { text: "Borrador",    color: "text-muted bg-muted/10" },
  PENDING:   { text: "Pendiente",   color: "text-warning bg-warning/10" },
  PAID:      { text: "Pagada",      color: "text-success bg-success/10" },
  CANCELLED: { text: "Cancelada",   color: "text-muted bg-muted/10" },
  OVERDUE:   { text: "Vencida",     color: "text-danger bg-danger/10" },
};

export default async function ClientInvoicesPage() {
  const session = await requireClient();

  const invoices = await prisma.invoice.findMany({
    where: { clientId: session.sub, status: { not: "DRAFT" } },
    orderBy: { issueDate: "desc" },
  });

  const pending = invoices.filter((i) => i.status === "PENDING" || i.status === "OVERDUE");
  const others = invoices.filter((i) => i.status !== "PENDING" && i.status !== "OVERDUE");

  const pendingTotal = pending.reduce((s, i) => s + i.amount, 0);
  const pendingCurrency = pending[0]?.currency ?? "EUR";

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-a-accent/10">
          <svg className="h-7 w-7 text-a-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Sin facturas</h3>
        <p className="text-sm text-muted max-w-xs">Aqui aparecera el historial de tus pagos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending summary card */}
      {pending.length > 0 && (
        <div className="rounded-2xl border border-warning/20 bg-warning/5 p-5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-warning mb-1">
            Por pagar
          </p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(pendingTotal, pendingCurrency)}</p>
          <p className="text-xs text-muted mt-1">
            {pending.length} factura{pending.length !== 1 ? "s" : ""} pendiente{pending.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted mb-3 px-1">
            Pendientes
          </h2>
          <div className="space-y-2">
            {pending.map((inv) => <InvoiceRow key={inv.id} inv={inv} />)}
          </div>
        </div>
      )}

      {/* History */}
      {others.length > 0 && (
        <div>
          <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-muted mb-3 px-1">
            Historial
          </h2>
          <div className="space-y-2">
            {others.map((inv) => <InvoiceRow key={inv.id} inv={inv} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceRow({ inv }: { inv: { id: string; number: string; concept: string; amount: number; currency: string; status: string; issueDate: Date; dueDate: Date | null; paidAt: Date | null; pdfUrl: string | null } }) {
  const status = STATUS_LABEL[inv.status] ?? STATUS_LABEL.PENDING;

  return (
    <a
      href={`/invoice/${inv.id}`}
      target="_blank"
      rel="noopener"
      className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-card border border-border active:bg-card-hover active:scale-[0.99] transition-all"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-medium ${status.color}`}>
            {status.text}
          </span>
          <span className="text-[0.65rem] text-muted">#{inv.number}</span>
        </div>
        <p className="text-sm font-medium text-foreground truncate">{inv.concept}</p>
        <p className="text-[0.7rem] text-muted mt-0.5">
          {new Date(inv.issueDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
          {inv.status === "PENDING" && inv.dueDate && (
            <span className="text-warning ml-1.5">· Vence {new Date(inv.dueDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
          )}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-base font-bold text-foreground">{formatCurrency(inv.amount, inv.currency)}</p>
        <span className="inline-flex items-center gap-1 text-[0.65rem] text-a-accent mt-1">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          Ver / PDF
        </span>
      </div>
    </a>
  );
}
