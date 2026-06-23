import React, { Suspense } from "react";
import UnauthorizedContent from "./UnauthorizedContent";

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse w-20 h-20 bg-slate-200 rounded-full" />
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  );
}
