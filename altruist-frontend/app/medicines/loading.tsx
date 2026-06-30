export default function Loading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="space-y-2">
        <div className="skeleton skeleton-lg w-72" />
        <div className="skeleton skeleton-sm w-80 max-w-full" />
      </div>
      <div className="flex gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton skeleton-md w-24" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 space-y-3">
            <div className="skeleton skeleton-xl w-full" />
            <div className="space-y-2">
              <div className="skeleton skeleton-sm w-3/4" />
              <div className="skeleton skeleton-sm w-1/2" />
            </div>
            <div className="flex items-center justify-between">
              <div className="skeleton skeleton-md w-16" />
              <div className="skeleton skeleton-circle w-9 h-9" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
