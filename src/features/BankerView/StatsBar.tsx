import React, { useEffect, useState } from 'react';

interface Holiday { date: string; localName: string; name: string; }

export default function StatsBar() {
  const [branchStatus, setBranchStatus] = useState<{ label: string; color: string; dot: string }>({
    label: 'Checking...', color: '#64748B', dot: '#94A3B8',
  });

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('https://date.nager.at/api/v3/PublicHolidays/2025/IN', {
          signal: AbortSignal.timeout(5000),
        });
        const holidays: Holiday[] = await res.json();
        const today = new Date().toISOString().slice(0, 10);
        const holiday = holidays.find(h => h.date === today);
        if (holiday) {
          setBranchStatus({ label: `Bank Holiday: ${holiday.localName}`, color: '#D97706', dot: '#F59E0B' });
        } else {
          setBranchStatus({ label: 'Branch Open', color: '#15803D', dot: '#16A34A' });
        }
      } catch {
        setBranchStatus({ label: 'Status Unknown', color: '#64748B', dot: '#94A3B8' });
      }
    };
    check();
  }, []);

  const stats = [
    { label: 'Served Today', value: '8', icon: '✅' },
    { label: 'Avg Service Time', value: '22 min', icon: '⏱' },
    { label: 'Queue Now', value: '5', icon: '👥' },
    { label: 'Branch Status', value: branchStatus.label, icon: '🏢', color: branchStatus.color, dot: branchStatus.dot },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100 bg-white">
      {stats.map(s => (
        <div key={s.label} className="bg-surface rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">{s.icon}</span>
            {s.dot && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.dot }} />}
          </div>
          <p className="font-heading font-bold text-lg text-brand-dark" style={{ color: s.color ?? 'var(--brand-dark)' }}>
            {s.value}
          </p>
          <p className="text-xs text-brand-muted">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
