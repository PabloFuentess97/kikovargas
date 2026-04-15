import { type ReactNode } from "react";

/* ─── Badge Variant Config ────────────────────────── */

type BadgeVariant = "warning" | "success" | "danger" | "info" | "muted" | "accent";

const VARIANT_STYLES: Record<BadgeVariant, { dot: string; bg: string }> = {
  warning: { dot: "bg-warning", bg: "bg-warning/10 text-warning" },
  success: { dot: "bg-success", bg: "bg-success/10 text-success" },
  danger:  { dot: "bg-danger", bg: "bg-danger/10 text-danger" },
  info:    { dot: "bg-a-primary", bg: "bg-a-primary/10 text-a-primary" },
  muted:   { dot: "bg-muted", bg: "bg-muted/10 text-muted" },
  accent:  { dot: "bg-a-accent", bg: "bg-a-accent-dim text-a-accent" },
};

/* ─── Badge Component ─────────────────────────────── */

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

export function Badge({ children, variant = "muted", dot = true, className = "" }: BadgeProps) {
  const style = VARIANT_STYLES[variant];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-medium ${style.bg} ${className}`}>
      {dot && <span className={`inline-block h-1.5 w-1.5 rounded-full ${style.dot}`} />}
      {children}
    </span>
  );
}

/* ─── Status Dot ──────────────────────────────────── */

interface StatusDotProps {
  active: boolean;
  label?: string;
}

export function StatusDot({ active, label }: StatusDotProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block h-2 w-2 rounded-full ${active ? "bg-success" : "bg-danger"}`} />
      {label && <span className="text-xs text-muted">{label}</span>}
    </span>
  );
}

/* ─── Pre-built Status Maps ───────────────────────── */

export const POST_STATUS_MAP: Record<string, { text: string; variant: BadgeVariant }> = {
  DRAFT:     { text: "Borrador", variant: "warning" },
  PUBLISHED: { text: "Publicado", variant: "success" },
  ARCHIVED:  { text: "Archivado", variant: "muted" },
};

export const CONTACT_STATUS_MAP: Record<string, { text: string; variant: BadgeVariant }> = {
  PENDING:  { text: "Pendiente", variant: "warning" },
  READ:     { text: "Leido", variant: "info" },
  REPLIED:  { text: "Respondido", variant: "success" },
  ARCHIVED: { text: "Archivado", variant: "muted" },
};

/* ─── Convenience Components ──────────────────────── */

export function PostStatusBadge({ status }: { status: string }) {
  const config = POST_STATUS_MAP[status] ?? POST_STATUS_MAP.DRAFT;
  return <Badge variant={config.variant}>{config.text}</Badge>;
}

export function ContactStatusBadge({ status }: { status: string }) {
  const config = CONTACT_STATUS_MAP[status] ?? CONTACT_STATUS_MAP.PENDING;
  return <Badge variant={config.variant}>{config.text}</Badge>;
}
