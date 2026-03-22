import React, { useState } from 'react';
import { BereavementAnswers } from './BereavementCompanion';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh','Puducherry',
];

interface Props {
  onComplete: (answers: BereavementAnswers) => void;
  loading: boolean;
}

export default function IntakeWizard({ onComplete, loading }: Props) {
  const [step, setStep] = useState(0);
  const [relationship, setRelationship] = useState('');
  const [accountTypes, setAccountTypes] = useState<string[]>([]);
  const [state, setState] = useState('');
  const [hasDC, setHasDC] = useState('');
  const [hasNominee, setHasNominee] = useState('');

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => Math.max(0, s - 1));

  const submit = () => {
    onComplete({ relationship, accountTypes, state, hasDC, hasNominee });
  };

  const toggleAccount = (type: string) => {
    setAccountTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-8 justify-center">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: i === step ? 24 : 8,
              height: 8,
              backgroundColor: i <= step ? '#93C5FD' : '#E2E8F0',
            }}
          />
        ))}
      </div>

      {/* Step 0: Relationship */}
      {step === 0 && (
        <WizardCard title="What is your relationship to the account holder?">
          {['Spouse', 'Child', 'Parent', 'Sibling', 'Other'].map(r => (
            <OptionButton
              key={r}
              label={r}
              selected={relationship === r}
              onClick={() => { setRelationship(r); setTimeout(goNext, 300); }}
            />
          ))}
          {step > 0 && <BackButton onClick={goBack} />}
        </WizardCard>
      )}

      {/* Step 1: Account types */}
      {step === 1 && (
        <WizardCard title="Do you know what accounts they held?" multi>
          {['Savings Account', 'Fixed Deposit', 'Home Loan', 'Locker', 'Unknown'].map(type => (
            <OptionButton
              key={type}
              label={type}
              selected={accountTypes.includes(type)}
              onClick={() => toggleAccount(type)}
            />
          ))}
          <div className="flex gap-3 mt-4">
            <BackButton onClick={goBack} />
            <button
              onClick={goNext}
              disabled={accountTypes.length === 0}
              className="flex-1 py-3 rounded-xl text-white font-medium text-sm disabled:opacity-50"
              style={{ backgroundColor: '#3B82F6' }}
            >
              Continue →
            </button>
          </div>
        </WizardCard>
      )}

      {/* Step 2: State */}
      {step === 2 && (
        <WizardCard title="Which state did they bank in?">
          <select
            value={state}
            onChange={e => setState(e.target.value)}
            className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-white"
          >
            <option value="">Select a state...</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex gap-3 mt-4">
            <BackButton onClick={goBack} />
            <button
              onClick={goNext}
              disabled={!state}
              className="flex-1 py-3 rounded-xl text-white font-medium text-sm disabled:opacity-50"
              style={{ backgroundColor: '#3B82F6' }}
            >
              Continue →
            </button>
          </div>
        </WizardCard>
      )}

      {/* Step 3: Death certificate */}
      {step === 3 && (
        <WizardCard title="Do you have the death certificate?">
          {[
            'Yes, I have it',
            'No, it\'s being processed',
            'I\'m not sure what I need',
          ].map(opt => (
            <OptionButton
              key={opt}
              label={opt}
              selected={hasDC === opt}
              onClick={() => { setHasDC(opt); setTimeout(goNext, 300); }}
            />
          ))}
          <BackButton onClick={goBack} />
        </WizardCard>
      )}

      {/* Step 4: Nominee */}
      {step === 4 && (
        <WizardCard title="Was a nominee registered on the account?">
          {[
            'Yes, nominee is registered',
            'No, there was no nominee',
            'I don\'t know',
          ].map(opt => (
            <OptionButton
              key={opt}
              label={opt}
              selected={hasNominee === opt}
              onClick={() => { setHasNominee(opt); setTimeout(() => setStep(5), 300); }}
            />
          ))}
          <BackButton onClick={goBack} />
        </WizardCard>
      )}

      {/* Summary */}
      {step === 5 && (
        <WizardCard title="Here is what we know:">
          <div className="space-y-2 mb-5 text-sm text-blue-800">
            <p>👤 Relationship: <strong>{relationship}</strong></p>
            <p>🏦 Accounts: <strong>{accountTypes.join(', ')}</strong></p>
            <p>📍 State: <strong>{state}</strong></p>
            <p>📋 Death certificate: <strong>{hasDC}</strong></p>
            <p>✅ Nominee: <strong>{hasNominee}</strong></p>
          </div>
          <button
            onClick={submit}
            disabled={loading}
            className="w-full py-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: '#3B82F6' }}
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating your guide...</>
            ) : 'Generate My Step-by-Step Guide →'}
          </button>
          <BackButton onClick={goBack} />
        </WizardCard>
      )}
    </div>
  );
}

function WizardCard({ title, children, multi }: { title: string; children: React.ReactNode; multi?: boolean }) {
  return (
    <div>
      <h3 className="font-heading text-xl font-semibold text-blue-900 mb-5 text-center leading-relaxed">{title}</h3>
      {multi && <p className="text-xs text-blue-500 text-center mb-3">Select all that apply</p>}
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function OptionButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-5 py-4 rounded-xl border-2 text-sm font-medium transition-all"
      style={{
        borderColor: selected ? '#3B82F6' : '#BFDBFE',
        backgroundColor: selected ? '#EFF6FF' : 'white',
        color: selected ? '#1D4ED8' : '#1E40AF',
      }}
    >
      {label}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-center text-sm text-blue-400 hover:text-blue-600 transition-colors py-2 mt-1"
    >
      ← Go back
    </button>
  );
}
