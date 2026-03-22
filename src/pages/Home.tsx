import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGES } from '../utils/languages';
import OllamaStatus from '../components/OllamaStatus';
import AccessibilityToggle from '../components/AccessibilityToggle';
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-teal-light rounded-full opacity-40 blur-3xl translate-x-1/3 -translate-y-1/3" style={{ backgroundColor: 'var(--brand-teal-light)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-purple-light rounded-full opacity-30 blur-3xl -translate-x-1/3 translate-y-1/3" style={{ backgroundColor: 'var(--brand-purple-light)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Logo + Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="animate-compass">
              <CompassRoseSVG />
            </div>
            <h1 className="font-heading text-5xl font-bold" style={{ color: 'var(--brand-teal)' }}>
              DISHA
            </h1>
          </div>
          <p className="text-brand-muted text-base font-body">Direction. Whenever You Need It.</p>
          <p className="text-xs text-gray-400 mt-1">Union Bank of India · Digital Self-service Hub</p>
        </motion.div>

        {/* Main Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/customer')}
            className="w-full h-16 rounded-2xl text-white font-heading font-semibold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, var(--brand-teal), #08A88F)' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            I am a Customer
          </button>

          <button
            onClick={() => navigate('/banker')}
            className="w-full h-16 rounded-2xl bg-white border-2 font-heading font-semibold text-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
            style={{ borderColor: 'var(--brand-dark)', color: 'var(--brand-dark)' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            I am Bank Staff
          </button>
        </motion.div>

        {/* Language Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <p className="text-xs text-brand-muted text-center mb-3 font-medium uppercase tracking-wide">Select your language</p>
          <div className="grid grid-cols-5 gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang)}
                className="flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-center transition-all hover:scale-105"
                style={{
                  backgroundColor: language.code === lang.code ? 'var(--brand-teal)' : 'var(--brand-teal-light)',
                  color: language.code === lang.code ? '#fff' : 'var(--brand-dark)',
                  border: `1.5px solid ${language.code === lang.code ? 'var(--brand-teal)' : 'transparent'}`,
                }}
              >
                <span className="text-lg leading-none">{lang.flag}</span>
                <span className="text-[10px] font-medium leading-none truncate w-full text-center">{lang.native}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Demo tour button */}
        {!searchParams.has('demo') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <button
              onClick={() => navigate('/?demo=true')}
              className="text-sm border rounded-xl px-4 py-2 font-medium transition-colors hover:bg-teal-50"
              style={{ borderColor: 'var(--brand-teal)', color: 'var(--brand-teal)' }}
            >
              ✨ Start Demo Tour — Meet Kamala
            </button>
          </motion.div>
        )}
      </div>

      {/* Bottom right controls */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 items-end z-20">
        <AccessibilityToggle />
        <OllamaStatus />
      </div>
    </div>
  );
}

function CompassRoseSVG() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" stroke="#0ABFA3" strokeWidth="2" fill="#E1F5EE" />
      <polygon points="24,4 28,24 24,20 20,24" fill="#0ABFA3" />
      <polygon points="24,44 28,24 24,28 20,24" fill="#0ABFA3" opacity="0.6" />
      <polygon points="4,24 24,20 20,24 24,28" fill="#0ABFA3" opacity="0.6" />
      <polygon points="44,24 24,20 28,24 24,28" fill="#0ABFA3" />
      <circle cx="24" cy="24" r="4" fill="#0ABFA3" />
      <circle cx="24" cy="24" r="2" fill="white" />
    </svg>
  );
}
