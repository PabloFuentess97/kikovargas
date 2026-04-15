interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  detail?: string;
  className?: string;
}

export function ProgressBar({ value, max = 100, label, detail, className = "" }: ProgressBarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className={className}>
      {(label || detail) && (
        <div className="flex items-center justify-between text-sm mb-1.5">
          {label && <span className="font-medium">{label}</span>}
          {detail && <span className="text-muted tabular-nums">{detail}</span>}
        </div>
      )}
      <div className="h-1.5 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-a-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
