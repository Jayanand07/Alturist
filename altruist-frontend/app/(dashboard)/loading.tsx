export default function Loading() {
  return (
    <div className="w-full min-h-screen px-4 md:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="skeleton skeleton-lg w-48" />
        <div className="skeleton skeleton-md w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="skeleton skeleton-sm w-1/2" />
            <div className="skeleton skeleton-lg w-2/3" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 space-y-3">
          <div className="skeleton skeleton-md w-1/3" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton skeleton-circle w-10 h-10" />
              <div className="flex-1 space-y-2">
                <div className="skeleton skeleton-sm w-3/4" />
                <div className="skeleton skeleton-sm w-1/2" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card p-6 space-y-3">
          <div className="skeleton skeleton-md w-1/2" />
          <div className="skeleton skeleton-xl w-full" />
          <div className="skeleton skeleton-md w-2/3" />
        </div>
      </div>
    </div>
  );
}
