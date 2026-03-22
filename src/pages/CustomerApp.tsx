import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import AccessibilityToggle from '../components/AccessibilityToggle';
import OllamaStatus from '../components/OllamaStatus';
import DishaLogo from '../components/DishaLogo';
import { LANGUAGES } from '../utils/languages';
import { useCustomer } from '../contexts/CustomerContext';

const NAV_ITEMS = [
  {
    to: '/customer/journey',
    label: 'Plan My Visit',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    to: '/customer/scan',
    label: 'Scan Documents',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: '/customer/loan',
    label: 'Loan Advisor',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    to: '/customer/voice',
    label: 'Voice Assistant',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    to: '/customer/salary',
    label: 'Financial Coach',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: '/customer/bereavement',
    label: 'Bereavement Help',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    to: '/customer/previsit',
    label: 'Pre-Visit Planner',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    to: '/customer/transaction',
    label: 'Transaction Forms',
    icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function CustomerApp() {
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { dispatch: customerDispatch } = useCustomer();
  const navigate = useNavigate();
  const [now, setNow] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Dark Navy Sidebar ──────────────────────── */}
      <aside
        className="flex flex-col shrink-0 z-30"
        style={{
          width: '230px',
          background: 'linear-gradient(180deg, #0D1B3E 0%, #122248 100%)',
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <DishaLogo variant="light" size={34} />
          <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Customer Portal</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `bank-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-xs transition-colors w-full"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </button>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0" style={{ background: 'var(--surface)' }}>
        {/* Header */}
        <header
          className="bg-white px-6 py-3 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow-xs)' }}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--green)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Session active</span>
            </div>
            <div className="h-4 w-px" style={{ background: 'var(--border)' }} />
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--navy-900)' }}>
              <span>{now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              <span style={{ color: 'var(--border-2)' }}>·</span>
              <span>{now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                customerDispatch({ type: 'CLEAR_SESSION' } as any);
                navigate('/');
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
            >
              End Session
            </button>
            <button
              onClick={() => setLangSheetOpen(true)}
              className="flex items-center gap-2 text-sm border rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <span style={{ fontSize: '16px' }}>{language.flag}</span>
              <span className="font-medium text-sm">{language.native}</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <OllamaStatus />
            <AccessibilityToggle />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* ── Language Sheet ─────────────────────────── */}
      {langSheetOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 animate-fade-in" onClick={() => setLangSheetOpen(false)} />
          <div className="relative bg-white w-80 h-full shadow-2xl flex flex-col animate-slide-right">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="font-heading font-semibold text-base" style={{ color: 'var(--navy-900)' }}>Select Language</h3>
              <button
                onClick={() => setLangSheetOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map(lang => {
                  const isActive = language.code === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang); setLangSheetOpen(false); }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm border transition-all text-left"
                      style={{
                        borderColor: isActive ? 'var(--navy-800)' : 'var(--border)',
                        background: isActive ? 'var(--navy-50)' : 'white',
                        color: isActive ? 'var(--navy-800)' : 'var(--text-primary)',
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>{lang.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs leading-tight">{lang.native}</p>
                        <p className="text-xs leading-tight" style={{ color: 'var(--text-muted)' }}>{lang.name}</p>
                      </div>
                      {isActive && (
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--teal)" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
