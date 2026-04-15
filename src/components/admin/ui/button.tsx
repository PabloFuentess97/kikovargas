import { type ReactNode, type ButtonHTMLAttributes } from "react";
import Link from "next/link";

/* ─── Button Variants ─────────────────────────────── */

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

/* ─── Button Component ────────────────────────────── */

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

/* ─── Link Button ─────────────────────────────────── */

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
