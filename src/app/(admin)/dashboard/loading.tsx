export default function DashboardLoading() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="h-8 w-36 rounded-lg skeleton-admin" />
        <div className="mt-2 h-4 w-48 rounded skeleton-admin" />
      </div>

      {/* Stats grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="h-3 w-24 rounded skeleton-admin" />
            <div className="mt-3 h-9 w-16 rounded skeleton-admin" />
            <div className="mt-2 h-3 w-32 rounded skeleton-admin" />
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <div className="h-4 w-28 rounded skeleton-admin" />
              <div className="h-3 w-16 rounded skeleton-admin" />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-[60%] rounded skeleton-admin" />
                    <div className="mt-1.5 h-3 w-[35%] rounded skeleton-admin" />
                  </div>
                  <div className="ml-4 h-5 w-16 rounded-full skeleton-admin" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
