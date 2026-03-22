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

export default function BereavementCompanion() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [result, setResult] = useState<BereavementResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleWizardComplete = async (answers: BereavementAnswers) => {
    setPhase('loading');
    setError(null);
    try {
      const data = await askOllamaJSON<BereavementResult>(
        `A ${answers.relationship} needs compassionate guidance to access a deceased person's ${answers.accountTypes.join(', ')} in ${answers.state}, India. Death certificate: ${answers.hasDC}. Nominee: ${answers.hasNominee}.
Create a practical, step-by-step guide. Be warm, clear, and never use legal jargon without plain English explanation. Return ONLY this JSON:
{
  "intro_message": "Warm 1-sentence acknowledgment",
  "steps": [{"step_number":1,"title":"Gather Your Documents","description":"Clear 2-3 sentences explaining this step","documents_needed":["Death Certificate — original + 2 self-attested photocopies","Your Aadhaar Card"],"counter":"Counter 2 — Documentation","time_estimate":"20-30 minutes","important_note":"Staff are trained to handle this sensitively."}],
  "legal_summary": "2 sentences on this relationship legal entitlements",
  "timeline_total": "Typically 2-4 weeks for complete resolution",
  "helpline": "Union Bank Bereavement Support: 1800 22 2244 (toll-free, 8am-8pm)",
  "closing_message": "One gentle closing sentence"
}`,
        { timeout: 35000 }
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
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
              Could not reach AI assistant. Make sure Ollama is running.
              <button onClick={() => setPhase('wizard')} className="ml-2 underline">Try Again</button>
            </div>
          )}
          <IntakeWizard onComplete={handleWizardComplete} loading={phase === 'loading'} />
        </>
      )}
      {phase === 'results' && result && (
        <ActionChecklist result={result} />
      )}
    </div>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
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

      <div className="bg-white rounded-2xl border border-blue-100 p-8 text-center max-w-sm shadow-sm">
        <h2 className="font-heading text-xl font-semibold text-blue-900 mb-3">We are sorry for your loss.</h2>
        <p className="text-blue-700 text-sm leading-relaxed mb-2">
          We are here to help you navigate this gently, at your own pace.
        </p>
        <p className="text-blue-600 text-sm mb-6">Take as much time as you need.</p>
        <button
          onClick={onStart}
          className="w-full py-3 rounded-xl border-2 font-medium text-sm transition-all hover:bg-blue-50"
          style={{ borderColor: '#93C5FD', color: '#1D4ED8' }}
        >
          I'm ready to begin
        </button>
      </div>
    </div>
  );
}
