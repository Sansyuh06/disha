import React, { useState } from 'react';

interface PlanMonth {
  month: number;
  theme: string;
  primary_action: string;
  secondary_action: string;
  expected_cibil_gain: number;
  milestone: string;
}

export default function RecoveryTimeline({ plan }: { plan: PlanMonth[] }) {
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const toggle = (m: number) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m); else next.add(m);
      return next;
    });
  };

  return (
    <div className="space-y-4 pt-2">
      {plan.map((month, idx) => {
        const done = completed.has(month.month);
        return (
          <div key={idx} className="flex gap-4">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => toggle(month.month)}
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm font-heading transition-all shrink-0"
                style={{
                  backgroundColor: done ? '#16A34A' : 'var(--teal-light)',
                  color: done ? 'white' : 'var(--teal)',
                  border: `2px solid ${done ? '#16A34A' : 'var(--teal)'}`,
                }}
              >
                {done ? '✓' : `M${month.month}`}
              </button>
              {idx < plan.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1 min-h-[20px]" />}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-heading font-semibold text-sm text-[var(--navy-900)]">{month.theme}</h4>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: 'var(--teal-light)', color: 'var(--teal)' }}
                >
                  +{month.expected_cibil_gain} pts
                </span>
              </div>
              <p className="text-xs text-[var(--navy-900)] mb-0.5">➤ {month.primary_action}</p>
              {month.secondary_action && (
                <p className="text-xs text-[var(--text-muted)]">➤ {month.secondary_action}</p>
              )}
              <p className="text-xs font-medium mt-1.5" style={{ color: 'var(--teal)' }}>
                🏁 {month.milestone}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
