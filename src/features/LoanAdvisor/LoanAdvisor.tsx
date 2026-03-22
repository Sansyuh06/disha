import React, { useState } from 'react';
import { askOllamaJSON } from '../../utils/ollama';
import { generateLoanPDF } from '../../utils/pdf';
import EligibilityMeter from './EligibilityMeter';
import RejectionCards from './RejectionCards';
import RecoveryTimeline from './RecoveryTimeline';
import { motion } from 'framer-motion';

const LOAN_TYPES = ['Home Loan', 'Personal Loan', 'Business Loan', 'Education Loan', 'Vehicle Loan'];
const EMPLOYMENT = ['Salaried', 'Self-Employed', 'Business Owner', 'Farmer', 'Retired'];

interface LoanResult {
  approved: boolean;
  eligibility_score: number;
  days_to_eligibility: number;
  rejection_reasons: Array<{
    title: string; your_value: string; required: string;
    severity: 'high' | 'medium' | 'low';
    plain_explanation: string; quick_fix: string;
  }>;
  monthly_plan: Array<{
    month: number; theme: string; primary_action: string;
    secondary_action: string; expected_cibil_gain: number; milestone: string;
  }>;
  encouragement: string;
}

export default function LoanAdvisor() {
  const [cibil, setCibil] = useState(650);
  const [income, setIncome] = useState(50000);
  const [existingEMI, setExistingEMI] = useState(0);
  const [loanAmount, setLoanAmount] = useState(2000000);
  const [loanType, setLoanType] = useState('Home Loan');
  const [employment, setEmployment] = useState('Salaried');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LoanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Live eligibility calculation
  const projectedEMI = loanAmount / (loanType === 'Home Loan' ? 240 : 60);
  const dti = income > 0 ? ((existingEMI + projectedEMI) / income) * 100 : 0;
  const cibilScore = ((cibil - 300) / 600) * 40;
  const dtiScore = Math.max(0, ((50 - dti) / 50) * 30);
  const incomeScore = Math.min(30, (income / (projectedEMI * 3)) * 10);
  const eligibility = Math.min(100, Math.max(0, cibilScore + dtiScore + incomeScore));

  const cibilLabel = cibil < 550 ? { text: 'Poor', color: '#DC2626' }
    : cibil < 650 ? { text: 'Fair', color: '#F59E0B' }
    : cibil < 750 ? { text: 'Good', color: 'var(--teal)' }
    : { text: 'Excellent', color: '#16A34A' };

  const handleSubmit = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await askOllamaJSON<LoanResult>(
        `You are a compassionate Indian bank loan eligibility advisor. 
Customer data: CIBIL score ${cibil}, monthly income Rs ${income}, existing EMIs Rs ${existingEMI}/month, 
requesting Rs ${loanAmount} as a ${loanType} loan, employment: ${employment}.
Calculated DTI: ${dti.toFixed(1)}%. Pre-computed eligibility score: ${eligibility.toFixed(0)}/100.
Standard Indian bank thresholds: CIBIL minimum 650 (home loan 750+), DTI maximum 50%, income must cover 3x projected EMI.
Return ONLY this JSON structure:
{
  "approved": false,
  "eligibility_score": ${eligibility.toFixed(0)},
  "days_to_eligibility": 90,
  "rejection_reasons": [{"title":"Low CIBIL Score","your_value":"${cibil}","required":"750+","severity":"high","plain_explanation":"Your credit score is ${cibil}.","quick_fix":"Pay all outstanding bills on time."}],
  "monthly_plan": [{"month":1,"theme":"Clear old dues","primary_action":"Pay Rs 3000 extra toward oldest card","secondary_action":"Set up auto-pay","expected_cibil_gain":8,"milestone":"CIBIL reaches ${cibil + 8}"}],
  "encouragement": "You are closer than you think."
}`,
        { timeout: 35000 }
      );
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold mb-1" style={{ color: 'var(--navy-900)' }}>Loan Eligibility Advisor</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Understand your loan status and get a clear improvement plan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left: Inputs */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">
          {/* CIBIL Slider */}
          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--navy-900)' }}>CIBIL Score</label>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-3xl font-bold font-heading" style={{ color: cibilLabel.color }}>{cibil}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: cibilLabel.color }}>{cibilLabel.text}</span>
            </div>
            <input
              type="range" min={300} max={900} step={1} value={cibil}
              onChange={e => setCibil(Number(e.target.value))}
              className="w-full mt-2"
              style={{ accentColor: 'var(--teal)' }}
            />
            <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>300</span><span>600</span><span>900</span>
            </div>
          </div>

          <NumberInput label="Monthly Income" prefix="₹" value={income} onChange={setIncome} />
          <NumberInput label="Existing EMIs / month" prefix="₹" value={existingEMI} onChange={setExistingEMI} />
          <NumberInput label="Loan Amount Required" prefix="₹" value={loanAmount} onChange={setLoanAmount} />

          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--navy-900)' }}>Loan Type</label>
            <div className="flex flex-wrap gap-2">
              {LOAN_TYPES.map(lt => (
                <button
                  key={lt}
                  onClick={() => setLoanType(lt)}
                  className="text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105"
                  style={{
                    borderColor: loanType === lt ? 'var(--teal)' : 'var(--border)',
                    backgroundColor: loanType === lt ? 'var(--teal)' : 'white',
                    color: loanType === lt ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {lt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2" style={{ color: 'var(--navy-900)' }}>Employment</label>
            <div className="flex flex-wrap gap-2">
              {EMPLOYMENT.map(emp => (
                <button
                  key={emp}
                  onClick={() => setEmployment(emp)}
                  className="text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105"
                  style={{
                    borderColor: employment === emp ? '#9333EA' : 'var(--border)',
                    backgroundColor: employment === emp ? '#9333EA' : 'white',
                    color: employment === emp ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {emp}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Meter */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col items-center justify-center">
          <EligibilityMeter value={eligibility} dti={dti} cibil={cibil} income={income} projectedEMI={projectedEMI} />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: 'var(--teal)' }}
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyzing...</>
            ) : 'Get My Full Loan Report'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-sm text-red-700">
          ⚠️ {error} — Make sure Ollama is running: <code>ollama serve</code>
          <button onClick={handleSubmit} className="ml-2 underline">Retry</button>
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="skeleton h-5 w-1/3 rounded mb-3" />
              <div className="skeleton h-4 w-2/3 rounded mb-2" />
              <div className="skeleton h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <RejectionCards reasons={result.rejection_reasons} />
          
          <details className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <summary className="px-5 py-4 cursor-pointer font-semibold font-heading" style={{ color: 'var(--navy-900)' }}>
              📅 Your 90-Day Recovery Plan
            </summary>
            <div className="px-5 pb-5">
              <RecoveryTimeline plan={result.monthly_plan} />
            </div>
          </details>

          {result.encouragement && (
            <blockquote className="border-l-4 pl-4 italic text-sm py-1" style={{ borderLeftColor: 'var(--teal)', color: 'var(--teal)' }}>
              "{result.encouragement}"
            </blockquote>
          )}

          <button
            onClick={() => generateLoanPDF({ cibil, income, loanAmount, loanType }, result.rejection_reasons, result.monthly_plan)}
            className="w-full py-3 border rounded-xl text-sm font-medium hover:bg-teal-50 transition-colors"
            style={{ borderColor: 'var(--teal)', color: 'var(--teal)' }}
          >
            📥 Download My Loan Plan
          </button>
        </motion.div>
      )}
    </div>
  );
}

function NumberInput({ label, prefix, value, onChange }: { label: string; prefix: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1" style={{ color: 'var(--navy-900)' }}>{label}</label>
      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-teal-500 transition-colors" style={{ '--tw-border-opacity': 1 } as React.CSSProperties}>
        <span className="px-3 py-2.5 bg-gray-50 text-sm border-r border-gray-200 font-medium" style={{ color: 'var(--text-muted)' }}>{prefix}</span>
        <input
          type="number"
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
        />
      </div>
    </div>
  );
}
