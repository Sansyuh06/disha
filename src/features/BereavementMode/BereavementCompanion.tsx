import React, { useState } from 'react';
import IntakeWizard from './IntakeWizard';
import ActionChecklist from './ActionChecklist';
import { askOllamaJSON } from '../../utils/ollama';

export interface BereavementAnswers {
  relationship: string;
  accountTypes: string[];
  state: string;
  hasDC: string;
  hasNominee: string;
  balanceRange: string;
  hasWill: string;
}

interface BereavementResult {
  intro_message: string;
  steps: Array<{
    step_number: number;
    title: string;
    description: string;
    documents_needed: string[];
    counter: string;
    time_estimate: string;
    important_note: string;
  }>;
  legal_summary: string;
  timeline_total: string;
  helpline: string;
  closing_message: string;
}

type Phase = 'intro' | 'wizard' | 'loading' | 'results';

const EMERGENCY_CONTACTS = [
  { label: 'Union Bank Bereavement', number: '1800 22 2244', icon: '📞', note: 'Toll-free, 8am–8pm' },
  { label: 'Death Certificate Portal', number: 'crsorgi.gov.in', icon: '🌐', note: 'Govt. portal for DC' },
  { label: 'District Collector Office', number: '011-23381363', icon: '🏛️', note: 'Succession certificate' },
  { label: 'Legal Aid Helpline', number: '15100', icon: '⚖️', note: 'Free legal advice' },
];

export default function BereavementCompanion() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [result, setResult] = useState<BereavementResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<BereavementAnswers | null>(null);

  const handleWizardComplete = async (ans: BereavementAnswers) => {
    setPhase('loading');
    setError(null);
    setAnswers(ans);
    try {
      const balanceContext = ans.balanceRange === 'Under ₹1 Lakh'
        ? 'Since the balance is under ₹1 Lakh, a simplified claim process (letter of indemnity + surety bond) applies — no succession certificate needed.'
        : ans.balanceRange === 'Above ₹5 Lakhs'
        ? 'Since the balance exceeds ₹5 Lakhs, a succession certificate or probate from the court is typically required.'
        : 'For balances between ₹1–5 Lakhs, the bank may require an indemnity bond with sureties.';

      const willContext = ans.hasWill === 'Yes, there is a registered will'
        ? 'A registered will exists, so probate proceedings may expedite the claim.'
        : ans.hasWill === 'No will exists'
        ? 'No will exists, so intestate succession laws of the state apply.'
        : '';

      const data = await askOllamaJSON<BereavementResult>(
        `You are an expert Indian banking advisor helping a bereaved family member.

A ${ans.relationship} needs compassionate guidance to access a deceased person's bank accounts in ${ans.state}, India.

CONTEXT:
- Account types: ${ans.accountTypes.join(', ')}
- Death certificate status: ${ans.hasDC}
- Nominee status: ${ans.hasNominee}
- ${balanceContext}
- ${willContext}

Generate a detailed, compassionate, step-by-step guide. Be warm and clear. Use plain English explanations for legal terms.

Return ONLY this JSON (4-6 steps):
{
  "intro_message": "One warm, empathetic sentence acknowledging their loss",
  "steps": [
    {
      "step_number": 1,
      "title": "Step title",
      "description": "Clear 2-3 sentence explanation",
      "documents_needed": ["Document — with specific details like 'Original + 2 photocopies'"],
      "counter": "Counter name at bank",
      "time_estimate": "estimated time",
      "important_note": "Helpful tip"
    }
  ],
  "legal_summary": "2-3 sentences on legal entitlements for this relationship under Indian succession law",
  "timeline_total": "Realistic total timeline",
  "helpline": "Union Bank Bereavement Helpline: 1800 22 2244 (toll-free, 8am-8pm)",
  "closing_message": "One gentle closing sentence"
}`,
        { timeout: 45000 }
      );
      setResult(data);
      setPhase('results');
    } catch (err) {
      setError((err as Error).message);
      setPhase('wizard');
    }
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto" style={{ backgroundColor: phase === 'results' ? 'transparent' : '#EFF6FF' }}>
      {phase === 'intro' && (
        <IntroScreen onStart={() => setPhase('wizard')} />
      )}
      {(phase === 'wizard' || (phase === 'loading' && !result)) && (
        <>
          {error && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700" role="alert" aria-live="assertive">
              Could not reach AI assistant. Make sure Ollama is running.
              <button onClick={() => setPhase('wizard')} className="ml-2 underline" aria-label="Retry connecting to AI">Try Again</button>
            </div>
          )}
          <div aria-live="polite">
            <IntakeWizard onComplete={handleWizardComplete} loading={phase === 'loading'} />
          </div>
        </>
      )}
      {phase === 'results' && result && (
        <ActionChecklist result={result} answers={answers} />
      )}
    </div>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]" role="region" aria-label="Bereavement Intro">
      {/* Breathing animation */}
      <div className="relative w-40 h-40 flex items-center justify-center mb-10">
        {[80, 108, 136].map((size, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              backgroundColor: '#BFDBFE',
              animation: `breathe 4s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
        <div className="relative z-10 text-5xl">🤍</div>
      </div>

      <div className="bg-white rounded-2xl border border-blue-100 p-8 text-center max-w-sm shadow-sm mb-6">
        <h2 ref={headingRef} tabIndex={-1} className="font-heading text-xl font-semibold text-blue-900 mb-3 focus:outline-none">We are sorry for your loss.</h2>
        <p className="text-blue-700 text-sm leading-relaxed mb-2">
          We are here to help you navigate this gently, at your own pace.
        </p>
        <p className="text-blue-600 text-sm mb-6">Take as much time as you need.</p>
        <button
          onClick={onStart}
          aria-label="Start the guided bereavement assistance wizard"
          className="w-full py-3 rounded-xl border-2 font-medium text-sm transition-all hover:bg-blue-50"
          style={{ borderColor: '#93C5FD', color: '#1D4ED8' }}
        >
          I'm ready to begin
        </button>
      </div>

      {/* Emergency Contacts */}
      <div className="w-full max-w-sm">
        <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3 text-center">Emergency Contacts</h4>
        <div className="grid grid-cols-2 gap-2">
          {EMERGENCY_CONTACTS.map(c => (
            <a
              key={c.label}
              href={c.number.includes('.') ? `https://${c.number}` : `tel:${c.number.replace(/\s/g, '')}`}
              target={c.number.includes('.') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="bg-white border border-blue-100 rounded-xl p-3 text-center hover:shadow-md transition-all hover:border-blue-300 block"
            >
              <div className="text-xl mb-1">{c.icon}</div>
              <p className="text-xs font-semibold text-blue-800 leading-tight">{c.label}</p>
              <p className="text-[10px] text-blue-500 mt-0.5">{c.note}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
