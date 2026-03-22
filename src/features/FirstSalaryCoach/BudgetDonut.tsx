import React from 'react';

interface Budget {
  needs: { percentage: number; amount: number; categories: string[] };
  wants: { percentage: number; amount: number; categories: string[] };
  savings: { percentage: number; amount: number; categories: string[] };
}

interface Props {
  budget: Budget;
  totalSalary: number;
}

export default function BudgetDonut({ budget, totalSalary }: Props) {
  const n = budget.needs.percentage;
  const w = budget.wants.percentage;
  const s = budget.savings.percentage;

  const gradient = `conic-gradient(
    #0ABFA3 0% ${n}%,
    #FF6B35 ${n}% ${n + w}%,
    #7C5CBF ${n + w}% 100%
  )`;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      {/* Donut */}
      <div className="relative w-36 h-36 shrink-0">
        <div
          className="w-full h-full rounded-full"
          style={{ background: gradient }}
        />
        {/* Inner hole */}
        <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center">
          <p className="text-xs text-brand-muted">Take-home</p>
          <p className="text-xs font-bold text-brand-dark">₹{totalSalary.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 flex-1 min-w-40">
        <LegendRow color="#0ABFA3" label="Needs" pct={n} amount={budget.needs.amount} categories={budget.needs.categories} />
        <LegendRow color="#FF6B35" label="Wants" pct={w} amount={budget.wants.amount} categories={budget.wants.categories} />
        <LegendRow color="#7C5CBF" label="Savings" pct={s} amount={budget.savings.amount} categories={budget.savings.categories} />
      </div>
    </div>
  );
}

function LegendRow({
  color, label, pct, amount, categories,
}: { color: string; label: string; pct: number; amount: number; categories: string[] }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-3 h-3 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: color }} />
      <div>
        <p className="text-sm font-medium text-brand-dark">
          {label} — ₹{amount.toLocaleString('en-IN')} ({pct}%)
        </p>
        <p className="text-xs text-brand-muted">{categories.slice(0, 3).join(', ')}</p>
      </div>
    </div>
  );
}
