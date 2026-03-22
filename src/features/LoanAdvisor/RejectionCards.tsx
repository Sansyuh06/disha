import React from 'react';

interface Reason {
  title: string;
  your_value: string;
  required: string;
  severity: 'high' | 'medium' | 'low';
  plain_explanation: string;
  quick_fix: string;
}

const SEVERITY_CONFIG = {
  high:   { border: '#DC2626', bg: '#FEF2F2', badge: '#DC2626', badgeBg: '#FEE2E2', label: 'High Priority' },
  medium: { border: '#F59E0B', bg: '#FFFBEB', badge: '#D97706', badgeBg: '#FEF3C7', label: 'Medium' },
  low:    { border: '#0ABFA3', bg: '#F0FDFA', badge: '#0ABFA3', badgeBg: '#CCFBF1', label: 'Low' },
};

export default function RejectionCards({ reasons }: { reasons: Reason[] }) {
  return (
    <div className="space-y-4">
      <h3 className="font-heading font-semibold text-brand-dark">Why your application needs improvement</h3>
      {reasons.map((r, i) => {
        const cfg = SEVERITY_CONFIG[r.severity] ?? SEVERITY_CONFIG.medium;
        return (
          <div
            key={i}
            className="rounded-2xl border-l-4 p-5 shadow-sm"
            style={{ borderLeftColor: cfg.border, backgroundColor: cfg.bg }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-heading font-semibold text-brand-dark">{r.title}</h4>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: cfg.badgeBg, color: cfg.badge }}
              >
                {cfg.label}
              </span>
            </div>

            {/* Your value vs Required */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white rounded-xl p-3 border border-red-100">
                <p className="text-xs text-brand-muted mb-0.5">Your value</p>
                <p className="font-bold text-red-600 text-lg font-heading">{r.your_value}</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-green-100">
                <p className="text-xs text-brand-muted mb-0.5">Required</p>
                <p className="font-bold text-green-600 text-lg font-heading">{r.required}</p>
              </div>
            </div>

            <p className="text-sm text-brand-dark mb-3 leading-relaxed">{r.plain_explanation}</p>

            {r.quick_fix && (
              <p className="text-xs italic flex items-start gap-2" style={{ color: 'var(--brand-teal)' }}>
                <span>⚡</span>
                <span>{r.quick_fix}</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
