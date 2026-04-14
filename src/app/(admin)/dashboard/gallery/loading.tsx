export default function GalleryLoading() {
  return (
    <div className="animate-in fade-in duration-300">
      <div>
        <div className="h-8 w-28 rounded-lg skeleton-admin" />
        <div className="mt-2 h-4 w-64 rounded skeleton-admin" />
      </div>

      <div className="mt-8">
        {/* Upload zone skeleton */}
        <div className="rounded-xl border-2 border-dashed border-border p-10 flex flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-full skeleton-admin" />
          <div className="h-4 w-48 rounded skeleton-admin" />
          <div className="h-3 w-32 rounded skeleton-admin" />
        </div>

        {/* Image grid skeleton */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="aspect-square skeleton-admin" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-[70%] rounded skeleton-admin" />
                <div className="flex items-center gap-2">
                  <div className="h-6 w-14 rounded skeleton-admin" />
                  <div className="h-6 w-14 rounded skeleton-admin" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
