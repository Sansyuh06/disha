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
      <div className="px-6 pt-5 pb-4 bg-white" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-1">
          <span className="text-lg font-bold font-heading" style={{ color: 'var(--navy-900)' }}>{customer.token}</span>
          <h2 className="font-heading font-bold text-xl" style={{ color: 'var(--navy-900)' }}>{customer.name}</h2>
          {customer.isA11y && <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">PwD</span>}
          {customer.isBereavement && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Bereavement</span>}
          {customer.escalated && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Escalated</span>}
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{customer.task} · {customer.languageFlag} {customer.language} · {new Date(customer.arrivedAt).toLocaleTimeString('en-IN')}</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white px-4" style={{ borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === t.key ? 'border-teal' : 'border-transparent hover:opacity-70'
            }`}
            style={activeTab === t.key ? { borderBottomColor: 'var(--teal)', color: 'var(--teal)' } : { color: 'var(--text-muted)' }}
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
          <AIScriptTab
            loading={aiLoading}
            greeting={greeting}
            approach={approach}
            customer={customer}
            onApprove={() => showToast('Opening greeting approved')}
            onEdit={(text) => setGreeting(text)}
          />
        )}
        {activeTab === 'notes' && (
          <NotesTab
            notes={customer.notes ?? ''}
            onSave={(notes) => dispatch({ type: 'UPDATE_NOTES', token: customer.token, notes })}
          />
        )}
      </div>

      {/* Action bar */}
      <div className="px-6 py-4 bg-white flex items-center gap-3 flex-wrap" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ backgroundColor: 'var(--teal)' }}
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
    return <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No journey generated yet. Customer can plan their visit from the kiosk.</p>;
  }
  return (
    <div className="space-y-3">
      {customer.journey.map(step => (
        <div key={step.step} className="flex items-start gap-3 p-4 bg-white rounded-xl" style={{ border: '1px solid var(--border)' }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ backgroundColor: step.completed ? '#D1FAE5' : 'var(--teal-light)', color: step.completed ? '#065F46' : 'var(--teal)' }}
          >
            {step.completed ? '✓' : step.step}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${step.completed ? 'line-through' : ''}`} style={{ color: step.completed ? 'var(--text-muted)' : 'var(--navy-900)' }}>{step.counter}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{step.service}</p>
          </div>
          {!step.completed && (
            <button onClick={() => onComplete(step.step)} className="text-xs hover:underline" style={{ color: 'var(--teal)' }}>Done</button>
          )}
        </div>
      ))}
    </div>
  );
}

function DocumentsTab({ customer }: { customer: QueueItem }) {
  const data = customer.extractedData;
  if (!data) return <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No documents scanned yet.</p>;
  return (
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(data).filter(([, v]) => v).map(([k, v]) => (
        <div key={k} className="bg-white rounded-xl p-3" style={{ border: '1px solid var(--border)' }}>
          <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{k.replace(/_/g, ' ')}</p>
          <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--navy-900)' }}>{v as string}</p>
        </div>
      ))}
    </div>
  );
}

function AIScriptTab({
  loading, greeting, approach, customer, onApprove, onEdit
}: {
  loading: boolean;
  greeting: string;
  approach: string;
  customer: QueueItem;
  onApprove: () => void;
  onEdit: (text: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editedGreeting, setEditedGreeting] = useState(greeting);
  const [approved, setApproved] = useState(false);

  useEffect(() => { setEditedGreeting(greeting); }, [greeting]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '60px', borderRadius: '10px' }} />)}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* AI positioning banner */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 14px', background: '#EFF4FF', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
        <svg width="16" height="16" fill="none" stroke="#1B3A8E" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        <p style={{ fontSize: '12px', color: '#1E40AF', fontWeight: 500 }}>AI assists — you decide. Review and approve before using.</p>
      </div>

      {/* Greeting card */}
      <div style={{ background: 'white', border: '1px solid #DDE4F5', borderRadius: '12px', padding: '16px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Suggested Opening</p>

        {editing ? (
          <textarea
            value={editedGreeting}
            onChange={e => setEditedGreeting(e.target.value)}
            style={{ width: '100%', border: '1.5px solid #1B3A8E', borderRadius: '10px', padding: '12px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', resize: 'vertical', outline: 'none', minHeight: '80px' }}
            autoFocus
          />
        ) : (
          <div style={{ background: '#F2F5FC', borderRadius: '10px', padding: '14px 16px', borderLeft: '3px solid #0ABFA3' }}>
            <p style={{ fontSize: '14px', color: '#0D1B3E', lineHeight: 1.6, fontStyle: 'italic' }}>"{editedGreeting}"</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          {!approved ? (
            <>
              <button
                onClick={() => { setApproved(true); onApprove(); }}
                style={{ flex: 1, padding: '9px', borderRadius: '8px', background: '#0ABFA3', color: 'white', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                ✓ Approve & Use
              </button>
              {editing ? (
                <button onClick={() => { setEditing(false); onEdit(editedGreeting); }} style={{ padding: '9px 16px', borderRadius: '8px', background: '#1B3A8E', color: 'white', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Save
                </button>
              ) : (
                <button onClick={() => setEditing(true)} style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #DDE4F5', background: 'white', color: '#0D1B3E', fontSize: '13px', cursor: 'pointer' }}>
                  Edit
                </button>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16A34A', fontSize: '13px', fontWeight: 600 }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              Approved — ready to use
            </div>
          )}
        </div>
      </div>

      {/* Approach bullets */}
      {approach && (
        <div style={{ background: 'white', border: '1px solid #DDE4F5', borderRadius: '12px', padding: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Approach Notes</p>
          {approach.split('\n').filter(l => l.trim()).map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#EFF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#1B3A8E' }}>{i + 1}</span>
              </div>
              <p style={{ fontSize: '13px', color: '#3D4F7C', lineHeight: 1.5 }}>{line.replace(/^[•\-]\s*/, '')}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pre-visit note */}
      {customer.preVisitCode && (
        <div style={{ padding: '12px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px' }}>
          <p style={{ fontSize: '12px', color: '#15803D', fontWeight: 600 }}>✓ Pre-visit session scanned — Code: {customer.preVisitCode}</p>
          <p style={{ fontSize: '11px', color: '#16A34A', marginTop: '2px' }}>Documents and journey were pre-loaded from the customer's WhatsApp session.</p>
        </div>
      )}

      {/* Agent note */}
      {customer.aiSuggestion && (
        <div style={{ padding: '12px 14px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', marginBottom: '4px' }}>DISHA Agent Note</p>
          <p style={{ fontSize: '12px', color: '#78350F' }}>{customer.aiSuggestion}</p>
        </div>
      )}
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
        className="w-full rounded-xl p-4 text-sm focus:outline-none resize-none"
        style={{ border: '1.5px solid var(--border)', fontFamily: 'DM Sans, sans-serif' }}
        onFocus={e => (e.target.style.borderColor = 'var(--teal)')}
      />
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Auto-saves when you click away</p>
    </div>
  );
}
