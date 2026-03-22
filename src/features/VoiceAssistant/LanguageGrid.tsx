import React from 'react';
import { LANGUAGES, Language } from '../../utils/languages';

interface Props {
  selected: Language;
  onSelect: (lang: Language) => void;
}

export default function LanguageGrid({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => onSelect(lang)}
          className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all hover:scale-105"
          style={{
            border: `2px solid ${selected.code === lang.code ? 'var(--teal)' : '#E2E8F0'}`,
            backgroundColor: selected.code === lang.code ? 'var(--teal-light)' : 'white',
            minHeight: 64,
          }}
        >
          <span className="text-2xl leading-none">{lang.flag}</span>
          <span
            className="text-[10px] font-medium leading-tight text-center"
            style={{ color: selected.code === lang.code ? 'var(--teal)' : 'var(--text-muted)' }}
          >
            {lang.native}
          </span>
        </button>
      ))}
    </div>
  );
}
