import React, { useState, useRef, useEffect } from 'react';
import { QueueItem, useQueue } from '../../contexts/QueueContext';
import { askOllama } from '../../utils/ollama';

type Tab = 'journey' | 'documents' | 'ai' | 'notes';

export default function CustomerDetailPanel({ customer }: { customer: QueueItem }) {
  const [activeTab, setActiveTab] = useState<Tab>('journey');
  const [greeting, setGreeting] = useState('');
  const [approach, setApproach] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const aiCalled = useRef(false);
  const { dispatch } = useQueue();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Load AI script when tab is opened
  useEffect(() => {
    if (activeTab === 'ai' && !aiCalled.current) {
      aiCalled.current = true;
      setAiLoading(true);
      Promise.all([
        askOllama(
          `Generate a warm, professional 1-sentence opening greeting for a Union Bank of India staff member at Counter 4 to say to a customer named ${customer.name} who is here for ${customer.task}. Customer's language: ${customer.language}. Return only the greeting sentence, nothing else.`,
          { timeout: 15000 }
        ),
        askOllama(
          `In 2-3 bullet points, what should a bank teller know or prepare before serving a customer who needs ${customer.task}? Be practical and specific. One bullet per line, start each with •`,
          { timeout: 15000 }
        ),
      ])
        .then(([g, a]) => { setGreeting(g); setApproach(a); })
        .catch(() => { setGreeting('Welcome! How can I assist you today?'); setApproach('• Review customer documents\n• Check account status\n• Prepare required forms'); })
        .finally(() => setAiLoading(false));
    }
  }, [activeTab, customer]);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'journey', label: '🗺️ Journey' },
    { key: 'documents', label: '📄 Documents' },
    { key: 'ai', label: '🤖 AI Script' },
    { key: 'notes', label: '📝 Notes' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-lg font-bold text-brand-dark font-heading">{customer.token}</span>
          <h2 className="font-heading font-bold text-xl text-brand-dark">{customer.name}</h2>
          {customer.isA11y && <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">PwD</span>}
          {customer.isBereavement && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Bereavement</span>}
          {customer.escalated && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Escalated</span>}
        </div>
        <p className="text-brand-muted text-sm">{customer.task} · {customer.languageFlag} {customer.language} · {new Date(customer.arrivedAt).toLocaleTimeString('en-IN')}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 bg-white px-4">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === t.key ? 'border-brand-teal' : 'border-transparent text-brand-muted hover:text-brand-dark'
            }`}
            style={activeTab === t.key ? { borderBottomColor: 'var(--brand-teal)', color: 'var(--brand-teal)' } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'journey' && (
          <JourneyTab customer={customer} onComplete={(step) => dispatch({ type: 'COMPLETE_STEP', token: customer.token, stepNum: step })} />
        )}
        {activeTab === 'documents' && <DocumentsTab customer={customer} />}
        {activeTab === 'ai' && (
          <AIScriptTab loading={aiLoading} greeting={greeting} approach={approach} />
        )}
        {activeTab === 'notes' && (
          <NotesTab
            notes={customer.notes ?? ''}
            onSave={(notes) => dispatch({ type: 'UPDATE_NOTES', token: customer.token, notes })}
          />
        )}
      </div>

      {/* Action bar */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center gap-3 flex-wrap">
        <button
          className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ backgroundColor: 'var(--brand-teal)' }}
          onClick={() => {
            const nextStep = customer.journey?.find(s => !s.completed)?.step;
            if (nextStep !== undefined) dispatch({ type: 'COMPLETE_STEP', token: customer.token, stepNum: nextStep });
          }}
        >
          ✓ Mark Step Complete
        </button>
        <button
          className="px-4 py-2.5 rounded-xl border text-sm font-semibold"
          style={{ borderColor: '#F59E0B', color: '#D97706' }}
          onClick={() => { dispatch({ type: 'ESCALATE_CUSTOMER', token: customer.token }); showToast('Customer flagged for manager attention'); }}
        >
          ⚠️ Escalate
        </button>
        <button
          className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold bg-green-600 hover:bg-green-700 transition-colors"
          onClick={() => { dispatch({ type: 'COMPLETE_CUSTOMER', token: customer.token }); showToast(`Serving complete for ${customer.name}!`); }}
        >
          ✅ Service Complete
        </button>
        <button
          className="px-4 py-2.5 rounded-xl border text-sm font-semibold"
          style={{ borderColor: '#3B82F6', color: '#3B82F6' }}
          onClick={() => { dispatch({ type: 'REFER_TO_LOAN', token: customer.token }); showToast('Referred to Loan Officer'); }}
        >
          🏦 Refer to Loan
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl animate-fade-in-up">
          {toast}
        </div>
      )}
    </div>
  );
}

function JourneyTab({ customer, onComplete }: { customer: QueueItem; onComplete: (step: number) => void }) {
  if (!customer.journey || customer.journey.length === 0) {
    return <p className="text-brand-muted text-sm">No journey generated yet. Customer can plan their visit from the kiosk.</p>;
  }
  return (
    <div className="space-y-3">
      {customer.journey.map(step => (
        <div key={step.step} className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-xl">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ backgroundColor: step.completed ? '#D1FAE5' : 'var(--brand-teal-light)', color: step.completed ? '#065F46' : 'var(--brand-teal)' }}
          >
            {step.completed ? '✓' : step.step}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${step.completed ? 'line-through text-brand-muted' : 'text-brand-dark'}`}>{step.counter}</p>
            <p className="text-xs text-brand-muted">{step.service}</p>
          </div>
          {!step.completed && (
            <button onClick={() => onComplete(step.step)} className="text-xs text-brand-teal hover:underline" style={{ color: 'var(--brand-teal)' }}>Done</button>
          )}
        </div>
      ))}
    </div>
  );
}

function DocumentsTab({ customer }: { customer: QueueItem }) {
  const data = customer.extractedData;
  if (!data) return <p className="text-brand-muted text-sm">No documents scanned yet.</p>;
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(data).filter(([, v]) => v).map(([k, v]) => (
        <div key={k} className="bg-white border border-gray-100 rounded-xl p-3">
          <p className="text-xs text-brand-muted capitalize">{k.replace(/_/g, ' ')}</p>
          <p className="text-sm font-medium text-brand-dark mt-0.5">{v as string}</p>
        </div>
      ))}
    </div>
  );
}

function AIScriptTab({ loading, greeting, approach }: { loading: boolean; greeting: string; approach: string }) {
  if (loading) return (
    <div className="space-y-3">
      <div className="skeleton h-16 rounded-xl" />
      <div className="skeleton h-24 rounded-xl" />
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="border-l-4 pl-4 py-2 rounded-r-xl bg-teal-50" style={{ borderLeftColor: 'var(--brand-teal)' }}>
        <p className="text-xs text-brand-muted mb-1">Suggested opening</p>
        <p className="text-sm text-brand-dark italic">"{greeting}"</p>
      </div>
      <div>
        <p className="text-sm font-medium text-brand-dark mb-2">Suggested approach:</p>
        <div className="space-y-1.5">
          {approach.split('\n').filter(Boolean).map((line, i) => (
            <p key={i} className="text-sm text-brand-dark">{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotesTab({ notes, onSave }: { notes: string; onSave: (n: string) => void }) {
  const [val, setVal] = useState(notes);
  return (
    <div>
      <textarea
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={() => onSave(val)}
        rows={8}
        placeholder="Add notes about this customer..."
        className="w-full border border-gray-200 rounded-xl p-4 text-sm focus:outline-none resize-none"
        style={{ fontFamily: 'Inter, sans-serif' }}
        onFocus={e => (e.target.style.borderColor = 'var(--brand-teal)')}
      />
      <p className="text-xs text-brand-muted mt-2">Auto-saves when you click away</p>
    </div>
  );
}
