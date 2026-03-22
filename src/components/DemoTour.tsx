import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  id: number;
  emoji: string;
  title: string;
  body: string;
  nav?: string;
  highlight?: string;
  persona?: string;
}

const STEPS: TourStep[] = [
  {
    id: 0,
    emoji: '👩‍💼',
    title: 'Meet Kamala',
    body: 'Kamala Venkataraman recently lost her husband. She needs to claim his Fixed Deposit and has never visited a bank alone. Let\'s see how DISHA helps her today.',
    persona: 'Bereavement Customer · Tamil language · Accessibility mode ON',
  },
  {
    id: 1,
    emoji: '🗺️',
    title: 'Step 1: Journey Planner',
    body: 'Kamala speaks and DISHA maps her route. Three counters, 45 minutes. She knows exactly where to go — no anxiety, no confusion.',
    nav: '/customer/journey',
    highlight: 'Try: type "I need to claim my husband\'s fixed deposit"',
  },
  {
    id: 2,
    emoji: '📷',
    title: 'Step 2: Document Scanner',
    body: 'DISHA\'s camera scans her Aadhaar and fills in her name, address, and ID. Zero typing needed.',
    nav: '/customer/scan',
    highlight: 'Upload any ID card image to see OCR in action',
  },
  {
    id: 3,
    emoji: '🤍',
    title: 'Step 3: Bereavement Companion',
    body: 'Five gentle questions. DISHA produces a compassionate step-by-step checklist of every document and counter, tailored to her exact situation.',
    nav: '/customer/bereavement',
    highlight: 'Select: Spouse → Fixed Deposit → Tamil Nadu',
  },
  {
    id: 4,
    emoji: '🏦',
    title: 'Step 4: Banker Dashboard',
    body: 'Banker Priya sees Kamala\'s token A043 arrive. The AI suggests a warm Tamil greeting. One click marks the step complete.',
    nav: '/banker',
    highlight: 'Click token A043 — Kamala Venkataraman',
  },
  {
    id: 5,
    emoji: '🎉',
    title: 'Tour Complete!',
    body: 'DISHA turned a stressful, confusing day into a guided 45-minute journey. Every feature works offline, in 15 languages, with full accessibility support.',
  },
];

export default function DemoTour() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const isOpen = searchParams.has('demo');

  const close = () => {
    const p = new URLSearchParams(searchParams);
    p.delete('demo');
    setSearchParams(p);
  };

  const current = STEPS[step] ?? STEPS[0];

  const handleNext = () => {
    if (step >= STEPS.length - 1) { close(); return; }
    const nextStep = STEPS[step + 1];
    setStep(s => s + 1);
    if (nextStep.nav) navigate(nextStep.nav + `?demo=true`);
  };

  const handleBack = () => {
    if (step === 0) return;
    setStep(s => s - 1);
  };

  useEffect(() => {
    if (!isOpen) setStep(0);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-60 pointer-events-none">
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={close} />

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full mx-4 pointer-events-auto"
        >
          {/* Step dots */}
          <div className="flex justify-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: i === step ? 20 : 6,
                  height: 6,
                  backgroundColor: i <= step ? 'var(--brand-teal)' : '#E2E8F0',
                }}
              />
            ))}
          </div>

          {/* Cover emoji */}
          <div className="text-center text-5xl mb-3">{current.emoji}</div>

          {/* Title */}
          <h3 className="font-heading font-bold text-xl text-brand-dark text-center mb-2">
            {current.title}
          </h3>

          {/* Persona badge */}
          {current.persona && (
            <div
              className="text-center text-xs mb-3 px-3 py-1.5 rounded-full inline-block mx-auto"
              style={{ backgroundColor: 'var(--brand-teal-light)', color: 'var(--brand-teal)' }}
            >
              {current.persona}
            </div>
          )}

          <p className="text-sm text-brand-muted text-center leading-relaxed mb-4">{current.body}</p>

          {current.highlight && (
            <div
              className="rounded-xl px-4 py-3 text-xs text-center mb-4"
              style={{ backgroundColor: 'var(--brand-teal-light)', color: 'var(--brand-teal)' }}
            >
              💡 {current.highlight}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-2">
            <button
              onClick={close}
              className="px-3 py-2.5 text-xs text-brand-muted hover:text-brand-dark"
            >
              Skip tour
            </button>
            {step > 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold"
              style={{ backgroundColor: 'var(--brand-teal)' }}
            >
              {step >= STEPS.length - 1 ? '🎉 Finish' : 'Next →'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
