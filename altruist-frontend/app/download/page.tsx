"use client";

import React from "react";
import PlaceholderPage from "@/components/shared/PlaceholderPage";
import { Smartphone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function DownloadPage() {
  const { t } = useLanguage();
  return (
    <PlaceholderPage 
      title={t('download.title')} 
      description={t('download.desc')}
      icon={Smartphone}
    />
  );
}
