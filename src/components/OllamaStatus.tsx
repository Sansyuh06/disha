import React, { useEffect, useState } from 'react';
import { checkOllamaStatus } from '../utils/ollama';

export default function OllamaStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    checkOllamaStatus().then(ok => setStatus(ok ? 'online' : 'offline'));
    const interval = setInterval(() => {
      checkOllamaStatus().then(ok => setStatus(ok ? 'online' : 'offline'));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const config = {
    checking: { dot: '#94A3B8', label: 'Checking AI...', bg: 'rgba(148,163,184,0.1)', text: '#7B8AB8', border: 'rgba(148,163,184,0.2)' },
    online:   { dot: '#22C55E', label: 'AI Ready',        bg: 'rgba(34,197,94,0.08)',   text: '#16A34A', border: 'rgba(34,197,94,0.2)' },
    offline:  { dot: '#EF4444', label: 'Start Ollama',    bg: 'rgba(239,68,68,0.08)',   text: '#DC2626', border: 'rgba(239,68,68,0.2)' },
  }[status];

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{ background: config.bg, color: config.text, border: `1px solid ${config.border}` }}
      title={status === 'offline' ? 'Run: ollama serve' : 'Ollama is running'}
    >
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{
          backgroundColor: config.dot,
          boxShadow: status === 'online' ? `0 0 8px ${config.dot}` : 'none',
          animation: status === 'online' ? 'pulse 2s infinite' : 'none',
        }}
      />
      {config.label}
    </div>
  );
}
