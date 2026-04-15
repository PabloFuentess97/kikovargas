export default function DashboardLoading() {
  return (
    <div className="admin-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="h-3 w-24 rounded skeleton-admin mb-2" />
        <div className="h-7 w-36 rounded-lg skeleton-admin" />
        <div className="mt-2 h-4 w-48 rounded skeleton-admin" />
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="admin-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-2.5 w-20 rounded skeleton-admin" />
              <div className="h-5 w-5 rounded skeleton-admin" />
            </div>
            <div className="h-9 w-14 rounded skeleton-admin" />
            <div className="mt-2 h-3 w-28 rounded skeleton-admin" />
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="admin-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="h-4 w-28 rounded skeleton-admin" />
              <div className="h-3 w-16 rounded skeleton-admin" />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-[60%] rounded skeleton-admin" />
                    <div className="mt-1.5 h-3 w-[35%] rounded skeleton-admin" />
                  </div>
                  <div className="ml-4 h-6 w-20 rounded-full skeleton-admin" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
