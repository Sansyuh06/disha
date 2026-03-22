import React, { useState } from 'react';
import { useQueue } from '../../contexts/QueueContext';
import QueueSidebar from './QueueSidebar';
import StatsBar from './StatsBar';
import CustomerDetailPanel from './CustomerDetailPanel';
import DishaLogo from '../../components/DishaLogo';
import OllamaStatus from '../../components/OllamaStatus';

export default function BankerDashboard() {
  const { state, dispatch } = useQueue();
  const activeCustomer = state.queue.find(c => c.token === state.activeCustomerToken) || null;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Dark Sidebar ────────────────────────────── */}
      <aside
        className="flex flex-col shrink-0"
        style={{
          width: '280px',
          background: 'linear-gradient(180deg, #0D1B3E 0%, #122248 100%)',
        }}
      >
        {/* Staff card */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <DishaLogo variant="light" size={32} />
          <div className="mt-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-bold text-sm"
              style={{ background: 'rgba(10,191,163,0.15)', color: '#0ABFA3' }}
            >
              RP
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>Rajesh Patel</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Counter 3 · On Duty</p>
            </div>
            <div className="ml-auto w-2.5 h-2.5 rounded-full" style={{ background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
          </div>
        </div>

        {/* Quick stats in sidebar */}
        <div className="px-5 py-4 grid grid-cols-2 gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <p className="text-lg font-heading font-bold" style={{ color: '#0ABFA3' }}>
              {state.stats.servedToday}
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Served</p>
          </div>
          <div>
            <p className="text-lg font-heading font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {state.queue.filter(c => c.status !== 'complete').length}
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Waiting</p>
          </div>
        </div>

        {/* Queue list */}
        <QueueSidebar />

        {/* Sidebar footer */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <OllamaStatus />
        </div>
      </aside>

      {/* ── Main Panel ──────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--surface)' }}>
        <StatsBar />
        <div className="flex-1 overflow-y-auto">
          {activeCustomer ? (
            <CustomerDetailPanel customer={activeCustomer} />
          ) : (
            <div className="flex-1 flex items-center justify-center h-full">
              <div className="text-center">
                <EmptyStateSVG />
                <p className="font-heading font-semibold text-lg mt-4" style={{ color: 'var(--navy-900)' }}>
                  Select a customer
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Choose a customer from the queue to begin service
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyStateSVG() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="mx-auto">
      <rect x="20" y="15" width="80" height="60" rx="8" fill="var(--surface-2)" stroke="var(--border)" strokeWidth="1.5"/>
      <rect x="32" y="30" width="20" height="3" rx="1.5" fill="var(--border-2)" />
      <rect x="32" y="38" width="40" height="3" rx="1.5" fill="var(--border)" />
      <rect x="32" y="46" width="30" height="3" rx="1.5" fill="var(--border)" />
      <rect x="32" y="54" width="35" height="3" rx="1.5" fill="var(--border)" />
      <circle cx="82" cy="35" r="8" fill="var(--navy-100)" stroke="var(--border-2)" strokeWidth="1" />
      <path d="M79 35l2 2 4-4" stroke="var(--navy-800)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="40" y="70" width="40" height="10" rx="5" fill="var(--navy-100)" />
      <rect x="50" y="73" width="20" height="4" rx="2" fill="var(--navy-800)" opacity="0.3" />
    </svg>
  );
}
