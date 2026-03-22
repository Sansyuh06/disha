import React from 'react';

const CHIPS = [
  { label: '🏦 Open Account', text: 'I want to open a new savings account' },
  { label: '🏠 Home Loan', text: 'I want to enquire about a home loan' },
  { label: '📅 FD Renewal', text: 'I want to renew my fixed deposit' },
  { label: '🪪 KYC Update', text: 'I need to update my KYC documents' },
  { label: '💵 Cash Withdrawal', text: 'I need to make a large cash withdrawal' },
  { label: '📋 Lodge Complaint', text: 'I want to lodge a complaint about my account' },
];

export default function PresetChips({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="mt-4">
      <p className="text-xs text-[var(--text-muted)] mb-2">Or choose a common task:</p>
      <div className="flex flex-wrap gap-2">
        {CHIPS.map(chip => (
          <button
            key={chip.label}
            onClick={() => onSelect(chip.text)}
            className="text-sm px-3 py-1.5 rounded-full border transition-all hover:scale-105"
            style={{
              borderColor: 'var(--teal)',
              backgroundColor: 'var(--teal-light)',
              color: 'var(--teal)',
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
