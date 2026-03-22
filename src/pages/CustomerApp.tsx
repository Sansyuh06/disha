import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import AccessibilityToggle from '../components/AccessibilityToggle';
import { LANGUAGES } from '../utils/languages';

const NAV_ITEMS = [
  { to: '/customer/journey', icon: '🗺️', label: 'Plan My Visit' },
  { to: '/customer/scan', icon: '📷', label: 'Scan Documents' },
  { to: '/customer/loan', icon: '📊', label: 'Loan Help' },
  { to: '/customer/voice', icon: '🎙️', label: 'Voice Assistant' },
  { to: '/customer/salary', icon: '💰', label: 'Financial Coach' },
  { to: '/customer/bereavement', icon: '🤍', label: 'Bereavement Help' },
];

export default function CustomerApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar */}
      <aside
        className={`flex flex-col bg-white border-r border-gray-100 transition-all duration-300 z-30 ${sidebarOpen ? 'w-60' : 'w-16'} md:w-60 shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--brand-teal)' }}>
            <span className="text-white text-sm font-bold font-heading">D</span>
          </div>
          <span className="font-heading font-bold text-brand-dark hidden md:block" style={{ color: 'var(--brand-teal)' }}>DISHA</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white'
                    : 'text-brand-muted hover:text-brand-dark hover:bg-gray-50'
                }`
              }
              style={({ isActive }) => isActive ? { backgroundColor: 'var(--brand-teal)' } : {}}
            >
              <span className="text-xl leading-none shrink-0">{item.icon}</span>
              <span className="hidden md:block truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Session info */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-brand-muted">Session: Active</span>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-brand-muted hover:text-brand-dark text-sm flex items-center gap-1"
            >
              ← Home
            </button>
          </div>
          <button
            onClick={() => setLangSheetOpen(true)}
            className="flex items-center gap-2 text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            <span>{language.flag}</span>
            <span className="text-brand-dark font-medium">{language.native}</span>
          </button>
          <AccessibilityToggle />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Language selector sheet */}
      {langSheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setLangSheetOpen(false)} />
          <div className="relative bg-white w-80 h-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-heading font-semibold">Select Language</h3>
              <button onClick={() => setLangSheetOpen(false)} className="text-brand-muted">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2 overflow-y-auto">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang); setLangSheetOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all"
                  style={{
                    borderColor: language.code === lang.code ? 'var(--brand-teal)' : 'var(--border)',
                    backgroundColor: language.code === lang.code ? 'var(--brand-teal-light)' : 'white',
                    color: language.code === lang.code ? 'var(--brand-teal)' : 'var(--brand-dark)',
                  }}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium">{lang.native}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
