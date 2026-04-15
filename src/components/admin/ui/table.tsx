import { type ReactNode } from "react";

/* ─── Table Root ──────────────────────────────────── */

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = "" }: TableProps) {
  return (
    <div className="admin-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${className}`}>
          {children}
        </table>
      </div>
    </div>
  );
}

/* ─── Table Head ──────────────────────────────────── */

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-border">{children}</tr>
    </thead>
  );
}

/* ─── Table Header Cell ───────────────────────────── */

interface TableHeaderProps {
  children?: ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

export function TableHeader({ children, align = "left", className = "" }: TableHeaderProps) {
  return (
    <th
      className={`px-3 sm:px-5 py-3 sm:py-3.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted whitespace-nowrap ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
      } ${className}`}
    >
      {children}
    </th>
  );
}

/* ─── Table Body ──────────────────────────────────── */

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

/* ─── Table Row ───────────────────────────────────── */

export function TableRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <tr className={`transition-colors hover:bg-card-hover ${className}`}>
      {children}
    </tr>
  );
}

/* ─── Table Cell ──────────────────────────────────── */

interface TableCellProps {
  children?: ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
  colSpan?: number;
}

export function TableCell({ children, align = "left", className = "", colSpan }: TableCellProps) {
  return (
    <td
      colSpan={colSpan}
      className={`px-3 sm:px-5 py-3 sm:py-4 ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : ""
      } ${className}`}
    >
      {children}
    </td>
  );
}

/* ─── Table Empty State ───────────────────────────── */

interface TableEmptyProps {
  colSpan: number;
  icon: ReactNode;
  message: string;
  action?: ReactNode;
}

export function TableEmpty({ colSpan, icon, message, action }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-16 text-center">
        <div className="flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-a-accent-dim">
            {icon}
          </div>
          <p className="text-sm text-muted">{message}</p>
          {action && <div className="mt-2">{action}</div>}
        </div>
      </td>
    </tr>
  );
}
