export default function Loading() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="skeleton skeleton-lg w-48" />
        <div className="skeleton skeleton-md w-32" />
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border bg-muted/30">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`skeleton skeleton-sm ${i === 0 ? "col-span-4" : i === 4 ? "col-span-2" : "col-span-2"}`} />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-border last:border-b-0 items-center">
            <div className="col-span-4 space-y-2">
              <div className="skeleton skeleton-sm w-3/4" />
              <div className="skeleton skeleton-sm w-1/2" />
            </div>
            <div className="col-span-2 skeleton skeleton-sm" />
            <div className="col-span-2 skeleton skeleton-sm" />
            <div className="col-span-2 skeleton skeleton-sm" />
            <div className="col-span-2 flex justify-end gap-2">
              <div className="skeleton skeleton-sm w-16" />
              <div className="skeleton skeleton-sm w-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
