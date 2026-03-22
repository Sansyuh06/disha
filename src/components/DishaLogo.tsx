import React from 'react';

type LogoVariant = 'full' | 'mark' | 'light';

interface DishaLogoProps {
  variant?: LogoVariant;
  size?: number;
  className?: string;
}

/**
 * DISHA Logo — Original geometric mark.
 * A "D" shape (vertical bar + arc) with a compass needle (↗) cutting through.
 * Navy + Teal only. Zero copyright risk — purely geometric.
 *
 * Variants:
 *  - full:  mark + "DISHA" text (default)
 *  - mark:  icon only
 *  - light: white version for dark backgrounds
 */
export default function DishaLogo({ variant = 'full', size = 40, className = '' }: DishaLogoProps) {
  const navy = variant === 'light' ? '#FFFFFF' : '#0D1B3E';
  const teal = '#0ABFA3';
  const textColor = variant === 'light' ? '#FFFFFF' : '#0D1B3E';

  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={variant === 'mark' ? className : ''}
    >
      {/* D shape: vertical bar */}
      <rect x="10" y="6" width="6" height="36" rx="2" fill={navy} />
      {/* D shape: arc */}
      <path
        d="M16 6 C16 6, 40 6, 40 24 C40 42, 16 42, 16 42"
        stroke={navy}
        strokeWidth="5.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Compass needle ↗ — two lines forming an arrow through the D */}
      <line x1="14" y1="36" x2="36" y2="12" stroke={teal} strokeWidth="3" strokeLinecap="round" />
      <line x1="36" y1="12" x2="28" y2="13" stroke={teal} strokeWidth="3" strokeLinecap="round" />
      <line x1="36" y1="12" x2="35" y2="20" stroke={teal} strokeWidth="3" strokeLinecap="round" />
      {/* Small teal dot at compass origin */}
      <circle cx="14" cy="36" r="2.5" fill={teal} />
    </svg>
  );

  if (variant === 'mark') return mark;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {mark}
      <div className="flex flex-col">
        <span
          className="font-heading font-extrabold tracking-tight leading-none"
          style={{ fontSize: size * 0.55, color: textColor, letterSpacing: '-0.02em' }}
        >
          DISHA
        </span>
        {size >= 32 && (
          <span
            className="font-body leading-none"
            style={{
              fontSize: Math.max(9, size * 0.22),
              color: variant === 'light' ? 'rgba(255,255,255,0.6)' : '#64748B',
              fontWeight: 500,
              letterSpacing: '0.04em',
            }}
          >
            Digital Self-service Hub
          </span>
        )}
      </div>
    </div>
  );
}
