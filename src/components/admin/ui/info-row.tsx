interface InfoRowProps {
  label: string;
  value: string;
  href?: string;
}

export function InfoRow({ label, value, href }: InfoRowProps) {
  return (
    <div>
      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted mb-1">{label}</p>
      {href ? (
        <a href={href} className="text-sm font-medium text-a-accent hover:text-a-accent-hover transition-colors">
          {value}
        </a>
      ) : (
        <p className="text-sm">{value}</p>
      )}
    </div>
  );
}
