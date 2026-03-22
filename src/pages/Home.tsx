import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGES } from '../utils/languages';
import OllamaStatus from '../components/OllamaStatus';
import AccessibilityToggle from '../components/AccessibilityToggle';
import DishaLogo from '../components/DishaLogo';
import { motion } from 'framer-motion';

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.08 } } },
  item: {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as any } },
  },
};

export default function Home() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const [hoveredLang, setHoveredLang] = useState<string | null>(null);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex min-h-screen">
      {/* ── LEFT PANEL — Dark Navy ──────────────────── */}
      <div
        className="hidden md:flex flex-col justify-between p-10"
        style={{
          width: '42%',
          background: 'linear-gradient(165deg, #0D1B3E 0%, #152855 50%, #0D1B3E 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
          }}
        />
        {/* Glow orb */}
        <div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(10,191,163,0.12) 0%, transparent 65%)',
            transform: 'translate(-30%, 30%)',
          }}
        />

        {/* Top: Logo + badges */}
        <div className="relative z-10">
          <DishaLogo variant="light" size={44} />

          <div className="flex flex-wrap gap-2 mt-6">
            <span className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: 'rgba(10,191,163,0.15)', color: '#0ABFA3', border: '1px solid rgba(10,191,163,0.25)' }}
            >
              PS7 — AI Self-Service
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              iDEA Hackathon 2.0
            </span>
          </div>
        </div>

        {/* Center: Greeting */}
        <div className="relative z-10">
          <h1
            className="font-heading text-4xl font-extrabold mb-3"
            style={{ color: '#FFFFFF', lineHeight: 1.15 }}
          >
            Direction.<br />
            <span style={{ color: '#0ABFA3' }}>Whenever you need it.</span>
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '320px', lineHeight: 1.7 }}>
            Union Bank of India's AI-powered self-service kiosk.
            100% offline. 15 languages. Accessible to everyone.
          </p>
        </div>

        {/* Bottom: Trust badges */}
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            {['SDG 1', 'SDG 3', 'SDG 10', 'SDG 16'].map(sdg => (
              <span key={sdg} className="px-2.5 py-1 rounded text-xs font-semibold"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {sdg}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <LockSVG />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              All data stays on this device. No cloud. No tracking.
            </span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — White ────────────────────── */}
      <div className="flex-1 flex flex-col bg-white relative">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            <span>{dateStr}</span>
            <span style={{ color: 'var(--border-2)' }}>·</span>
            <span>{timeStr}</span>
          </div>
          <div className="flex items-center gap-3">
            <OllamaStatus />
            <AccessibilityToggle />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-8 py-10">
          <motion.div
            className="w-full max-w-md"
            variants={stagger.container}
            initial="initial"
            animate="animate"
          >
            {/* Mobile logo (hidden on desktop where left panel is visible) */}
            <motion.div variants={stagger.item} className="md:hidden text-center mb-8">
              <div className="flex justify-center">
                <DishaLogo size={40} />
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Direction. Whenever You Need It.
              </p>
            </motion.div>

            {/* Welcome text */}
            <motion.div variants={stagger.item} className="mb-8">
              <h2 className="font-heading text-2xl font-bold mb-1" style={{ color: 'var(--navy-900)' }}>
                Welcome to DISHA
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Choose your role to get started
              </p>
            </motion.div>

            {/* Role buttons */}
            <motion.div variants={stagger.item} className="flex flex-col gap-3 mb-8">
              <button
                onClick={() => navigate('/customer')}
                className="btn btn-navy w-full group"
                style={{ height: '60px', fontSize: '15px', borderRadius: '14px' }}
              >
                <PersonSVG />
                I am a Customer
                <ArrowRightSVG />
              </button>
              <button
                onClick={() => navigate('/banker')}
                className="btn btn-outline w-full group"
                style={{ height: '60px', fontSize: '15px', borderRadius: '14px' }}
              >
                <BuildingSVG />
                I am Bank Staff
                <ArrowRightSVG />
              </button>
            </motion.div>

            {/* Language selector */}
            <motion.div variants={stagger.item}>
              <p className="text-xs font-semibold text-center uppercase tracking-widest mb-3"
                style={{ color: 'var(--text-muted)' }}
              >
                Choose your language
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {LANGUAGES.map(lang => {
                  const isActive = language.code === lang.code;
                  const isHover = hoveredLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang)}
                      onMouseEnter={() => setHoveredLang(lang.code)}
                      onMouseLeave={() => setHoveredLang(null)}
                      className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-center transition-all duration-150"
                      style={{
                        background: isActive ? 'var(--navy-900)' : isHover ? 'var(--navy-50)' : 'transparent',
                        border: `1.5px solid ${isActive ? 'var(--navy-900)' : isHover ? 'var(--border-2)' : 'var(--border)'}`,
                        color: isActive ? '#FFFFFF' : 'var(--text-primary)',
                        transform: isHover && !isActive ? 'translateY(-1px)' : 'none',
                      }}
                    >
                      <span style={{ fontSize: '16px', lineHeight: 1 }}>{lang.flag}</span>
                      <span style={{ fontSize: '9px', fontWeight: 600, lineHeight: 1.2 }} className="truncate w-full">
                        {lang.native}
                      </span>
                      {isActive && (
                        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#0ABFA3" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Demo tour */}
            <motion.div variants={stagger.item} className="text-center mt-6">
              <button
                onClick={() => navigate('/?demo=true')}
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg border transition-all hover:shadow-sm"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--navy-800)',
                  background: 'var(--navy-50)',
                }}
              >
                <StarSVG />
                Start Demo Tour — Meet Kamala
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="px-8 py-3 text-center" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Union Bank of India · Digital Intelligent Self-service Hub for All
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Inline SVGs ─────────────────────────────────── */

function PersonSVG() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function BuildingSVG() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function ArrowRightSVG() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="ml-auto opacity-40 group-hover:opacity-100 transition-opacity">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function StarSVG() {
  return (
    <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function LockSVG() {
  return (
    <svg width="14" height="14" fill="none" stroke="rgba(255,255,255,0.35)" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
