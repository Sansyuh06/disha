import React, { useState } from 'react';

interface JourneyStepData {
  step: number;
  counter: string;
  service: string;
  purpose: string;
  wait_minutes: number;
  documents: string[];
  tip: string;
}

interface Props {
  step: JourneyStepData;
  isLast: boolean;
  completed: boolean;
  onMarkDone: () => void;
}

export default function JourneyStep({ step, isLast, completed, onMarkDone }: Props) {
  const [docsOpen, setDocsOpen] = useState(false);

  return (
    <div className="relative pl-14">
      {/* Step circle */}
      <div
        className="absolute left-0 top-0 w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold font-heading transition-all"
        style={{
          backgroundColor: completed ? '#16A34A' : 'white',
          borderColor: completed ? '#16A34A' : 'var(--brand-teal)',
          color: completed ? 'white' : 'var(--brand-teal)',
        }}
      >
        {completed ? '✓' : step.step}
      </div>

      {/* Connector line */}
      {!isLast && (
        <div className="absolute left-6 top-12 w-0.5 h-4 bg-gray-200" />
      )}

      {/* Card */}
      <div
        className="bg-white rounded-2xl border p-5 shadow-sm transition-all"
        style={{
          borderColor: completed ? '#BBF7D0' : '#E2E8F0',
          opacity: completed ? 0.75 : 1,
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`font-heading font-semibold text-brand-dark ${completed ? 'line-through text-brand-muted' : ''}`}>
                {step.counter}
              </h4>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--brand-coral-light)', color: 'var(--brand-coral)' }}>
                ~{step.wait_minutes} min
              </span>
            </div>
            <p className="text-sm text-brand-muted mt-0.5">{step.service}</p>
          </div>
          {!completed && (
            <button
              onClick={onMarkDone}
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors hover:bg-teal-50 shrink-0"
              style={{ borderColor: 'var(--brand-teal)', color: 'var(--brand-teal)' }}
            >
              Mark Done ✓
            </button>
          )}
        </div>

        <p className="text-sm text-brand-dark mb-3">{step.purpose}</p>

        {/* Documents accordion */}
        {step.documents.length > 0 && (
          <div className="border border-gray-100 rounded-xl overflow-hidden mb-3">
            <button
              onClick={() => setDocsOpen(!docsOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span>Documents needed ({step.documents.length})</span>
              <span className="text-brand-muted">{docsOpen ? '▲' : '▼'}</span>
            </button>
            {docsOpen && (
              <div className="px-4 py-3 space-y-2">
                {step.documents.map((doc, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-brand-dark">{doc}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tip */}
        {step.tip && (
          <p className="text-xs italic flex items-start gap-2" style={{ color: 'var(--brand-teal)' }}>
            <span>💡</span>
            <span>{step.tip}</span>
          </p>
        )}
      </div>
    </div>
  );
}
