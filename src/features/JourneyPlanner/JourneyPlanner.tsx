import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCustomer } from '../../contexts/CustomerContext';
import { askOllamaJSON } from '../../utils/ollama';
import PresetChips from './PresetChips';
import JourneyStep from './JourneyStep';
import JourneySlip from './JourneySlip';
import { motion, AnimatePresence } from 'framer-motion';

interface JourneyStepData {
  step: number;
  counter: string;
  service: string;
  purpose: string;
  wait_minutes: number;
  documents: string[];
  tip: string;
}

interface JourneyResult {
  task_summary: string;
  total_minutes: number;
  journey: JourneyStepData[];
}

export default function JourneyPlanner() {
  const { language } = useLanguage();
  const { dispatch } = useCustomer();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JourneyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [micState, setMicState] = useState<'idle' | 'listening' | 'processing'>('idle');

  const handleSubmit = async (text?: string) => {
    const query = text ?? input;
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCompletedSteps(new Set());

    try {
      const data = await askOllamaJSON<JourneyResult>(
        `You are a Union Bank of India branch routing assistant. A customer says: '${query}'. Generate their counter-by-counter branch journey. Return ONLY valid JSON with this exact structure, nothing else:
{
  "task_summary": "2-word task name",
  "total_minutes": 35,
  "journey": [
    {
      "step": 1,
      "counter": "Token Desk",
      "service": "Get Queue Token",
      "purpose": "Receive your priority token for account services",
      "wait_minutes": 3,
      "documents": ["Any valid ID"],
      "tip": "Request senior citizen priority if applicable"
    }
  ]
}
Generate 3-5 steps appropriate for the task. Use realistic Union Bank counter names. Be specific. Return only the JSON object.`,
        { timeout: 35000 }
      );

      setResult(data);
      dispatch({
        type: 'SET_JOURNEY',
        journey: { ...data, journey: data.journey.map(s => ({ ...s, completed: false })) },
      });
    } catch (err) {
      setError((err as Error).message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleMic = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setError('Speech recognition not supported in this browser. Please use Chrome.');
      return;
    }
    const recognition = new SpeechRec();
    recognition.lang = language.code;
    recognition.continuous = false;
    recognition.interimResults = false;

    setMicState('listening');

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript as string;
      setInput(transcript);
      setMicState('processing');
      setTimeout(() => {
        setMicState('idle');
        handleSubmit(transcript);
      }, 300);
    };

    recognition.onerror = (e: any) => {
      setMicState('idle');
      if (e.error === 'no-speech') setError('No speech detected. Please try again.');
      else if (e.error === 'not-allowed') setError('Microphone access denied. Please allow microphone and retry.');
      else setError(`Microphone error: ${e.error}`);
    };

    recognition.onend = () => {
      if (micState === 'listening') setMicState('idle');
    };

    recognition.start();
  };

  const completion = result
    ? Math.round((completedSteps.size / result.journey.length) * 100)
    : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-brand-dark mb-1">Plan Your Branch Visit</h1>
        <p className="text-brand-muted text-sm">Tell us what you need and we'll map your route</p>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6">
        <textarea
          className="w-full border border-gray-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-brand-teal transition-colors"
          placeholder="What brings you to the bank today? (e.g. I want to open a savings account and get a home loan quote)"
          rows={3}
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ '--tw-border-opacity': '1' } as React.CSSProperties}
          onFocus={e => (e.target.style.borderColor = 'var(--brand-teal)')}
          onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
        />

        <div className="flex items-center gap-3 mt-3">
          {/* Mic button */}
          <button
            onClick={handleMic}
            className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              micState === 'idle' ? 'bg-white hover:bg-teal-50' : micState === 'listening' ? 'bg-teal-50' : 'bg-blue-50'
            }`}
            style={{ borderColor: micState === 'listening' ? '#16A34A' : 'var(--brand-teal)' }}
            title="Click to speak"
          >
            {micState === 'listening' && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-75" />
              </>
            )}
            {micState === 'processing' ? (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" style={{ color: micState === 'listening' ? '#16A34A' : 'var(--brand-teal)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => handleSubmit()}
            disabled={loading || !input.trim()}
            className="flex-1 h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: 'var(--brand-teal)' }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Planning your visit...
              </>
            ) : (
              <>
                Plan My Visit
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>

        <PresetChips onSelect={(text) => { setInput(text); handleSubmit(text); }} />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-red-500 text-xl">⚠️</span>
          <div className="flex-1">
            <p className="text-red-800 text-sm font-medium">Could not reach AI assistant</p>
            <p className="text-red-600 text-xs mt-1">{error}</p>
            <p className="text-red-500 text-xs mt-1">Make sure Ollama is running: <code className="bg-red-100 px-1 rounded">ollama serve</code></p>
          </div>
          <button
            onClick={() => { setError(null); handleSubmit(); }}
            className="text-xs text-red-600 border border-red-200 rounded px-2 py-1 hover:bg-red-100 transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Skeleton loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="skeleton h-5 w-1/3 rounded mb-3" style={{ animationDelay: `${i * 0.1}s` }} />
              <div className="skeleton h-4 w-2/3 rounded mb-2" />
              <div className="skeleton h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Summary card */}
            <div className="bg-white rounded-2xl border-l-4 p-5 mb-5 shadow-sm" style={{ borderLeftColor: 'var(--brand-teal)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-heading font-semibold text-brand-dark">{result.task_summary}</p>
                  <p className="text-sm text-brand-muted mt-0.5">Estimated total: ~{result.total_minutes} minutes</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-brand-muted mb-1">Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${completion}%`, backgroundColor: 'var(--brand-teal)' }}
                      />
                    </div>
                    <span className="text-xs font-medium text-brand-dark">{completion}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100" />
              <div className="space-y-4">
                {result.journey.map((step, idx) => (
                  <JourneyStep
                    key={step.step}
                    step={step}
                    isLast={idx === result.journey.length - 1}
                    completed={completedSteps.has(step.step)}
                    onMarkDone={() => setCompletedSteps(prev => new Set([...prev, step.step]))}
                  />
                ))}
              </div>
            </div>

            {/* Print slip */}
            <div className="mt-6">
              <JourneySlip journey={result} />
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
