import React, { createContext, useContext, useEffect, useState } from 'react';
import { LANGUAGES, Language, COUNTRY_TO_LANGUAGE, getLanguageByCode } from '../utils/languages';

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    welcome: 'Welcome to DISHA',
    subtitle: 'Choose your role to get started',
    customer: 'I am a Customer',
    staff: 'I am Bank Staff',
    call: 'Demo Telecom IVR Bot',
    nav_journey: 'Journey',
    nav_scan: 'Scanning',
    nav_loans: 'Loans',
    nav_voice: 'Voice',
    nav_coach: 'Salary',
  },
  hi: {
    welcome: 'दिशा में आपका स्वागत है',
    subtitle: 'शुरू करने के लिए अपनी भूमिका चुनें',
    customer: 'मैं एक ग्राहक हूँ',
    staff: 'मैं बैंक कर्मचारी हूँ',
    call: 'टेलीकॉम IVR बॉट का डेमो',
    nav_journey: 'यात्रा',
    nav_scan: 'स्कैन',
    nav_loans: 'लोन',
    nav_voice: 'आवाज़',
    nav_coach: 'वेतन',
  },
  kn: {
    welcome: 'ದಿಶಾಗೆ ಸುಸ್ವಾಗತ',
    subtitle: 'ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    customer: 'ನಾನು ಗ್ರಾಹಕ',
    staff: 'ನಾನು ಬ್ಯಾಂಕ್ ಸಿಬ್ಬಂದಿ',
    call: 'ಟೆಲಿಕಾಂ IVR ಬಾಟ್ ಡೆಮೊ',
    nav_journey: 'ಪ್ರಯಾಣ',
    nav_scan: 'ಸ್ಕ್ಯಾನ್',
    nav_loans: 'ಸಾಲಗಳು',
    nav_voice: 'ಧ್ವನಿ',
    nav_coach: 'ವೇತನ',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
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

  const t = (key: string) => {
    return TRANSLATIONS[language.code]?.[key] || TRANSLATIONS['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
