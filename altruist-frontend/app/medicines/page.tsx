import React, { Suspense } from "react";
import MedicinesCatalog from "./MedicinesCatalog";
import { Loader2 } from "lucide-react";

export default function MedicinesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <MedicinesCatalog />
    </Suspense>
  );
}