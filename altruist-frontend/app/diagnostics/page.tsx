"use client";

import React from "react";
import PlaceholderPage from "@/components/shared/PlaceholderPage";
import { Activity } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function DiagnosticsPage() {
  const { t } = useLanguage();
  return (
    <PlaceholderPage 
      title={t('diagnostics.title')} 
      description={t('diagnostics.desc')}
      icon={Activity}
    />
  );
}
