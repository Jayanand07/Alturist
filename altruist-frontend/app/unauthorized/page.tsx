"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldX, Home, ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function UnauthorizedContent() {
  const params = useSearchParams();
  const { user, userType } = useAuth();
  const required = params.get("required");
  const current  = params.get("current");

  const roleLabel: Record<string, string> = {
    SUPER_ADMIN: "Administrator",
    DOCTOR:      "Doctor",
    PATIENT:     "Patient",
  };

  const dashboardHref = userType === "SUPER_ADMIN"
    ? "/admin/dashboard"
    : userType === "DOCTOR"
    ? "/doctor"
    : "/patient";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      {/* Glow blob */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-100 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="relative z-10 max-w-md w-full bg-surface rounded-3xl border border-slate-200 shadow-xl p-8 md:p-12 text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center shadow-sm border border-red-100">
          <ShieldX className="w-10 h-10 text-red-500" />
        </div>

        {/* Heading */}
        <h1 className="font-heading text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Access Denied
        </h1>

        {/* Dynamic explanation */}
        <p className="text-slate-500 font-medium mb-2 leading-relaxed">
          {required ? (
            <>
              This page is restricted to{" "}
              <span className="font-bold text-slate-700">
                {roleLabel[required] ?? required}
              </span>{" "}
              accounts.
            </>
          ) : (
            "You don't have permission to view this page."
          )}
        </p>

        {current && (
          <p className="text-sm text-slate-400 font-medium mb-8">
            You are signed in as a{" "}
            <span className="font-bold text-slate-500">
              {roleLabel[current] ?? current}
            </span>
            .
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
          {user ? (
            <>
              <Link href={dashboardHref}>
                <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 h-11 shadow-sm">
                  <Home className="w-4 h-4 mr-2" />
                  Go to My Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="w-full sm:w-auto font-bold rounded-xl h-11 border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 h-11 shadow-sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto font-bold rounded-xl h-11 border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Home
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Error code footer */}
        <p className="text-[11px] text-slate-300 font-mono mt-8">
          HTTP 403 — Forbidden
        </p>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense>
      <UnauthorizedContent />
    </Suspense>
  );
}
