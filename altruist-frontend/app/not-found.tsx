import Link from "next/link";
import { SearchX, Home, ArrowLeft } from "lucide-react";
import FuzzySearchBar from "@/components/shared/FuzzySearchBar";

// Inlined button-styling constants — the Button component from
// @/components/ui/button is a 'use client' module and cannot be invoked from a
// Server Component. This file is a Server Component for fast 404s, so we use
// plain Tailwind classes that match the CVA variants.
const defaultLinkClasses =
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-10 px-4 py-2 gap-2";

const outlineLinkClasses =
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border bg-transparent hover:bg-muted hover:text-foreground h-10 px-4 py-2 gap-2";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-accent/5">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="mx-auto h-20 w-20 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
          <SearchX className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <p className="text-7xl sm:text-8xl font-black tracking-tight text-accent">
            404
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Page not found
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Try searching below or head back home.
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <FuzzySearchBar
            className="max-w-xl"
            placeholder="Search medicines, doctors, lab tests…"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/" className={defaultLinkClasses}>
            <Home className="w-4 h-4" />
            Back to home
          </Link>
          <Link href="/medicines" className={outlineLinkClasses}>
            <ArrowLeft className="w-4 h-4" />
            Browse medicines
          </Link>
        </div>
      </div>
    </div>
  );
}