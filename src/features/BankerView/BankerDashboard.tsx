import React from 'react';
import QueueSidebar from './QueueSidebar';
import CustomerDetailPanel from './CustomerDetailPanel';
import StatsBar from './StatsBar';
import { useQueue } from '../../contexts/QueueContext';
import { useNavigate } from 'react-router-dom';

export default function BankerDashboard() {
  const { state } = useQueue();
  const navigate = useNavigate();
  const activeCustomer = state.queue.find(c => c.token === state.activeCustomerToken);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Dark sidebar */}
      <aside
        className="w-72 flex flex-col shrink-0 overflow-y-auto"
        style={{ backgroundColor: 'var(--brand-dark)' }}
      >
        {/* Header */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--brand-teal)' }}>
              <span className="text-white font-bold text-sm font-heading">D</span>
            </div>
            <div>
              <h2 className="text-white font-heading font-semibold text-sm">DISHA Staff</h2>
              <p className="text-gray-400 text-xs">Union Bank of India</p>
            </div>
          </div>
          <div className="bg-white/5 rounded-xl px-3 py-2">
            <p className="text-white text-sm font-medium">Priya Sharma</p>
            <p className="text-gray-400 text-xs">Counter 4 · Loans & Accounts</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="px-4 py-3 grid grid-cols-2 gap-2 border-b border-white/10">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-white font-bold text-xl font-heading">{state.stats.servedToday}</p>
            <p className="text-gray-400 text-[10px]">Served today</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-white font-bold text-xl font-heading">{state.queue.filter(c => c.status === 'waiting' || c.status === 'serving').length}</p>
            <p className="text-gray-400 text-[10px]">In queue</p>
          </div>
        </div>

        {/* Queue */}
        <div className="flex-1 overflow-hidden">
          <QueueSidebar />
        </div>

        {/* Footer nav */}
        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={() => navigate('/')}
            className="w-full text-xs text-gray-400 hover:text-white transition-colors py-2"
          >
            ← Back to Home
          </button>
        </div>
      </aside>

      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-surface">
        <StatsBar />
        <div className="flex-1 overflow-y-auto">
          {activeCustomer ? (
            <CustomerDetailPanel customer={activeCustomer} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="text-6xl mb-4">👈</div>
      <h3 className="font-heading font-semibold text-brand-dark text-xl mb-2">Select a Customer</h3>
      <p className="text-brand-muted text-sm max-w-xs">
        Click any customer in the queue to see their details, documents, and AI-suggested greeting.
      </p>
    </div>
  );
}
