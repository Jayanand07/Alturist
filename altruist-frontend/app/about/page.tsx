"use client";

import React from "react";
import PlaceholderPage from "@/components/shared/PlaceholderPage";
import { HeartPulse } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { t } = useLanguage();
  return (
    <PlaceholderPage 
      title={t('about.title')} 
      description={t('about.desc')}
      icon={HeartPulse}
    />
  );
}
