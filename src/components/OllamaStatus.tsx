import React, { useEffect, useState } from 'react';
import { checkOllamaStatus } from '../utils/ollama';

export default function OllamaStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const check = async () => {
      const ok = await checkOllamaStatus();
      setStatus(ok ? 'online' : 'offline');
    };
    check();
    const interval = setInterval(check, 30000); // re-check every 30s
    return () => clearInterval(interval);
  }, []);

  const label = status === 'online' ? 'AI ready' : status === 'offline' ? 'Start Ollama: ollama serve' : 'Checking...';
  const dotColor = status === 'online' ? '#16A34A' : status === 'offline' ? '#DC2626' : '#F59E0B';

  return (
    <div className="relative group flex items-center gap-2 text-xs text-brand-muted cursor-default">
      <div
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: dotColor, boxShadow: status === 'online' ? `0 0 6px ${dotColor}` : 'none' }}
      />
      <span className="hidden group-hover:block absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50">
        {label}
      </span>
    </div>
  );
}
