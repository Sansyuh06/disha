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

  // Arc is 270 degrees. Start at 135deg (bottom-left), end at 45deg (bottom-right)
  const RADIUS = 70;
  const CX = 90;
  const CY = 90;

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
  const fillLargeArc = clampedValue > 50 ? 1 : 0;

  const arcColor = clampedValue >= 70 ? '#16A34A' : clampedValue >= 40 ? '#F59E0B' : '#DC2626';

  const needleAngle = startAngle + (clampedValue / 100) * totalArc;
  const needleTip = {
    x: CX + (RADIUS - 10) * Math.cos(toRad(needleAngle)),
    y: CY + (RADIUS - 10) * Math.sin(toRad(needleAngle)),
  };

  const incomeMultiple = projectedEMI > 0 ? (income / projectedEMI).toFixed(1) : '—';

  return (
    <div className="flex flex-col items-center">
      <svg width={180} height={130} viewBox="0 0 180 130">
        {/* Background arc */}
        <path
          d={`M ${bgStart.x} ${bgStart.y} A ${RADIUS} ${RADIUS} 0 1 1 ${bgEnd.x} ${bgEnd.y}`}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={14}
          strokeLinecap="round"
        />
        {/* Fill arc */}
        {clampedValue > 0 && (
          <path
            d={`M ${bgStart.x} ${bgStart.y} A ${RADIUS} ${RADIUS} 0 ${fillLargeArc} 1 ${fillEnd.x} ${fillEnd.y}`}
            fill="none"
            stroke={arcColor}
            strokeWidth={14}
            strokeLinecap="round"
            style={{ transition: 'all 0.4s ease' }}
          />
        )}
        {/* Needle */}
        <line
          x1={CX} y1={CY}
          x2={needleTip.x} y2={needleTip.y}
          stroke={arcColor}
          strokeWidth={3}
          strokeLinecap="round"
          style={{ transition: 'all 0.4s ease' }}
        />
        <circle cx={CX} cy={CY} r={5} fill={arcColor} />
        {/* Center value */}
        <text x={CX} y={CY + 22} textAnchor="middle" fontSize={22} fontWeight="bold" fill={arcColor} fontFamily="Plus Jakarta Sans, sans-serif">
          {Math.round(clampedValue)}%
        </text>
        <text x={CX} y={CY + 36} textAnchor="middle" fontSize={9} fill="#94A3B8" fontFamily="Inter, sans-serif">
          eligibility score
        </text>
      </svg>

      {/* Metric pills */}
      <div className="flex gap-2 flex-wrap justify-center mt-2">
        <MetricPill label="DTI" value={`${dti.toFixed(0)}%`} warn={dti > 50} />
        <MetricPill label="CIBIL" value={cibil.toString()} warn={cibil < 650} />
        <MetricPill label="Income ×" value={`${incomeMultiple}x`} warn={Number(incomeMultiple) < 3} />
      </div>
    </div>
  );
}

function MetricPill({ label, value, warn }: { label: string; value: string; warn: boolean }) {
  return (
    <div
      className="text-xs px-3 py-1 rounded-full font-medium"
      style={{
        backgroundColor: warn ? '#FFF7ED' : '#F0FDF4',
        color: warn ? '#C2410C' : '#15803D',
        border: `1px solid ${warn ? '#FED7AA' : '#BBF7D0'}`,
      }}
    >
      {label}: {value}
    </div>
  );
}
