import React, { useState } from 'react';
import SalaryCapture from './SalaryCapture';
import GoalSelector from './GoalSelector';
import BudgetDonut from './BudgetDonut';
import { askOllamaJSON } from '../../utils/ollama';
import { generateSalaryPDF } from '../../utils/pdf';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 0 | 1 | 2;

interface Goal { name: string; emoji: string; target: number; }

interface SalaryPlan {
  budget: {
    needs: { percentage: number; amount: number; categories: string[] };
    wants: { percentage: number; amount: number; categories: string[] };
    savings: { percentage: number; amount: number; categories: string[] };
  };
  goals: Array<{
    name: string; target: number; monthly_contribution: number;
    months_to_achieve: number; account_type: string; tip: string;
  }>;
  first_month_actions: string[];
  union_bank_products: Array<{ product: string; why_relevant: string; counter: string }>;
  motivational_message: string;
}

export default function FirstSalaryCoach() {
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [salary, setSalary] = useState(0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [plan, setPlan] = useState<SalaryPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<{ usd: number; eur: number } | null>(null);

  const STEPS = ['Salary Details', 'Your Goals', 'Your Plan'];

  const handleGeneratePlan = async () => {
    setLoading(true); setError(null);
    try {
      const data = await askOllamaJSON<SalaryPlan>(
        `You are a friendly Indian personal finance coach for a first-time salary earner.
Net monthly salary: Rs ${salary}. Selected goals: ${goals.map(g => `${g.name} (target Rs ${g.target})`).join(', ')}.
Create a realistic financial plan. Return ONLY this JSON:
{
  "budget": {
    "needs": { "percentage": 50, "amount": ${Math.round(salary * 0.5)}, "categories": ["Rent","Groceries","Transport","Utilities"] },
    "wants": { "percentage": 30, "amount": ${Math.round(salary * 0.3)}, "categories": ["Dining out","Entertainment","Shopping"] },
    "savings": { "percentage": 20, "amount": ${Math.round(salary * 0.2)}, "categories": ["Emergency fund","Goal savings"] }
  },
  "goals": [{"name":"Emergency Fund","target":50000,"monthly_contribution":1500,"months_to_achieve":33,"account_type":"Liquid Mutual Fund","tip":"Set up auto-transfer on the 1st of every month"}],
  "first_month_actions": ["Open a zero-balance Union Bank savings account today","Set up a Rs ${Math.round(salary * 0.1)} monthly auto-transfer to savings"],
  "union_bank_products": [{"product":"Union Smart Save Account","why_relevant":"Zero balance, earns 3.5% interest, free NEFT","counter":"Counter 3 — New Accounts"}],
  "motivational_message": "You've already done the hardest part — earning. Now let it work for you."
}`,
        { timeout: 35000 }
      );
      setPlan(data);
      setCurrentStep(2);

      // Fetch exchange rates
      try {
        const er = await fetch('https://open.er-api.com/v6/latest/INR', { signal: AbortSignal.timeout(5000) });
        const erData = await er.json();
        if (erData.rates) setExchangeRate({ usd: erData.rates.USD, eur: erData.rates.EUR });
      } catch { /* silently skip */ }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold text-brand-dark mb-1">First Salary Coach</h1>
        <p className="text-brand-muted text-sm">Build smart money habits from day one</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-heading transition-all"
                style={{
                  backgroundColor: i <= currentStep ? 'var(--brand-teal)' : '#E2E8F0',
                  color: i <= currentStep ? 'white' : 'var(--brand-muted)',
                }}
              >
                {i < currentStep ? '✓' : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block" style={{ color: i === currentStep ? 'var(--brand-teal)' : 'var(--brand-muted)' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-0.5 mx-3 bg-gray-200" />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <SalaryCapture salary={salary} onChange={setSalary} onNext={() => setCurrentStep(1)} />
          </motion.div>
        )}
        {currentStep === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <GoalSelector
              selected={goals}
              onChange={setGoals}
              onBack={() => setCurrentStep(0)}
              onGenerate={handleGeneratePlan}
              loading={loading}
              error={error}
            />
          </motion.div>
        )}
        {currentStep === 2 && plan && (
          <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Budget donut */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
              <h3 className="font-heading font-semibold mb-4">Your Monthly Budget</h3>
              <BudgetDonut budget={plan.budget} totalSalary={salary} />
            </div>

            {/* Exchange rate */}
            {exchangeRate ? (
              plan.budget.savings.amount > 0 && (
                <p className="text-xs text-brand-muted text-center mb-4">
                  Your ₹{plan.budget.savings.amount.toLocaleString('en-IN')} monthly saving = 
                  ${(plan.budget.savings.amount * exchangeRate.usd).toFixed(0)} USD · 
                  €{(plan.budget.savings.amount * exchangeRate.eur).toFixed(0)} EUR
                </p>
              )
            ) : loading ? (
              <div className="flex justify-center mb-4">
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--teal)', borderTopColor: 'transparent' }} />
              </div>
            ) : null}

            {/* Goals */}
            <div className="space-y-3 mb-5">
              {plan.goals.map((g, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-heading font-semibold text-brand-dark text-sm">{g.name}</h4>
                    <span className="text-sm font-bold" style={{ color: 'var(--brand-teal)' }}>₹{g.monthly_contribution.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <p className="text-xs text-brand-muted">Reach your goal in {g.months_to_achieve} months · {g.account_type}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-2">
                    <div className="h-full rounded-full w-0" style={{ backgroundColor: 'var(--brand-teal)' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* First month actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-5">
              <h4 className="font-heading font-semibold mb-3">✅ First Month Actions</h4>
              <div className="space-y-2">
                {plan.first_month_actions.map((a, i) => (
                  <label key={i} className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" className="mt-0.5" />
                    <span className="text-sm text-brand-dark">{a}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Union Bank products */}
            <details className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-5">
              <summary className="px-5 py-4 cursor-pointer font-semibold font-heading text-sm text-brand-dark">
                🏦 Recommended Union Bank Products
              </summary>
              <div className="px-5 pb-4 space-y-3">
                {plan.union_bank_products.map((p, i) => (
                  <div key={i} className="border-l-2 pl-3" style={{ borderLeftColor: 'var(--brand-teal)' }}>
                    <p className="text-sm font-semibold text-brand-dark">{p.product}</p>
                    <p className="text-xs text-brand-muted">{p.why_relevant}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block" style={{ backgroundColor: 'var(--brand-teal-light)', color: 'var(--brand-teal)' }}>{p.counter}</span>
                  </div>
                ))}
              </div>
            </details>

            {/* Motivational message */}
            {plan.motivational_message && (
              <blockquote className="border-l-4 pl-4 italic text-sm mb-5" style={{ borderLeftColor: 'var(--brand-teal)', color: 'var(--brand-teal)' }}>
                "{plan.motivational_message}"
              </blockquote>
            )}

            <button
              onClick={() => generateSalaryPDF(salary, plan.budget, plan.goals, plan.first_month_actions)}
              className="w-full py-3 border rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              style={{ borderColor: 'var(--brand-teal)', color: 'var(--brand-teal)' }}
            >
              📥 Download My Financial Plan
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
