import React from 'react';

interface Props {
  value: number; // 0–100
  dti: number;
  cibil: number;
  income: number;
  projectedEMI: number;
}

export default function EligibilityMeter({ value, dti, cibil, income, projectedEMI }: Props) {
  const clampedValue = Math.min(100, Math.max(0, value));

  // Arc math
  const RADIUS = 85;
  const CX = 120;
  const CY = 110;
  const STROKE_WIDTH = 18;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const startAngle = 135;
  const totalArc = 270;

  const angleForValue = (v: number) => startAngle + (v / 100) * totalArc;
  const polarToCart = (angle: number) => ({
    x: CX + RADIUS * Math.cos(toRad(angle)),
    y: CY + RADIUS * Math.sin(toRad(angle)),
  });

  const bgStart = polarToCart(startAngle);
  const bgEnd = polarToCart(startAngle + totalArc);

  const fillAngle = angleForValue(clampedValue);
  const fillEnd = polarToCart(fillAngle);
  const sweepAngle = (clampedValue / 100) * totalArc;
  const fillLargeArc = sweepAngle > 180 ? 1 : 0;

  // Premium colors
  const isExcellent = clampedValue >= 75;
  const isGood = clampedValue >= 60;
  const isFair = clampedValue >= 40;

  const primaryColor = isExcellent ? '#10B981' : isGood ? '#0ABFA3' : isFair ? '#F59E0B' : '#EF4444';
  const glowColor = isExcellent ? 'rgba(16,185,129,0.3)' : isGood ? 'rgba(10,191,163,0.3)' : isFair ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)';

  const needleAngle = startAngle + (clampedValue / 100) * totalArc;
  const needleTip = {
    x: CX + (RADIUS - STROKE_WIDTH - 5) * Math.cos(toRad(needleAngle)),
    y: CY + (RADIUS - STROKE_WIDTH - 5) * Math.sin(toRad(needleAngle)),
  };

  const incomeMultiple = projectedEMI > 0 ? (income / projectedEMI).toFixed(1) : '—';
  
  // Custom dial color mapping to tailwind hexes
  const trackGradientId = `track-gradient-${Math.floor(Math.random() * 1000)}`;

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative">
        <svg width={240} height={150} viewBox="0 0 240 150" className="overflow-visible">
          <defs>
            <filter id="dial-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id={trackGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#0ABFA3" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <path
            d={`M ${bgStart.x} ${bgStart.y} A ${RADIUS} ${RADIUS} 0 1 1 ${bgEnd.x} ${bgEnd.y}`}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
          />

          {/* Active Fill Arc */}
          {clampedValue > 0 && (
            <path
              d={`M ${bgStart.x} ${bgStart.y} A ${RADIUS} ${RADIUS} 0 ${fillLargeArc} 1 ${fillEnd.x} ${fillEnd.y}`}
              fill="none"
              stroke={`url(#${trackGradientId})`}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              filter="url(#dial-glow)"
              style={{ transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
            />
          )}

          {/* Needle Base */}
          <circle cx={CX} cy={CY + 5} r={14} fill="#FFFFFF" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))" />
          <circle cx={CX} cy={CY + 5} r={8} fill={primaryColor} style={{ transition: 'all 0.8s ease' }} />

          {/* Needle Pointer */}
          <g style={{ transition: 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)', transformOrigin: `${CX}px ${CY + 5}px`, transform: `rotate(${needleAngle + 90}deg)` }}>
            <polygon
              points={`${CX - 4},${CY + 5} ${CX + 4},${CY + 5} ${CX},${CY - RADIUS + STROKE_WIDTH + 8}`}
              fill={primaryColor}
            />
          </g>
          
          {/* Main Score Text */}
          <text 
            x={CX} 
            y={CY + 45} 
            textAnchor="middle" 
            fontSize={36} 
            fontWeight="800"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fill={primaryColor}
            style={{ transition: 'fill 0.8s ease' }}
          >
            {Math.round(clampedValue)}%
          </text>
        </svg>
      </div>

      <div className="text-center mt-3 mb-6">
        <p className="text-sm font-semibold text-[var(--navy-900)] uppercase tracking-wide">Approval Odds</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Required: 65% for standard rates</p>
      </div>

      {/* Metric pills - Premium design */}
      <div className="w-full flex gap-3 flex-wrap justify-center mt-2 px-2">
        <MetricCard label="Debt-to-Income" value={`${dti.toFixed(0)}%`} warn={dti > 50} />
        <MetricCard label="CIBIL Score" value={cibil.toString()} warn={cibil < 650} />
        <MetricCard label="Income Ratio" value={`${incomeMultiple}x`} warn={Number(incomeMultiple) < 3} subtitle="of EMI" />
      </div>
    </div>
  );
}

function MetricCard({ label, value, warn, subtitle }: { label: string; value: string; warn: boolean; subtitle?: string }) {
  return (
    <div
      className="flex-1 min-w-[100px] border rounded-xl p-3 flex flex-col items-center shadow-sm"
      style={{
        backgroundColor: warn ? '#FEF2F2' : '#FFFFFF',
        borderColor: warn ? '#FECACA' : '#E2E8F0',
      }}
    >
      <p className="text-[10px] uppercase tracking-wider font-semibold text-center mb-1" style={{ color: warn ? '#B91C1C' : '#64748B' }}>
        {label}
      </p>
      <p className="font-heading font-bold text-lg" style={{ color: warn ? '#DC2626' : 'var(--navy-900)' }}>
        {value}
      </p>
      {subtitle && <p className="text-[10px] text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}
