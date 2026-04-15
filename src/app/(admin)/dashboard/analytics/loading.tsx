export default function AnalyticsLoading() {
  return (
    <div className="admin-fade-in">
      <div className="mb-8">
        <div className="h-7 w-32 rounded-lg skeleton-admin" />
        <div className="mt-2 h-4 w-52 rounded skeleton-admin" />
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="admin-card p-5">
            <div className="h-2.5 w-16 rounded skeleton-admin" />
            <div className="mt-3 h-9 w-20 rounded skeleton-admin" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="mt-6 admin-card p-5">
        <div className="h-4 w-36 rounded skeleton-admin mb-6" />
        <div className="flex items-end gap-[2px] h-44">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 skeleton-admin rounded-t"
              style={{ height: `${20 + Math.sin(i * 0.5) * 30 + Math.random() * 40}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t border-border">
          <div className="h-2.5 w-12 rounded skeleton-admin" />
          <div className="h-2.5 w-8 rounded skeleton-admin" />
        </div>
      </div>

      {/* Tables grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="admin-card overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <div className="h-4 w-36 rounded skeleton-admin" />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="flex items-center justify-between px-5 py-3">
                  <div className="h-4 w-[55%] rounded skeleton-admin" />
                  <div className="h-4 w-10 rounded skeleton-admin" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="admin-card overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <div className="h-4 w-28 rounded skeleton-admin" />
            </div>
            <div className="p-5 space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-3 w-20 rounded skeleton-admin" />
                    <div className="h-3 w-14 rounded skeleton-admin" />
                  </div>
                  <div className="h-1.5 rounded-full skeleton-admin" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
