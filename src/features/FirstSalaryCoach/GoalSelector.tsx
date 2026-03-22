import React, { useState } from 'react';

interface Goal {
  name: string;
  emoji: string;
  target: number;
}

const PRESET_GOALS: Goal[] = [
  { name: 'Emergency Fund',       emoji: '🛡️', target: 50000   },
  { name: 'New Smartphone',       emoji: '📱', target: 25000   },
  { name: 'Two-Wheeler',          emoji: '🛵', target: 80000   },
  { name: 'Travel Trip',          emoji: '✈️', target: 30000   },
  { name: 'Home Down Payment',    emoji: '🏠', target: 500000  },
  { name: 'Mutual Funds Start',   emoji: '📈', target: 10000   },
  { name: 'Education Course',     emoji: '🎓', target: 40000   },
  { name: 'Wedding Fund',         emoji: '💍', target: 200000  },
];

interface Props {
  selected: Goal[];
  onChange: (goals: Goal[]) => void;
  onBack: () => void;
  onGenerate: () => void;
  loading: boolean;
  error: string | null;
}

export default function GoalSelector({ selected, onChange, onBack, onGenerate, loading, error }: Props) {
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});

  const isSelected = (name: string) => selected.some(g => g.name === name);

  const toggle = (goal: Goal) => {
    if (isSelected(goal.name)) {
      onChange(selected.filter(g => g.name !== goal.name));
    } else {
      if (selected.length >= 3) {
        // Max 3 — show via alert-style toast in parent; silently ignore here
        return;
      }
      onChange([...selected, { ...goal, target: customAmounts[goal.name] ?? goal.target }]);
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-brand-muted text-sm">Pick 1–3 goals that matter to you most</p>

      {selected.length === 3 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
          You can pick up to 3 goals. Deselect one to choose another.
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PRESET_GOALS.map(goal => {
          const sel = isSelected(goal.name);
          return (
            <div key={goal.name} className="flex flex-col gap-1">
              <button
                onClick={() => toggle(goal)}
                disabled={!sel && selected.length >= 3}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  borderColor: sel ? 'var(--brand-teal)' : '#E2E8F0',
                  backgroundColor: sel ? 'var(--brand-teal-light)' : 'white',
                }}
              >
                <span className="text-3xl">{goal.emoji}</span>
                <span className="text-xs font-medium text-center leading-tight" style={{ color: sel ? 'var(--brand-teal)' : 'var(--brand-dark)' }}>
                  {goal.name}
                </span>
                <span className="text-xs text-brand-muted">₹{goal.target.toLocaleString('en-IN')}</span>
              </button>

              {sel && (
                <input
                  type="number"
                  defaultValue={customAmounts[goal.name] ?? goal.target}
                  onChange={e => {
                    const amt = Number(e.target.value);
                    setCustomAmounts(prev => ({ ...prev, [goal.name]: amt }));
                    onChange(selected.map(g => g.name === goal.name ? { ...g, target: amt } : g));
                  }}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none text-center"
                  placeholder="Custom target ₹"
                />
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
          ⚠️ {error}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="px-5 py-3 border rounded-xl text-sm text-brand-muted hover:bg-gray-50">
          ← Back
        </button>
        <button
          onClick={onGenerate}
          disabled={selected.length === 0 || loading}
          className="flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: 'var(--brand-teal)' }}
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating plan...</>
          ) : 'Generate My Plan ✨'}
        </button>
      </div>
    </div>
  );
}
