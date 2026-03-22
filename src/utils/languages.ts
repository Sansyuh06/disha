export interface Language {
  code: string;
  name: string;
  flag: string;
  native: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English',    flag: '🇬🇧', native: 'English'    },
  { code: 'hi', name: 'Hindi',      flag: '🇮🇳', native: 'हिंदी'       },
  { code: 'ta', name: 'Tamil',      flag: '🇮🇳', native: 'தமிழ்'       },
  { code: 'te', name: 'Telugu',     flag: '🇮🇳', native: 'తెలుగు'      },
  { code: 'bn', name: 'Bengali',    flag: '🇮🇳', native: 'বাংলা'       },
  { code: 'mr', name: 'Marathi',    flag: '🇮🇳', native: 'मराठी'       },
  { code: 'gu', name: 'Gujarati',   flag: '🇮🇳', native: 'ગુજરાતી'     },
  { code: 'kn', name: 'Kannada',    flag: '🇮🇳', native: 'ಕನ್ನಡ'       },
  { code: 'ml', name: 'Malayalam',  flag: '🇮🇳', native: 'മലയാളം'      },
  { code: 'pa', name: 'Punjabi',    flag: '🇮🇳', native: 'ਪੰਜਾਬੀ'      },
  { code: 'es', name: 'Spanish',    flag: '🇪🇸', native: 'Español'     },
  { code: 'ar', name: 'Arabic',     flag: '🇸🇦', native: 'العربية'     },
  { code: 'fr', name: 'French',     flag: '🇫🇷', native: 'Français'    },
  { code: 'de', name: 'German',     flag: '🇩🇪', native: 'Deutsch'     },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷', native: 'Português'   },
];

// Map country codes from ipapi.co to language codes
export const COUNTRY_TO_LANGUAGE: Record<string, string> = {
  IN: 'hi',
  GB: 'en',
  US: 'en',
  ES: 'es',
  SA: 'ar',
  AE: 'ar',
  FR: 'fr',
  DE: 'de',
  BR: 'pt',
  PT: 'pt',
  BD: 'bn',
  PK: 'pa',
};

export function getLanguageByCode(code: string): Language {
  return LANGUAGES.find(l => l.code === code) ?? LANGUAGES[0];
}
