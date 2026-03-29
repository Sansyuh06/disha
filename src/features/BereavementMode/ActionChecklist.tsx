import React, { useState } from 'react';
import { generateBereavementPDF } from '../../utils/pdf';
import { useNavigate } from 'react-router-dom';
import { BereavementAnswers } from './BereavementCompanion';

interface Step {
  step_number: number;
  title: string;
  description: string;
  documents_needed: string[];
  counter: string;
  time_estimate: string;
  important_note: string;
}

interface BereavementResult {
  intro_message: string;
  steps: Step[];
  legal_summary: string;
  timeline_total: string;
  helpline: string;
  closing_message: string;
}

const CLAIM_STAGES = [
  { label: 'Documents Gathered', icon: '📋' },
  { label: 'Submitted to Bank', icon: '🏦' },
  { label: 'Under Review', icon: '🔍' },
  { label: 'Approved', icon: '✅' },
  { label: 'Funds Released', icon: '💰' },
];

const NEAREST_BRANCH = {
  name: 'Union Bank of India — MG Road Branch',
  address: '42, MG Road, Near Metro Station, Bangalore 560001',
  hours: 'Mon–Fri: 10:00 AM – 4:00 PM | Sat: 10:00 AM – 1:00 PM',
  phone: '080-25588900',
  manager: 'Smt. Priya Sharma (Branch Manager)',
};

export default function ActionChecklist({ result, answers }: { result: BereavementResult; answers: BereavementAnswers | null }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [legalOpen, setLegalOpen] = useState(false);
  const [claimStage, setClaimStage] = useState(0);
  const navigate = useNavigate();

  const containerRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const toggleCheck = (key: string) =>
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div ref={containerRef} tabIndex={-1} className="space-y-5 animate-fade-in-up focus:outline-none" role="region" aria-label="Your Bereavement Action Plan">
      {/* Intro message */}
      <p className="text-center italic text-blue-700 text-base leading-relaxed px-4" aria-live="polite">
        {result.intro_message}
      </p>

      {/* Balance context banner */}
      {answers?.balanceRange && answers.balanceRange !== "I don't know" && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <p className="text-sm font-semibold text-blue-900">Balance Range: {answers.balanceRange}</p>
            <p className="text-xs text-blue-700 mt-0.5">
              {answers.balanceRange === 'Under ₹1 Lakh'
                ? 'A simplified claim process applies. No court-issued succession certificate is needed — your bank can process this with an indemnity bond.'
                : answers.balanceRange === 'Above ₹5 Lakhs'
                ? 'A succession certificate from the District Court is typically required. This takes 4-8 weeks. We\'ve included this step in your guide.'
                : 'The bank may require a letter of indemnity with two sureties. No court visit needed in most cases.'}
            </p>
          </div>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-4">
        {(result.steps || []).map(step => (
          <div
            key={step.step_number}
            className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-heading shrink-0"
                style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}
              >
                {step.step_number}
              </div>
              <h4 className="font-heading font-semibold text-blue-900">{step.title}</h4>
            </div>

            <p className="text-sm text-blue-800 leading-relaxed mb-3">{step.description}</p>

            {(step.documents_needed || []).length > 0 && (
              <div className="mb-3 space-y-1.5">
                {(step.documents_needed || []).map((doc, i) => (
                  <label key={i} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!checked[`${step.step_number}-${i}`]}
                      onChange={() => toggleCheck(`${step.step_number}-${i}`)}
                      className="mt-0.5 rounded"
                    />
                    <span className={`text-sm ${checked[`${step.step_number}-${i}`] ? 'line-through text-blue-400' : 'text-blue-700'}`}>
                      {doc}
                    </span>
                  </label>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ backgroundColor: '#DBEAFE', color: '#1E40AF' }}
              >
                📍 {step.counter}
              </span>
              <span className="text-xs text-blue-500 flex items-center gap-1">
                🕐 {step.time_estimate}
              </span>
            </div>

            {step.important_note && (
              <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-xs text-blue-700">ℹ️ {step.important_note}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Claim Status Tracker */}
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
        <h4 className="font-heading font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <span>📊</span> Track Your Claim Progress
        </h4>
        <div className="flex items-center justify-between mb-4">
          {CLAIM_STAGES.map((stage, i) => (
            <React.Fragment key={i}>
              <button
                onClick={() => setClaimStage(i)}
                className="flex flex-col items-center gap-1 transition-all"
                style={{ opacity: i <= claimStage ? 1 : 0.4 }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all"
                  style={{
                    backgroundColor: i <= claimStage ? '#DBEAFE' : '#F1F5F9',
                    border: i === claimStage ? '2px solid #3B82F6' : '2px solid transparent',
                  }}
                >
                  {i < claimStage ? '✓' : stage.icon}
                </div>
                <span className="text-[10px] text-center text-blue-700 font-medium max-w-[60px] leading-tight">
                  {stage.label}
                </span>
              </button>
              {i < CLAIM_STAGES.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-1 rounded-full transition-all"
                  style={{ backgroundColor: i < claimStage ? '#3B82F6' : '#E2E8F0' }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs text-blue-600 text-center">
          Tap each stage to update your progress. Currently: <strong>{CLAIM_STAGES[claimStage].label}</strong>
        </p>
      </div>

      {/* Nearest Branch */}
      <div className="bg-white rounded-2xl border border-blue-100 p-5 shadow-sm">
        <h4 className="font-heading font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <span>🏦</span> Nearest Branch
        </h4>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-blue-800">{NEAREST_BRANCH.name}</p>
          <p className="text-xs text-blue-700">{NEAREST_BRANCH.address}</p>
          <p className="text-xs text-blue-600">🕐 {NEAREST_BRANCH.hours}</p>
          <p className="text-xs text-blue-600">👩‍💼 {NEAREST_BRANCH.manager}</p>
          <a
            href={`tel:${NEAREST_BRANCH.phone}`}
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors mt-2"
          >
            📞 Call Branch: {NEAREST_BRANCH.phone}
          </a>
        </div>
      </div>

      {/* Accordion: Legal rights + Helpline */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        <button
          onClick={() => setLegalOpen(!legalOpen)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-blue-800"
        >
          <span>📜 Your legal rights</span>
          <span>{legalOpen ? '▲' : '▼'}</span>
        </button>
        {legalOpen && (
          <div className="px-5 pb-4 border-t border-blue-50">
            <p className="text-sm text-blue-700 leading-relaxed mt-3">{result.legal_summary}</p>
            <p className="text-xs text-blue-500 mt-2">⏱ {result.timeline_total}</p>
            <div className="mt-3 bg-blue-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-blue-800">📞 {result.helpline}</p>
            </div>
          </div>
        )}
      </div>

      {/* Closing message */}
      <p className="text-center italic text-blue-600 text-sm px-4">{result.closing_message}</p>

      {/* Actions */}
      <div className="flex gap-3 flex-col sm:flex-row sticky bottom-4 z-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-blue-50 mt-8">
        <a
          href="tel:18002222244"
          className="flex-1 py-3 rounded-xl text-sm font-semibold text-center transition-colors"
          style={{ backgroundColor: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}
        >
          📞 Call Helpline Now
        </a>
        <button
          onClick={() => generateBereavementPDF(result.steps, result.legal_summary, result.helpline)}
          className="flex-1 py-3 border-2 rounded-xl text-sm font-medium transition-colors hover:bg-blue-50"
          style={{ borderColor: '#93C5FD', color: '#1D4ED8', backgroundColor: 'white' }}
        >
          🖨️ Print This Guide
        </button>
        <button
          onClick={() => navigate('/customer/journey', { state: { prefillText: 'I need to process a bereavement claim — please guide me' } })}
          className="flex-1 py-3 rounded-xl text-white text-sm font-semibold shadow-sm"
          style={{ backgroundColor: '#3B82F6' }}
        >
          Plan My Branch Visit →
        </button>
      </div>
    </div>
  );
}
