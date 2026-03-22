import React, { useState } from 'react';
import { useQueue, QueueItem } from '../../contexts/QueueContext';

const TASK_COLORS: Record<string, { bg: string; text: string }> = {
  loan:      { bg: 'var(--brand-coral-light)',  text: 'var(--brand-coral)' },
  account:   { bg: 'var(--teal-light)',   text: 'var(--teal)' },
  deposit:   { bg: '#EFF6FF',                   text: '#3B82F6' },
  emergency: { bg: '#FFFBEB',                   text: '#D97706' },
  query:     { bg: '#F8FAFC',                   text: '#64748B' },
};

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  return `${mins} min ago`;
}

export default function QueueSidebar() {
  const { state, dispatch } = useQueue();
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTask, setNewTask] = useState('');

  const activeTokens = state.queue.filter(c => c.status !== 'complete');

  const handleAdd = () => {
    if (!newName.trim()) return;
    const token = `A0${40 + state.queue.length + 1}`;
    dispatch({
      type: 'ADD_CUSTOMER',
      customer: {
        token,
        name: newName,
        task: newTask || 'General Enquiry',
        taskType: 'query',
        docsScanned: 0,
        docsTotal: 0,
        language: 'en',
        languageFlag: '🇬🇧',
        isA11y: false,
        isBereavement: false,
        arrivedAt: new Date(),
        status: 'waiting',
      },
    });
    setAddOpen(false);
    setNewName('');
    setNewTask('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3">
        <p className="text-gray-400 text-xs uppercase tracking-wide font-medium">Queue ({activeTokens.length})</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-2 pb-3">
        {activeTokens.map(customer => (
          <CustomerCard
            key={customer.token}
            customer={customer}
            isActive={customer.token === state.activeCustomerToken}
            onClick={() => dispatch({ type: 'SELECT_CUSTOMER', token: customer.token })}
          />
        ))}
      </div>

      {/* Add walk-in */}
      <div className="px-3 pb-3">
        <button
          onClick={() => setAddOpen(true)}
          className="w-full text-xs py-2 rounded-xl border border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-colors"
        >
          + Add Walk-in Customer
        </button>
      </div>

      {/* Add dialog */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl">
            <h3 className="font-heading font-semibold mb-4">Add Walk-in Customer</h3>
            <div className="space-y-3 mb-5">
              <input
                placeholder="Customer name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
              />
              <input
                placeholder="Task (e.g. Account Opening)"
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ backgroundColor: 'var(--teal)' }}>
                Add to Queue
              </button>
              <button onClick={() => setAddOpen(false)} className="px-4 py-2.5 rounded-xl border text-sm text-[var(--text-muted)] hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerCard({ customer, isActive, onClick }: { customer: QueueItem; isActive: boolean; onClick: () => void }) {
  const colors = TASK_COLORS[customer.taskType] ?? TASK_COLORS.query;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-3 transition-all hover:bg-white/10"
      style={{
        backgroundColor: isActive ? 'rgba(10,191,163,0.15)' : 'rgba(255,255,255,0.05)',
        borderLeft: isActive ? '3px solid var(--teal)' : '3px solid transparent',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: colors.bg, color: colors.text }}>
          {customer.token}
        </span>
        <span className="text-white text-sm font-medium truncate">{customer.name}</span>
      </div>
      <p className="text-gray-400 text-xs truncate mb-1.5">{customer.task}</p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-gray-500 text-[10px]">{customer.languageFlag} · {timeAgo(customer.arrivedAt)}</span>
        {customer.docsTotal > 0 && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{
              backgroundColor: customer.docsScanned >= customer.docsTotal ? '#D1FAE5' : '#FEF3C7',
              color: customer.docsScanned >= customer.docsTotal ? '#065F46' : '#92400E',
            }}
          >
            {customer.docsScanned}/{customer.docsTotal} docs
          </span>
        )}
        {customer.isA11y && <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full">PwD</span>}
        {customer.isBereavement && <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">Bereavement</span>}
        {customer.escalated && <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">Escalated</span>}
      </div>
    </button>
  );
}
