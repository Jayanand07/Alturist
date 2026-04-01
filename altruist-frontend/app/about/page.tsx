"use client";

import React from "react";
import PlaceholderPage from "@/components/shared/PlaceholderPage";
import { HeartPulse } from "lucide-react";

export default function AboutPage() {
  return (
    <PlaceholderPage 
      title="About Us" 
      description="Learn more about Altruist's mission to make healthcare accessible and affordable for everyone."
      icon={HeartPulse}
    />
  );
}
