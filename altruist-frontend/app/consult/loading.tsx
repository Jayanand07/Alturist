export default function Loading() {
  return (
    <div className="container mx-auto max-w-3xl px-4 md:px-8 py-8 space-y-6">
      <div className="space-y-2">
        <div className="skeleton skeleton-lg w-64" />
        <div className="skeleton skeleton-sm w-96 max-w-full" />
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="skeleton skeleton-sm w-32" />
            <div className="skeleton skeleton-md w-full" />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <div className="skeleton skeleton-lg flex-1" />
          <div className="skeleton skeleton-lg w-32" />
        </div>
      </div>
    </div>
  );
}
