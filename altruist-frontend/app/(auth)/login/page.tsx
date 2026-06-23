import React, { Suspense } from "react";
import LoginForm from "./LoginForm";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
