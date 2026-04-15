import { type ReactNode } from "react";
import Link from "next/link";

/* ─── Breadcrumb ──────────────────────────────────── */

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-xs text-muted mb-2">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span>/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-a-accent transition-colors">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* ─── Page Header ─────────────────────────────────── */

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  eyebrow?: string;
  action?: ReactNode;
  breadcrumb?: BreadcrumbItem[];
  className?: string;
}

export function PageHeader({ title, subtitle, eyebrow, action, breadcrumb, className = "" }: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-a-accent mb-1">{eyebrow}</p>
      )}
      <div className={action ? "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3" : ""}>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
