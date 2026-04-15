import { type ReactNode } from "react";
import Link from "next/link";

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  href?: string;
  accent?: boolean;
  icon?: ReactNode;
}

export function StatCard({ label, value, sub, href, accent, icon }: StatCardProps) {
  const content = (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
        {icon && (
          <div className={`text-muted transition-colors group-hover:text-a-accent ${accent ? "text-warning" : ""}`}>
            {icon}
          </div>
        )}
      </div>
      <p className={`text-3xl font-bold tracking-tight ${accent ? "text-warning" : ""}`}>
        {typeof value === "number" ? value.toLocaleString("es-MX") : value}
      </p>
      {sub && <p className="mt-1.5 text-xs text-muted">{sub}</p>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="admin-card admin-card-interactive p-5 block group">
        {content}
      </Link>
    );
  }

  return (
    <div className="admin-card p-5 group">
      {content}
    </div>
  );
}
