"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// buttonVariants comes from a 'use client' module, so it can only be invoked
// inside a Client Component. Keep error.tsx server-render-friendly by inlining
// the same outline-button class set via Tailwind here.
const outlineLinkClasses =
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border bg-transparent hover:bg-muted hover:text-foreground h-10 px-4 py-2 gap-2";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log full error server-side / telemetry only — never expose stack to UI.
    // eslint-disable-next-line no-console
    console.error("[Altruist] Unhandled error boundary:", {
      message: error?.message,
      digest: error?.digest,
    });
    toast.error("Something went wrong. We're on it.");
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-lg text-center space-y-6">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            We&apos;ve been notified and our team is looking into it. You can try again
            or head back home.
          </p>
        </div>

        {error?.digest && (
          <p className="text-xs text-muted-foreground/70 font-mono">
            Reference: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
          <Link href="/" className={outlineLinkClasses}>
            <Home className="w-4 h-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}