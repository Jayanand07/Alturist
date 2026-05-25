"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "@/lib/translations";

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always initialize as 'en' on the server to avoid hydration mismatch
  const [language, setLanguageState] = useState<Language>("en");

  // Read language setting on client-side mount
  useEffect(() => {
    const storedLang = localStorage.getItem("language") as Language;
    if (storedLang && (storedLang in translations)) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  // Resilient translation key lookup with automatic English fallback
  const t = (key: string): string => {
    // Check in active language
    const val = (translations[language] as any)[key];
    if (typeof val === "string" && val.trim() !== "") {
      return val;
    }

    // Fall back to English
    const fallbackVal = (translations["en"] as any)[key];
    if (typeof fallbackVal === "string" && fallbackVal.trim() !== "") {
      return fallbackVal;
    }

    // If completely missing, return the key itself to prevent blank text
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
