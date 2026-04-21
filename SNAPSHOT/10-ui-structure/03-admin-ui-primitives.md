# UI Structure — Admin UI Primitives (Exact Code)

All reusable admin components live in `src/components/admin/ui/`. Every admin page composes from these primitives.

## Button (`button.tsx`)

```tsx
import { type ReactNode, type ButtonHTMLAttributes } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:   "bg-a-accent text-black hover:bg-a-accent-hover active:scale-[0.97]",
  secondary: "border border-border text-muted hover:text-foreground hover:border-foreground/20",
  danger:    "border border-danger/20 text-danger hover:bg-danger/10 hover:border-danger/40",
  ghost:     "text-muted hover:text-foreground hover:bg-card-hover",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  loading,
  icon,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {icon && !loading && icon}
      {loading ? "..." : children}
    </button>
  );
}

interface LinkButtonProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  children,
  icon,
  className = "",
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
    >
      {icon && icon}
      {children}
    </Link>
  );
}
```

## Card (`card.tsx`)

```tsx
import { type ReactNode } from "react";

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
```

## Badge (`badge.tsx`)

```tsx
import { type ReactNode } from "react";

type BadgeVariant = "warning" | "success" | "danger" | "info" | "muted" | "accent";

const VARIANT_STYLES: Record<BadgeVariant, { dot: string; bg: string }> = {
  warning: { dot: "bg-warning",   bg: "bg-warning/10 text-warning" },
  success: { dot: "bg-success",   bg: "bg-success/10 text-success" },
  danger:  { dot: "bg-danger",    bg: "bg-danger/10 text-danger" },
  info:    { dot: "bg-a-primary", bg: "bg-a-primary/10 text-a-primary" },
  muted:   { dot: "bg-muted",     bg: "bg-muted/10 text-muted" },
  accent:  { dot: "bg-a-accent",  bg: "bg-a-accent-dim text-a-accent" },
};

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

export function StatusDot({ active, label }: { active: boolean; label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-block h-2 w-2 rounded-full ${active ? "bg-success" : "bg-danger"}`} />
      {label && <span className="text-xs text-muted">{label}</span>}
    </span>
  );
}

// Pre-built status maps
export const POST_STATUS_MAP: Record<string, { text: string; variant: BadgeVariant }> = {
  DRAFT:     { text: "Borrador",  variant: "warning" },
  PUBLISHED: { text: "Publicado", variant: "success" },
  ARCHIVED:  { text: "Archivado", variant: "muted" },
};

export const CONTACT_STATUS_MAP: Record<string, { text: string; variant: BadgeVariant }> = {
  PENDING:  { text: "Pendiente",  variant: "warning" },
  READ:     { text: "Leido",      variant: "info" },
  REPLIED:  { text: "Respondido", variant: "success" },
  ARCHIVED: { text: "Archivado",  variant: "muted" },
};

export function PostStatusBadge({ status }: { status: string }) {
  const config = POST_STATUS_MAP[status] ?? POST_STATUS_MAP.DRAFT;
  return <Badge variant={config.variant}>{config.text}</Badge>;
}

export function ContactStatusBadge({ status }: { status: string }) {
  const config = CONTACT_STATUS_MAP[status] ?? CONTACT_STATUS_MAP.PENDING;
  return <Badge variant={config.variant}>{config.text}</Badge>;
}
```

## Table (`table.tsx`)

```tsx
import { type ReactNode } from "react";

export function Table({ children, className = "" }: { children: ReactNode; className?: string }) {
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

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-border">{children}</tr>
    </thead>
  );
}

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

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function TableRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <tr className={`transition-colors hover:bg-card-hover ${className}`}>
      {children}
    </tr>
  );
}

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
```

## Form (`form.tsx`)

```tsx
import { type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";

export function FormField({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

interface FormLabelProps {
  htmlFor?: string;
  children: ReactNode;
  optional?: boolean;
  aside?: ReactNode;
  className?: string;
}

export function FormLabel({ htmlFor, children, optional, aside, className = "" }: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted mb-2 ${className}`}
    >
      {children}
      {optional && (
        <span className="text-[0.6rem] font-normal normal-case tracking-normal text-muted/60">
          Opcional
        </span>
      )}
      {aside}
    </label>
  );
}

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function FormInput({ error, className = "", ...props }: FormInputProps) {
  return (
    <>
      <input
        className={`w-full px-4 py-3 text-sm ${error ? "!border-danger !ring-danger/20" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </>
  );
}

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function FormTextarea({ error, className = "", ...props }: FormTextareaProps) {
  return (
    <>
      <textarea
        className={`w-full px-4 py-3 text-sm ${error ? "!border-danger !ring-danger/20" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </>
  );
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  error?: string;
}

export function FormSelect({ error, className = "", children, ...props }: FormSelectProps) {
  return (
    <>
      <select
        className={`px-4 py-3 text-sm cursor-pointer ${error ? "!border-danger !ring-danger/20" : ""} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
      {message}
    </div>
  );
}

export function FormActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-4 border-t border-border">
      {children}
    </div>
  );
}
```

## StatCard (`stat-card.tsx`)

```tsx
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
      <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${accent ? "text-warning" : ""}`}>
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
```

## PageHeader (`page-header.tsx`)

```tsx
import { type ReactNode } from "react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
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
```

## Barrel Export (`index.ts`)

```tsx
export { Button, LinkButton } from "./button";
export { Card, CardHeader, CardContent } from "./card";
export {
  Badge,
  StatusDot,
  PostStatusBadge,
  ContactStatusBadge,
  POST_STATUS_MAP,
  CONTACT_STATUS_MAP,
} from "./badge";
export {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableEmpty,
} from "./table";
export {
  FormField,
  FormLabel,
  FormInput,
  FormTextarea,
  FormSelect,
  FormError,
  FormActions,
} from "./form";
export { StatCard } from "./stat-card";
export { PageHeader, Breadcrumb } from "./page-header";
export { EmptyState } from "./empty-state";
export { ProgressBar } from "./progress-bar";
export { InfoRow } from "./info-row";
```

## Usage Convention

Every admin page imports from the barrel:
```tsx
import {
  Card, CardHeader, CardContent,
  Table, TableHead, TableHeader, TableBody, TableRow, TableCell, TableEmpty,
  Button, LinkButton,
  PageHeader,
  PostStatusBadge,
  FormField, FormLabel, FormInput, FormError, FormActions,
} from "@/components/admin/ui";
```
