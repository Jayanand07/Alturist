export default function Loading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="space-y-2">
        <div className="skeleton skeleton-lg w-56" />
        <div className="skeleton skeleton-sm w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="skeleton skeleton-xl w-full" style={{ aspectRatio: "16/9" }} />
            <div className="p-5 space-y-3">
              <div className="skeleton skeleton-md w-4/5" />
              <div className="space-y-2">
                <div className="skeleton skeleton-sm w-full" />
                <div className="skeleton skeleton-sm w-5/6" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="skeleton skeleton-circle w-8 h-8" />
                <div className="skeleton skeleton-sm w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
