import { type ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  message: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, message, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-a-accent-dim">
        {icon}
      </div>
      <p className="text-sm text-muted">{message}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
