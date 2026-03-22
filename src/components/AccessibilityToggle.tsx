import React, { useState } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function AccessibilityToggle() {
  const [open, setOpen] = useState(false);
  const { state, dispatch } = useAccessibility();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm hover:shadow-md transition-all"
        style={{ border: '1.5px solid var(--border)', color: 'var(--navy-800)' }}
        aria-label="Accessibility Settings"
        title="Accessibility Settings"
      >
        <AccessibilitySVG size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/25 animate-fade-in" onClick={() => setOpen(false)} />
          <div className="relative bg-white w-[320px] h-full shadow-2xl flex flex-col animate-slide-right">
            {/* Teal left border accent */}
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'var(--teal)' }} />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--navy-100)', color: 'var(--navy-800)' }}
                >
                  <AccessibilitySVG size={16} />
                </div>
                <h3 className="font-heading font-semibold text-base" style={{ color: 'var(--navy-900)' }}>
                  Accessibility
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Info banner */}
            <div className="mx-6 mt-4 p-3 rounded-lg text-xs"
              style={{ background: 'var(--navy-100)', border: '1px solid var(--border)', color: 'var(--navy-800)' }}
            >
              These settings help customers with visual, motor, or cognitive accessibility needs.
            </div>

            {/* Settings */}
            <div className="flex-1 px-6 py-4 flex flex-col gap-1">
              <SettingRow label="Accessibility Mode" desc="Larger text and bigger buttons">
                <ToggleSwitch
                  active={state.isA11y}
                  onToggle={() => dispatch({ type: 'TOGGLE_A11Y' })}
                />
              </SettingRow>

              <Divider />

              <SettingRow label="Text Size" desc="Increase reading size">
                <select
                  value={state.textSize}
                  onChange={e => dispatch({ type: 'SET_TEXT_SIZE', size: e.target.value as any })}
                  className="input text-xs py-1.5 px-2.5 w-28"
                  style={{ height: '36px' }}
                >
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                  <option value="xl">Extra Large</option>
                </select>
              </SettingRow>

              <Divider />

              <SettingRow label="High Contrast" desc="Black background, yellow text">
                <ToggleSwitch
                  active={state.contrast === 'high'}
                  onToggle={() => dispatch({ type: 'SET_CONTRAST', contrast: state.contrast === 'high' ? 'standard' : 'high' })}
                />
              </SettingRow>

              <Divider />

              <SettingRow label="Voice Commands" desc="Navigate by speaking">
                <ToggleSwitch
                  active={state.voiceOnly}
                  onToggle={() => dispatch({ type: 'TOGGLE_VOICE_ONLY' })}
                />
              </SettingRow>

              <Divider />

              <SettingRow label="Disable Timeout" desc="No auto-logout pressure">
                <ToggleSwitch
                  active={state.noTimeout}
                  onToggle={() => dispatch({ type: 'TOGGLE_NO_TIMEOUT' })}
                />
              </SettingRow>
            </div>

            {/* Active confirmation strip */}
            {state.isA11y && (
              <div className="mx-6 mb-6 p-3 rounded-lg text-xs font-semibold flex items-center gap-2"
                style={{ background: 'var(--teal-light)', color: 'var(--teal-dark)' }}
              >
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                Accessibility mode is active
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Divider() {
  return <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />;
}

function SettingRow({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function ToggleSwitch({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={active}
      className="toggle-track shrink-0"
      style={{ background: active ? 'var(--navy-800)' : 'var(--border-2)' }}
    >
      <div
        className="toggle-thumb"
        style={{ transform: active ? 'translateX(20px)' : 'translateX(0)' }}
      />
    </button>
  );
}

function AccessibilitySVG({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <circle cx="12" cy="4" r="2" />
      <path d="M19 13v-2h-6l-2-4H9l-2 6h4l1 4H8v2h6l-1-4h2l2 4h2l-2-4h2z" />
    </svg>
  );
}
