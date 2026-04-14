export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void">
      {/* Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.5)] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Pulsing accent ring */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 border border-accent/30 animate-ping" />
          <div className="absolute inset-0 border border-accent/10" />
          <div className="w-1.5 h-1.5 bg-accent" />
        </div>

        {/* Brand wordmark */}
        <div className="flex items-center gap-1">
          <span className="font-display text-sm font-bold tracking-[0.25em] uppercase text-primary/60">
            Kiko
          </span>
          <span className="font-display text-sm font-bold tracking-[0.25em] uppercase text-accent/60">
            Vargas
          </span>
        </div>

        {/* Animated loading bar */}
        <div className="w-32 h-[1px] bg-border-subtle overflow-hidden">
          <div
            className="h-full w-1/3 bg-accent/60"
            style={{
              animation: "loadingSlide 1.4s cubic-bezier(0.4, 0, 0, 1) infinite",
            }}
          />
        </div>

        {/* Label */}
        <p className="text-[0.5rem] uppercase tracking-[0.4em] text-tertiary/50">
          Cargando
        </p>
      </div>

      <style>{`
        @keyframes loadingSlide {
          0% { transform: translateX(-130%); }
          100% { transform: translateX(430%); }
        }
      `}</style>
    </div>
  );
}
