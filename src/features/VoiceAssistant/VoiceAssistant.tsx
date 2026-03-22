import React, { useState, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LANGUAGES } from '../../utils/languages';
import { askOllama } from '../../utils/ollama';
import { translate } from '../../utils/libretranslate';
import LanguageGrid from './LanguageGrid';
import ConversationBubbles from './ConversationBubbles';
import { Language } from '../../utils/languages';

type MicState = 'idle' | 'listening' | 'processing' | 'speaking';

export interface Message {
  role: 'user' | 'assistant';
  text: string;
  lang: string;
  langFlag: string;
  id: string;
}

export default function VoiceAssistant() {
  const { language } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<Language>(language);
  const [micState, setMicState] = useState<MicState>('idle');
  const [statusText, setStatusText] = useState('Tap to speak');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const lastAnswerRef = useRef<string>('');

  const addMessage = (msg: Message) => setMessages(prev => [...prev, msg]);

  const reSpeak = (text: string, lang: string) => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    utt.rate = 0.9;
    window.speechSynthesis.speak(utt);
  };

  const handleVoiceQuery = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setError('Speech recognition requires Chrome browser.');
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = selectedLang.code;
    recognition.continuous = false;
    recognition.interimResults = false;
    setError(null);
    setMicState('listening');
    setStatusText('Listening...');

    recognition.onresult = async (event: any) => {
      const spokenText = event.results[0][0].transcript as string;
      addMessage({ role: 'user', text: spokenText, lang: selectedLang.code, langFlag: selectedLang.flag, id: `u${Date.now()}` });
      setMicState('processing');
      setStatusText('Thinking...');

      try {
        const englishQuery = selectedLang.code !== 'en'
          ? await translate(spokenText, selectedLang.code, 'en')
          : spokenText;

        const englishAnswer = await askOllama(
          `You are a helpful Union Bank of India branch assistant. A customer asks: "${englishQuery}" Give a clear, helpful answer in 2-3 sentences. Be specific about which counter to go to or what documents to bring if relevant. Do not use jargon.`,
          { timeout: 20000 }
        );

        const localAnswer = selectedLang.code !== 'en'
          ? await translate(englishAnswer, 'en', selectedLang.code)
          : englishAnswer;

        lastAnswerRef.current = localAnswer;
        addMessage({ role: 'assistant', text: localAnswer, lang: selectedLang.code, langFlag: selectedLang.flag, id: `a${Date.now()}` });

        setMicState('speaking');
        setStatusText('Speaking...');
        const utterance = new SpeechSynthesisUtterance(localAnswer);
        utterance.lang = selectedLang.code;
        utterance.rate = 0.9;
        utterance.onend = () => { setMicState('idle'); setStatusText('Tap to speak'); };
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        setMicState('idle');
        setStatusText('Tap to speak');
        setError('Could not process request. Please try again.');
      }
    };

    recognition.onerror = (e: any) => {
      setMicState('idle');
      setStatusText('Tap to speak');
      if (e.error === 'no-speech') setError('No speech detected. Try again.');
      else if (e.error === 'not-allowed') setError('Microphone access denied.');
      else setError(`Microphone error: ${e.error}`);
    };

    recognition.start();
  };

  const micColors: Record<MicState, string> = {
    idle: 'var(--brand-teal)',
    listening: '#16A34A',
    processing: '#3B82F6',
    speaking: '#3B82F6',
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-semibold text-brand-dark mb-1">Voice Assistant</h1>
        <p className="text-brand-muted text-sm">Speak in your language — get answers instantly</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-xs font-medium text-brand-muted uppercase tracking-wide mb-3">Choose your language</p>
            <LanguageGrid selected={selectedLang} onSelect={setSelectedLang} />
          </div>

          {/* Mic button */}
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="relative">
              {micState === 'listening' && (
                <>
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="absolute inset-0 rounded-full"
                      style={{
                        border: `2px solid ${micColors.listening}`,
                        animation: `sonar 1.5s ease-out infinite`,
                        animationDelay: `${(i - 1) * 0.4}s`,
                      }}
                    />
                  ))}
                </>
              )}
              <button
                onClick={micState === 'idle' ? handleVoiceQuery : undefined}
                disabled={micState === 'processing'}
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'white',
                  border: `3px solid ${micColors[micState]}`,
                  color: micColors[micState],
                }}
              >
                {micState === 'processing' ? (
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : micState === 'speaking' ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12M8.464 8.464a5 5 0 000 7.072" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-sm text-brand-muted">{statusText}</p>

            {error && (
              <div className="w-full bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 text-center">
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h3 className="font-heading font-semibold text-sm text-brand-dark">Conversation</h3>
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="text-xs text-brand-muted hover:text-red-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          <ConversationBubbles messages={messages} onReSpeak={reSpeak} />
        </div>
      </div>
    </div>
  );
}
