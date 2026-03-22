import React, { useEffect, useRef } from 'react';
import { Message } from './VoiceAssistant';

interface Props {
  messages: Message[];
  onReSpeak: (text: string, lang: string) => void;
}

export default function ConversationBubbles({ messages, onReSpeak }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-5xl mb-4">🎙️</div>
        <p className="text-sm text-brand-muted leading-relaxed">
          Tap the microphone and speak in your language
        </p>
        <div className="flex gap-1 mt-4 flex-wrap justify-center">
          {['🇬🇧', '🇮🇳', '🇸🇦', '🇫🇷', '🇩🇪'].map(f => (
            <span key={f} className="text-xl">{f}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[480px]">
      {messages.map(msg => (
        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
          {msg.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 self-end mb-5" style={{ backgroundColor: 'var(--brand-teal)' }}>
              <span className="text-white text-xs font-bold">D</span>
            </div>
          )}
          <div className="max-w-[80%]">
            <div
              className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
              style={
                msg.role === 'user'
                  ? { backgroundColor: 'var(--brand-teal)', color: 'white', borderBottomRightRadius: 4 }
                  : { backgroundColor: 'white', color: 'var(--brand-dark)', border: '1px solid #E2E8F0', borderBottomLeftRadius: 4 }
              }
            >
              {msg.text}
            </div>
            <div className={`flex items-center gap-1 mt-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <span className="text-xs text-brand-muted">{msg.langFlag} {msg.lang}</span>
              {msg.role === 'assistant' && (
                <>
                  <button
                    onClick={() => onReSpeak(msg.text, msg.lang)}
                    className="text-xs text-brand-muted hover:text-brand-teal transition-colors px-1.5 py-0.5 rounded hover:bg-gray-100"
                    title="Read again"
                  >
                    🔊
                  </button>
                  <button
                    onClick={() => copyToClipboard(msg.text)}
                    className="text-xs text-brand-muted hover:text-brand-teal transition-colors px-1.5 py-0.5 rounded hover:bg-gray-100"
                    title="Copy"
                  >
                    📋
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
