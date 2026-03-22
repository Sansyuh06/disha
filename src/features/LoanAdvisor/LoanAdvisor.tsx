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

      {/* EMI Calculator */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6">
        <h3 className="font-heading font-semibold text-lg mb-4" style={{ color: 'var(--navy-900)' }}>
          📊 EMI Calculator
        </h3>
        <EMICalculator loanAmount={loanAmount} loanType={loanType} />
      </div>

      {/* Loan Product Comparison */}
      <div className="mb-6">
        <h3 className="font-heading font-semibold text-lg mb-4" style={{ color: 'var(--navy-900)' }}>
          🏦 Compare Loan Products
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LOAN_PRODUCTS.map(p => (
            <div
              key={p.name}
              className="bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all"
              style={{ borderColor: loanType === p.type ? 'var(--teal)' : '#E2E8F0' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{p.icon}</span>
                <h4 className="font-heading font-semibold text-sm" style={{ color: 'var(--navy-900)' }}>{p.name}</h4>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>Interest Rate</span>
                  <span className="font-semibold" style={{ color: 'var(--teal)' }}>{p.rate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>Max Tenure</span>
                  <span className="font-medium" style={{ color: 'var(--navy-900)' }}>{p.tenure}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>Max Amount</span>
                  <span className="font-medium" style={{ color: 'var(--navy-900)' }}>{p.maxAmount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>Processing Fee</span>
                  <span className="font-medium" style={{ color: 'var(--navy-900)' }}>{p.processingFee}</span>
                </div>
              </div>
              <p className="text-[10px] mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{p.eligibility}</p>
            </div>
          ))}
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

const LOAN_PRODUCTS = [
  { name: 'Home Loan', type: 'Home Loan', icon: '🏠', rate: '8.40% – 9.65%', tenure: '30 years', maxAmount: '₹5 Crore', processingFee: '0.50%', eligibility: 'Min CIBIL 700, 3 yrs employment, DTI < 50%' },
  { name: 'Personal Loan', type: 'Personal Loan', icon: '💳', rate: '10.49% – 18.00%', tenure: '5 years', maxAmount: '₹25 Lakhs', processingFee: '1.50%', eligibility: 'Min CIBIL 650, 1 yr employment, income > ₹25K/mo' },
  { name: 'Education Loan', type: 'Education Loan', icon: '🎓', rate: '8.15% – 11.50%', tenure: '15 years', maxAmount: '₹1.5 Crore', processingFee: 'Nil', eligibility: 'Admission letter required, co-applicant for > ₹4L' },
  { name: 'Vehicle Loan', type: 'Vehicle Loan', icon: '🚗', rate: '8.70% – 12.50%', tenure: '7 years', maxAmount: '₹1 Crore', processingFee: '1.00%', eligibility: 'Min CIBIL 650, new car only, 85% on-road price' },
  { name: 'Gold Loan', type: 'Business Loan', icon: '✨', rate: '7.30% – 9.50%', tenure: '3 years', maxAmount: '₹50 Lakhs', processingFee: '0.25%', eligibility: 'Gold purity 18K+, 75% of gold value, instant disbursement' },
  { name: 'MSME Loan', type: 'Business Loan', icon: '🏭', rate: '9.25% – 14.00%', tenure: '10 years', maxAmount: '₹2 Crore', processingFee: '1.00%', eligibility: 'Udyam registration, 2 yrs business vintage, IT returns' },
];

function EMICalculator({ loanAmount, loanType }: { loanAmount: number; loanType: string }) {
  const defaultRate = loanType === 'Home Loan' ? 8.5 : loanType === 'Education Loan' ? 8.5 : loanType === 'Personal Loan' ? 12 : loanType === 'Vehicle Loan' ? 9 : 10;
  const defaultTenure = loanType === 'Home Loan' ? 20 : loanType === 'Education Loan' ? 10 : loanType === 'Personal Loan' ? 3 : 5;
  
  const [rate, setRate] = React.useState(defaultRate);
  const [tenure, setTenure] = React.useState(defaultTenure);

  // EMI formula: P × r × (1+r)^n / ((1+r)^n - 1)
  const r = rate / 12 / 100;
  const n = tenure * 12;
  const emi = r > 0 && n > 0 ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : 0;
  const totalPayment = emi * n;
  const totalInterest = totalPayment - loanAmount;
  const interestPct = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: 'var(--text-muted)' }}>Interest Rate</span>
            <span className="font-bold" style={{ color: 'var(--teal)' }}>{rate.toFixed(1)}%</span>
          </div>
          <input type="range" min={5} max={20} step={0.1} value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full" style={{ accentColor: 'var(--teal)' }} />
          <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span>5%</span><span>20%</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: 'var(--text-muted)' }}>Tenure</span>
            <span className="font-bold" style={{ color: 'var(--teal)' }}>{tenure} years</span>
          </div>
          <input type="range" min={1} max={30} step={1} value={tenure} onChange={e => setTenure(Number(e.target.value))} className="w-full" style={{ accentColor: 'var(--teal)' }} />
          <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span>1 yr</span><span>30 yrs</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-3 text-center border border-teal-100">
          <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--teal)' }}>Monthly EMI</p>
          <p className="font-heading font-bold text-lg" style={{ color: 'var(--navy-900)' }}>₹{Math.round(emi).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
          <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>Total Interest</p>
          <p className="font-heading font-bold text-lg text-amber-600">₹{Math.round(totalInterest).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
          <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>Total Payment</p>
          <p className="font-heading font-bold text-lg" style={{ color: 'var(--navy-900)' }}>₹{Math.round(totalPayment).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Visual breakdown bar */}
      <div>
        <div className="flex h-3 rounded-full overflow-hidden">
          <div className="bg-teal-500 transition-all" style={{ width: `${100 - interestPct}%` }} />
          <div className="bg-amber-400 transition-all" style={{ width: `${interestPct}%` }} />
        </div>
        <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
          <span>🟢 Principal: ₹{loanAmount.toLocaleString('en-IN')}</span>
          <span>🟡 Interest: ₹{Math.round(totalInterest).toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
}

