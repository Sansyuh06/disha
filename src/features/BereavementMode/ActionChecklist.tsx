import React, { useState } from 'react';
import { generateBereavementPDF } from '../../utils/pdf';
import { useNavigate } from 'react-router-dom';

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

export default function ActionChecklist({ result }: { result: BereavementResult }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [legalOpen, setLegalOpen] = useState(false);
  const navigate = useNavigate();

  const toggleCheck = (key: string) =>
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Intro message */}
      <p className="text-center italic text-blue-700 text-base leading-relaxed px-4">
        {result.intro_message}
      </p>

      {/* Steps */}
      <div className="space-y-4">
        {result.steps.map(step => (
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

            {step.documents_needed.length > 0 && (
              <div className="mb-3 space-y-1.5">
                {step.documents_needed.map((doc, i) => (
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
