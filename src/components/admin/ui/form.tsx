import { type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";

/* ─── Form Field Wrapper ──────────────────────────── */

interface FormFieldProps {
  children: ReactNode;
  className?: string;
}

export function FormField({ children, className = "" }: FormFieldProps) {
  return <div className={className}>{children}</div>;
}

/* ─── Form Label ──────────────────────────────────── */

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

/* ─── Form Input ──────────────────────────────────── */

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

/* ─── Form Textarea ───────────────────────────────── */

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

/* ─── Form Select ─────────────────────────────────── */

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

/* ─── Form Error Banner ───────────────────────────── */

export function FormError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
      {message}
    </div>
  );
}

/* ─── Form Actions ────────────────────────────────── */

export function FormActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-4 border-t border-border">
      {children}
    </div>
  );
}
