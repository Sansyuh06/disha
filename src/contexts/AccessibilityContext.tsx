import React, { createContext, useContext, useEffect, useReducer, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface A11yState {
  isA11y: boolean;
  textSize: 'normal' | 'large' | 'xl';
  contrast: 'standard' | 'high';
  voiceOnly: boolean;
  noTimeout: boolean;
}

type A11yAction =
  | { type: 'TOGGLE_A11Y' }
  | { type: 'SET_TEXT_SIZE'; size: A11yState['textSize'] }
  | { type: 'SET_CONTRAST'; contrast: A11yState['contrast'] }
  | { type: 'TOGGLE_VOICE_ONLY' }
  | { type: 'TOGGLE_NO_TIMEOUT' };

const initialState: A11yState = {
  isA11y: false,
  textSize: 'normal',
  contrast: 'standard',
  voiceOnly: false,
  noTimeout: false,
};

function reducer(state: A11yState, action: A11yAction): A11yState {
  switch (action.type) {
    case 'TOGGLE_A11Y': return { ...state, isA11y: !state.isA11y };
    case 'SET_TEXT_SIZE': return { ...state, textSize: action.size };
    case 'SET_CONTRAST': return { ...state, contrast: action.contrast };
    case 'TOGGLE_VOICE_ONLY': return { ...state, voiceOnly: !state.voiceOnly };
    case 'TOGGLE_NO_TIMEOUT': return { ...state, noTimeout: !state.noTimeout };
    default: return state;
  }
}

interface A11yContextType {
  state: A11yState;
  dispatch: React.Dispatch<A11yAction>;
  showTimeoutDialog: boolean;
  setShowTimeoutDialog: (v: boolean) => void;
  resetTimer: () => void;
}

const AccessibilityContext = createContext<A11yContextType | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showTimeoutDialog, setShowTimeoutDialog] = React.useState(false);
  const [countdown, setCountdown] = React.useState(60);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMessageRef = useRef<string>('');

  // Apply CSS classes to <html>
  useEffect(() => {
    const html = document.documentElement;
    if (state.isA11y) {
      html.classList.add('a11y-mode');
    } else {
      html.classList.remove('a11y-mode');
    }
    if (state.contrast === 'high') {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }
  }, [state.isA11y, state.contrast]);

  // Apply text size scale
  useEffect(() => {
    const scale = state.textSize === 'xl' ? '1.4' : state.textSize === 'large' ? '1.2' : '1';
    document.documentElement.style.setProperty('--a11y-scale', scale);
  }, [state.textSize]);

  const resetTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    setShowTimeoutDialog(false);
    setCountdown(60);
    if (!state.isA11y && !state.noTimeout) {
      idleTimer.current = setTimeout(() => {
        setShowTimeoutDialog(true);
        let c = 60;
        countdownInterval.current = setInterval(() => {
          c -= 1;
          setCountdown(c);
          if (c <= 0) {
            clearInterval(countdownInterval.current!);
            window.location.href = '/';
          }
        }, 1000);
      }, 5 * 60 * 1000); // 5 minutes
    }
  }, [state.isA11y, state.noTimeout]);

  // Session timeout tracking
  useEffect(() => {
    if (state.isA11y || state.noTimeout) {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
      setShowTimeoutDialog(false);
      return;
    }
    const events = ['mousemove', 'keydown', 'touchstart', 'click'];
    events.forEach(e => document.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      events.forEach(e => document.removeEventListener(e, resetTimer));
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [state.isA11y, state.noTimeout, resetTimer]);

  // Store last message for "repeat" voice command
  const storeLastMessage = useCallback((msg: string) => {
    lastMessageRef.current = msg;
  }, []);

  return (
    <AccessibilityContext.Provider value={{ state, dispatch, showTimeoutDialog, setShowTimeoutDialog, resetTimer }}>
      {children}
      {showTimeoutDialog && !state.isA11y && !state.noTimeout && (
        <SessionTimeoutDialog countdown={countdown} onStay={resetTimer} />
      )}
    </AccessibilityContext.Provider>
  );
}

function SessionTimeoutDialog({ countdown, onStay }: { countdown: number; onStay: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
        <h3 className="text-xl font-heading font-semibold mb-2" style={{ color: 'var(--navy-900)' }}>Are you still there?</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          Session ends in <span className="font-bold text-lg" style={{ color: 'var(--amber)' }}>{countdown}</span> seconds.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onStay}
            className="flex-1 text-white rounded-lg py-3 font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--teal)' }}
          >
            I'm still here
          </button>
          <button
            onClick={() => { window.location.href = '/'; }}
            className="flex-1 border border-gray-200 rounded-lg py-3 hover:bg-gray-50 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            End session
          </button>
        </div>
      </div>
    </div>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
}
