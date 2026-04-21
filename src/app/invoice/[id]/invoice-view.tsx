"use client";

import { useEffect } from "react";

interface Props {
  autoPrint: boolean;
  data: {
    number: string;
    concept: string;
    amount: number;
    currency: string;
    statusText: string;
    statusColor: string;
    issueDate: string;
    dueDate: string | null;
    paidAt: string | null;
    notes: string;
    formattedAmount: string;
    client: { name: string; email: string; phone: string | null };
    business: { name: string; email: string; instagram: string };
  };
}

export function InvoiceView({ autoPrint, data }: Props) {
  useEffect(() => {
    if (autoPrint) {
      // Small delay to ensure DOM is rendered
      const t = setTimeout(() => window.print(), 500);
      return () => clearTimeout(t);
    }
  }, [autoPrint]);

  return (
    <div className="invoice-page">
      <style>{`
        :root {
          --gold: #c9a84c;
          --gold-bright: #dfc06a;
          --void: #030303;
          --text: #ededed;
          --text-muted: #a8a8a8;
          --text-dim: #6b6b76;
          --border: rgba(255,255,255,0.08);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; }

        /* Screen view — dark theme */
        @media screen {
          body {
            background: #000;
            padding: 40px 20px;
            color: var(--text);
          }
          .invoice-page {
            max-width: 820px;
            margin: 0 auto;
          }
          .print-toolbar {
            max-width: 820px;
            margin: 0 auto 20px;
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            flex-wrap: wrap;
          }
          .print-toolbar button, .print-toolbar a {
            background: var(--gold);
            color: #000;
            border: none;
            padding: 10px 20px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: filter 0.2s, transform 0.1s;
          }
          .print-toolbar button:hover, .print-toolbar a:hover { filter: brightness(1.1); }
          .print-toolbar button:active, .print-toolbar a:active { transform: scale(0.97); }
          .print-toolbar .btn-ghost {
            background: transparent;
            color: var(--text-muted);
            border: 1px solid var(--border);
          }
          .invoice {
            background: #0e0e0e;
            border: 1px solid var(--border);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
          }
        }

        /* Print — clean white with gold accents */
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            background: #fff;
            color: #000;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-toolbar { display: none !important; }
          .invoice {
            background: #fff;
            border: none;
            box-shadow: none;
            color: #0a0a0a;
          }
          .invoice-heading, .invoice-label, .invoice-accent { color: var(--gold) !important; }
          .invoice-body { color: #0a0a0a !important; }
          .muted-on-print { color: #555 !important; }
          .bg-on-print { background: #fafafa !important; }
        }

        .print-toolbar svg { width: 16px; height: 16px; }

        /* Invoice layout */
        .invoice {
          padding: 48px 44px;
          position: relative;
        }

        .invoice::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent, var(--gold) 20%, var(--gold) 80%, transparent);
        }

        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          padding-bottom: 32px;
          border-bottom: 1px solid var(--border);
        }

        @media print {
          .header { border-bottom-color: #e5e5e5; }
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-mark {
          width: 48px;
          height: 48px;
          border: 1.5px solid var(--gold);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          color: var(--gold);
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }

        .brand-text .name {
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.01em;
          text-transform: uppercase;
        }

        .brand-text .tag {
          font-size: 10px;
          color: var(--text-dim);
          letter-spacing: 0.3em;
          text-transform: uppercase;
          margin-top: 4px;
        }

        .invoice-id {
          text-align: right;
        }

        .invoice-id .label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 6px;
        }

        .invoice-id .number {
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.02em;
          font-family: 'SF Mono', 'Menlo', monospace;
        }

        .status-pill {
          display: inline-block;
          margin-top: 10px;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        /* Parties section */
        .parties {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-top: 32px;
          padding-bottom: 32px;
          border-bottom: 1px solid var(--border);
        }

        @media print {
          .parties { border-bottom-color: #e5e5e5; }
        }

        .party-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 10px;
        }

        .party-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 6px;
          text-transform: capitalize;
        }

        .party-line {
          font-size: 12px;
          color: var(--text-muted);
          line-height: 1.7;
        }

        @media print {
          .party-line { color: #555; }
        }

        /* Dates */
        .dates {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 32px;
        }

        .date-block .label {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 4px;
        }

        .date-block .value {
          font-size: 13px;
          font-weight: 500;
        }

        /* Concept + amount */
        .line-items {
          margin-top: 40px;
          padding: 24px;
          background: rgba(201, 168, 76, 0.04);
          border: 1px solid rgba(201, 168, 76, 0.15);
          border-left: 3px solid var(--gold);
          border-radius: 10px;
        }

        @media print {
          .line-items {
            background: rgba(201, 168, 76, 0.06);
            border-color: rgba(201, 168, 76, 0.3);
            border-left-color: var(--gold);
          }
        }

        .line-items .label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 8px;
        }

        .line-items .concept {
          font-size: 15px;
          font-weight: 500;
          line-height: 1.5;
        }

        /* Total */
        .total-row {
          margin-top: 40px;
          padding: 24px 0;
          border-top: 1px solid var(--border);
          border-bottom: 2px solid var(--gold);
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }

        @media print {
          .total-row { border-top-color: #e5e5e5; }
        }

        .total-row .label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--gold);
        }

        .total-row .amount {
          font-size: 36px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        /* Notes */
        .notes {
          margin-top: 32px;
          padding: 16px 20px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          border-radius: 10px;
        }

        @media print {
          .notes {
            background: #fafafa;
            border-color: #e5e5e5;
          }
        }

        .notes-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 6px;
        }

        .notes-text {
          font-size: 12px;
          line-height: 1.7;
          color: var(--text-muted);
          white-space: pre-wrap;
        }

        @media print {
          .notes-text { color: #555; }
        }

        /* Footer */
        .footer {
          margin-top: 48px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          font-size: 10px;
          color: var(--text-dim);
          letter-spacing: 0.15em;
        }

        @media print {
          .footer { border-top-color: #e5e5e5; }
        }

        .footer strong { color: var(--gold); }

        /* Responsive */
        @media (max-width: 640px) {
          .invoice { padding: 32px 20px; }
          .header { flex-direction: column; }
          .invoice-id { text-align: left; }
          .parties { grid-template-columns: 1fr; gap: 20px; }
          .dates { grid-template-columns: 1fr; }
          .total-row .amount { font-size: 28px; }
        }
      `}</style>

      {/* Toolbar (hidden on print) */}
      <div className="print-toolbar">
        <button onClick={() => window.print()}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
          </svg>
          Descargar PDF
        </button>
        <button className="btn-ghost" onClick={() => window.close()}>
          Cerrar
        </button>
      </div>

      {/* Invoice */}
      <div className="invoice">
        {/* Header */}
        <div className="header">
          <div className="brand">
            <div className="brand-mark">{data.business.name.charAt(0).toUpperCase()}</div>
            <div className="brand-text">
              <div className="name invoice-body">{data.business.name}</div>
              <div className="tag">Coaching · Fitness</div>
            </div>
          </div>
          <div className="invoice-id">
            <div className="label">Factura</div>
            <div className="number invoice-body">#{data.number}</div>
            <span className="status-pill" style={{ background: `${data.statusColor}20`, color: data.statusColor }}>
              {data.statusText}
            </span>
          </div>
        </div>

        {/* Parties */}
        <div className="parties">
          <div>
            <div className="party-label">De</div>
            <div className="party-name invoice-body">{data.business.name}</div>
            <div className="party-line muted-on-print">{data.business.email}</div>
            <div className="party-line muted-on-print">{data.business.instagram}</div>
          </div>
          <div>
            <div className="party-label">Para</div>
            <div className="party-name invoice-body">{data.client.name}</div>
            <div className="party-line muted-on-print">{data.client.email}</div>
            {data.client.phone && <div className="party-line muted-on-print">{data.client.phone}</div>}
          </div>
        </div>

        {/* Dates */}
        <div className="dates">
          <div className="date-block">
            <div className="label">Emision</div>
            <div className="value invoice-body">{data.issueDate}</div>
          </div>
          {data.dueDate && (
            <div className="date-block">
              <div className="label">Vencimiento</div>
              <div className="value invoice-body">{data.dueDate}</div>
            </div>
          )}
          {data.paidAt && (
            <div className="date-block">
              <div className="label">Pagada</div>
              <div className="value invoice-body" style={{ color: "#10b981" }}>{data.paidAt}</div>
            </div>
          )}
        </div>

        {/* Concept */}
        <div className="line-items">
          <div className="label">Concepto</div>
          <div className="concept invoice-body">{data.concept}</div>
        </div>

        {/* Total */}
        <div className="total-row">
          <div className="label">Total</div>
          <div className="amount invoice-accent" style={{ color: "var(--gold)" }}>{data.formattedAmount}</div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="notes bg-on-print">
            <div className="notes-label">Notas</div>
            <div className="notes-text">{data.notes}</div>
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          <span>Kikovargas<strong>.fit</strong></span>
          <span>Factura #{data.number}</span>
        </div>
      </div>
    </div>
  );
}
