"use client";

import React from "react";
import PlaceholderPage from "@/components/shared/PlaceholderPage";
import { FlaskConical } from "lucide-react";

export default function LabsPage() {
  return (
    <PlaceholderPage 
      title="Lab Tests" 
      description="Book from over 1000+ certified lab tests from the comfort of your home. Fast, accurate, and reliable results."
      icon={FlaskConical}
    />
  );
}
