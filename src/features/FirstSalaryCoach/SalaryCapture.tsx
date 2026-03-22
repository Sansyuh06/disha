import React from 'react';

interface Props {
  salary: number;
  onChange: (v: number) => void;
  onNext: () => void;
}

export default function SalaryCapture({ salary, onChange, onNext }: Props) {
  const [gross, setGross] = React.useState(0);
  const [deductions, setDeductions] = React.useState(0);

  React.useEffect(() => {
    if (gross > 0 && deductions >= 0) {
      onChange(Math.max(0, gross - deductions));
    }
  }, [gross, deductions, onChange]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
      <p className="text-sm text-brand-muted">Enter your salary details or calculate from gross</p>

      <div>
        <label className="text-xs font-medium text-brand-muted block mb-1">Gross Salary</label>
        <AmountInput prefix="₹" value={gross} onChange={setGross} />
      </div>

      <div>
        <label className="text-xs font-medium text-brand-muted block mb-1">Total Deductions (PF, TDS, etc.)</label>
        <AmountInput prefix="₹" value={deductions} onChange={setDeductions} />
      </div>

      <div>
        <label className="text-xs font-medium text-brand-muted block mb-1">Net Take-Home Salary</label>
        <AmountInput prefix="₹" value={salary} onChange={onChange} />
        {gross > 0 && <p className="text-xs text-brand-muted mt-1">Auto-calculated from gross − deductions</p>}
      </div>

      <button
        onClick={onNext}
        disabled={salary <= 0}
        className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
        style={{ backgroundColor: 'var(--brand-teal)' }}
      >
        Next: Set Your Goals →
      </button>
    </div>
  );
}

function AmountInput({ prefix, value, onChange }: { prefix: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:border-teal-400 transition-colors">
      <span className="px-3 py-2.5 bg-gray-50 text-brand-muted text-sm border-r border-gray-200">{prefix}</span>
      <input
        type="number"
        value={value || ''}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
        placeholder="0"
        min={0}
      />
    </div>
  );
}
