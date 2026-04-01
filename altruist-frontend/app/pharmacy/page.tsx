"use client";

import React from "react";
import PlaceholderPage from "@/components/shared/PlaceholderPage";
import { Package } from "lucide-react";

export default function PharmacyPage() {
  return (
    <PlaceholderPage 
      title="Pharmacy" 
      description="Stock up on healthcare essentials, vitamins, and medical supplies from our trusted partner pharmacies."
      icon={Package}
    />
  );
}
