import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-background">
      {/* Header placeholder */}
      <div className="h-16 w-full bg-muted/60 border-b border-border flex items-center px-6 gap-4">
        <Skeleton className="h-8 w-28 rounded-md" />
        <div className="hidden md:flex flex-1 max-w-2xl mx-auto gap-3">
          <Skeleton className="h-9 flex-1 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>

      {/* Sub-header status strip */}
      <div className="w-full bg-accent/5 border-b border-border py-2 flex items-center justify-center gap-2 text-xs font-medium text-accent">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Loading Altruist…</span>
      </div>

      {/* Main content skeleton */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Hero block */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3 max-w-md rounded-lg" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-md" />
          <Skeleton className="h-5 w-5/6 max-w-xl rounded-md" />
        </div>

        {/* 6 card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-32 w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full rounded-md" />
                <Skeleton className="h-3 w-5/6 rounded-md" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}