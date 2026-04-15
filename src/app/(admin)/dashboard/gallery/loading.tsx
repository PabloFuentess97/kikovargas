export default function GalleryLoading() {
  return (
    <div className="admin-fade-in">
      <div className="mb-8">
        <div className="h-7 w-28 rounded-lg skeleton-admin" />
        <div className="mt-2 h-4 w-64 rounded skeleton-admin" />
      </div>

      {/* Upload zone skeleton */}
      <div className="rounded-xl border-2 border-dashed border-border p-14 flex flex-col items-center justify-center gap-3">
        <div className="h-12 w-12 rounded-full skeleton-admin" />
        <div className="h-4 w-48 rounded skeleton-admin" />
        <div className="h-3 w-32 rounded skeleton-admin" />
      </div>

      {/* Count */}
      <div className="mt-6 h-4 w-40 rounded skeleton-admin" />

      {/* Image grid skeleton */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="admin-card overflow-hidden">
            <div className="aspect-[4/5] skeleton-admin" />
          </div>
        ))}
      </div>
    </div>
  );
}
