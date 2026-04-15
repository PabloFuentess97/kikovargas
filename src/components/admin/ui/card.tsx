import { type ReactNode } from "react";

/* ─── Card ────────────────────────────────────────── */

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  as?: "div" | "article" | "section";
}

export function Card({ children, className = "", interactive, as: Tag = "div" }: CardProps) {
  return (
    <Tag
      className={`admin-card ${interactive ? "admin-card-interactive" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}

/* ─── Card Header ─────────────────────────────────── */

interface CardHeaderProps {
  title: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, action, className = "" }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between border-b border-border px-5 py-4 ${className}`}>
      <h2 className="text-sm font-semibold">{title}</h2>
      {action}
    </div>
  );
}

/* ─── Card Content ────────────────────────────────── */

interface CardContentProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

export function CardContent({ children, className = "", padded = true }: CardContentProps) {
  return (
    <div className={`${padded ? "p-5" : ""} ${className}`}>
      {children}
    </div>
  );
}
