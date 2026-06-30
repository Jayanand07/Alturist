export default function Loading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="space-y-2">
        <div className="skeleton skeleton-lg w-56" />
        <div className="skeleton skeleton-sm w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="skeleton skeleton-md w-3/4" />
                <div className="skeleton skeleton-sm w-1/2" />
              </div>
              <div className="skeleton skeleton-md w-20" />
            </div>
            <div className="flex gap-2">
              <div className="skeleton skeleton-sm flex-1" />
              <div className="skeleton skeleton-sm w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
