export default function Loading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="space-y-2">
        <div className="skeleton skeleton-lg w-64" />
        <div className="skeleton skeleton-sm w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="skeleton skeleton-circle w-16 h-16" />
              <div className="flex-1 space-y-2">
                <div className="skeleton skeleton-md w-3/4" />
                <div className="skeleton skeleton-sm w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="skeleton skeleton-sm w-full" />
              <div className="skeleton skeleton-sm w-5/6" />
            </div>
            <div className="flex gap-2">
              <div className="skeleton skeleton-md flex-1" />
              <div className="skeleton skeleton-md w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
