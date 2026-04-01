"use client";

import React from "react";
import PlaceholderPage from "@/components/shared/PlaceholderPage";
import { Activity } from "lucide-react";

export default function DiagnosticsPage() {
  return (
    <PlaceholderPage 
      title="Diagnostics" 
      description="Access your diagnostic reports, book home collection, and manage your health records all in one place."
      icon={Activity}
    />
  );
}
