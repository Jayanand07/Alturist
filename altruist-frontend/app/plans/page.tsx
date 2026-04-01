"use client";

import React from "react";
import PlaceholderPage from "@/components/shared/PlaceholderPage";
import { ShieldCheck } from "lucide-react";

export default function PlansPage() {
  return (
    <PlaceholderPage 
      title="Health Plans" 
      description="Explore our comprehensive health subscription plans designed to provide preventative care for you and your family."
      icon={ShieldCheck}
    />
  );
}
