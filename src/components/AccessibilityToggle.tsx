import React, { useState } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function AccessibilityToggle() {
  const [open, setOpen] = useState(false);
  const { state, dispatch } = useAccessibility();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-12 h-12 rounded-full border-2 bg-white shadow-md hover:shadow-lg transition-all"
        style={{ borderColor: 'var(--brand-teal)', color: 'var(--brand-teal)' }}
        aria-label="Accessibility Settings"
        title="Accessibility Settings"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <circle cx="12" cy="4" r="2" />
          <path d="M19 13v-2h-6l-2-4H9l-2 6h4l1 4H8v2h6l-1-4h2l2 4h2l-2-4h2z" />
        </svg>
      </button>

      {/* Slide-in sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative bg-white w-80 h-full shadow-2xl p-6 flex flex-col gap-5 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-lg text-brand-dark">Accessibility Settings</h3>
              <button onClick={() => setOpen(false)} className="text-brand-muted hover:text-brand-dark">✕</button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              These settings help people with visual, motor, or cognitive accessibility needs.
            </div>

            {/* Accessibility Mode */}
            <SettingRow label="Accessibility Mode" desc="Larger text and buttons">
              <Toggle active={state.isA11y} onToggle={() => dispatch({ type: 'TOGGLE_A11Y' })} />
            </SettingRow>

            {/* Text Size */}
            <SettingRow label="Text Size" desc="">
              <select
                value={state.textSize}
                onChange={e => dispatch({ type: 'SET_TEXT_SIZE', size: e.target.value as 'normal' | 'large' | 'xl' })}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5"
              >
                <option value="normal">Normal</option>
                <option value="large">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </SettingRow>

            {/* High Contrast */}
            <SettingRow label="High Contrast" desc="Yellow on black">
              <Toggle
                active={state.contrast === 'high'}
                onToggle={() => dispatch({ type: 'SET_CONTRAST', contrast: state.contrast === 'high' ? 'standard' : 'high' })}
              />
            </SettingRow>

            {/* Voice Command Mode */}
            <SettingRow label="Voice Command Mode" desc="Navigate by speaking">
              <Toggle active={state.voiceOnly} onToggle={() => dispatch({ type: 'TOGGLE_VOICE_ONLY' })} />
            </SettingRow>

            {/* Disable Timeout */}
            <SettingRow label="Disable Session Timeout" desc="No auto-logout">
              <Toggle active={state.noTimeout} onToggle={() => dispatch({ type: 'TOGGLE_NO_TIMEOUT' })} />
            </SettingRow>
          </div>
        </div>
      )}
    </>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-brand-dark">{label}</p>
        {desc && <p className="text-xs text-brand-muted">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative w-12 h-6 rounded-full transition-colors"
      style={{ backgroundColor: active ? 'var(--brand-teal)' : '#E2E8F0' }}
      role="switch"
      aria-checked={active}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
        style={{ transform: active ? 'translateX(24px)' : 'translateX(0)' }}
      />
    </button>
  );
}
