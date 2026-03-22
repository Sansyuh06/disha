import React, { createContext, useContext, useEffect, useState } from 'react';
import { LANGUAGES, Language, COUNTRY_TO_LANGUAGE, getLanguageByCode } from '../utils/languages';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('disha_language');
    if (saved) return JSON.parse(saved) as Language;
    return LANGUAGES[0]; // default English
  });

  useEffect(() => {
    // Auto-detect language from IP
    const detect = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
        const data = await res.json();
        const code = COUNTRY_TO_LANGUAGE[data.country_code as string] ?? 'en';
        const detected = getLanguageByCode(code);
        // Only auto-set if no saved preference
        if (!localStorage.getItem('disha_language')) {
          setLanguageState(detected);
        }
      } catch {
        // Silently fall back to English
      }
    };
    detect();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('disha_language', JSON.stringify(lang));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
