import React, { useEffect, useState } from 'react';
import { useQueue } from '../../contexts/QueueContext';

interface Holiday { date: string; localName: string; name: string; }

export default function StatsBar() {
  const { state } = useQueue();
  const [branchStatus, setBranchStatus] = useState<{ label: string; dotColor: string; textColor: string }>({
    label: 'Checking...', dotColor: '#94A3B8', textColor: 'var(--text-muted)',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('https://date.nager.at/api/v3/PublicHolidays/2025/IN', {
          signal: AbortSignal.timeout(5000),
        });
        const holidays: Holiday[] = await res.json();
        const today = new Date().toISOString().slice(0, 10);
        const holiday = holidays.find(h => h.date === today);
        if (holiday) {
          setBranchStatus({ label: `Holiday: ${holiday.localName}`, dotColor: '#D97706', textColor: '#92400E' });
        } else {
          setBranchStatus({ label: 'Branch Open', dotColor: '#22C55E', textColor: '#15803D' });
        }
      } catch {
        setBranchStatus({ label: 'Status Unknown', dotColor: '#94A3B8', textColor: 'var(--text-muted)' });
      }
    })();
  }, []);

  const pendingCount = state.queue.filter(c => c.status !== 'complete').length;

  const stats = [
    {
      label: 'Served Today',
      value: state.stats.servedToday.toString(),
      icon: <CheckCircleSVG />,
      color: '#15803D',
      bg: 'var(--green-light)',
    },
    {
      label: 'Avg Service Time',
      value: state.stats.avgServiceMinutes > 0 ? `${state.stats.avgServiceMinutes} min` : '—',
      icon: <ClockSVG />,
      color: 'var(--navy-900)',
      bg: 'var(--surface)',
    },
    {
      label: 'Queue Now',
      value: pendingCount.toString(),
      icon: <PeopleSVG />,
      color: pendingCount > 3 ? '#C2410C' : 'var(--navy-900)',
      bg: pendingCount > 3 ? '#FFF7ED' : 'var(--surface)',
    },
    {
      label: 'Branch Status',
      value: branchStatus.label,
      icon: <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: branchStatus.dotColor }} />,
      color: branchStatus.textColor,
      bg: 'var(--surface)',
    },
  ];

  return (
    <div
      className="grid gap-4 px-6 py-4"
      style={{ gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid var(--border)', background: 'white' }}
    >
      {stats.map(s => (
        <div
          key={s.label}
          className="rounded-xl p-4"
          style={{ background: s.bg, border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            {s.icon}
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
          <p className="font-heading font-bold text-xl leading-none" style={{ color: s.color }}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}

function CheckCircleSVG() {
  return (
    <svg width="16" height="16" fill="none" stroke="#16A34A" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockSVG() {
  return (
    <svg width="16" height="16" fill="none" stroke="var(--text-muted)" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PeopleSVG() {
  return (
    <svg width="16" height="16" fill="none" stroke="var(--text-muted)" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
