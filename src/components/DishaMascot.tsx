// src/components/DishaMascot.tsx
// DISHA AI persona — animated mascot with voice, intent detection, and auto-routing.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomer } from '../contexts/CustomerContext';
import { useQueue } from '../contexts/QueueContext';
import { useLanguage } from '../contexts/LanguageContext';
import { analyzeIntent } from '../utils/intentEngine';
import { runAgent } from '../utils/agentRunner';
import { speakWithVita, checkVitaStatus } from '../utils/vita';
import { translate } from '../utils/libretranslate';
import { motion, AnimatePresence } from 'framer-motion';

type MascotPhase = 'idle' | 'listening' | 'thinking' | 'acting' | 'done' | 'error';

interface Props {
  onSessionReady?: () => void;
}

export default function DishaMascot({ onSessionReady }: Props) {
  const navigate = useNavigate();
  const { dispatch: customerDispatch, state: customerState } = useCustomer();
  const { dispatch: queueDispatch } = useQueue();
  const { language } = useLanguage();
  const [phase, setPhase] = useState<MascotPhase>('idle');
  const [userText, setUserText] = useState('');
  const [mascotText, setMascotText] = useState("Hello! I'm DISHA. Tell me how I can help you today.");
  const [stepsLog, setStepsLog] = useState<string[]>([]);
  const [vitaReady, setVitaReady] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    checkVitaStatus().then(setVitaReady);
  }, []);

  const addStep = (s: string) => setStepsLog(prev => [...prev, s]);

  const handleMic = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) { setUserText(''); inputRef.current?.focus(); return; }
    const rec = new SpeechRec();
    rec.lang = language.code;
    rec.interimResults = true; // Make it dynamic
    
    rec.onresult = (e: any) => {
      let transcript = '';
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setUserText(transcript);
    };
    rec.onerror = () => setMicActive(false);
    rec.onend = () => setMicActive(false);
    setMicActive(true);
    rec.start();
  };

  const handleSubmit = async () => {
    if (!userText.trim()) return;
    setPhase('thinking');
    setStepsLog([]);
    addStep('Analyzing your request...');

    try {
      // 1. Translate input to English if needed
      const englishInput = language.code !== 'en'
        ? await translate(userText, language.code, 'en')
        : userText;

      // 2. Analyze intent
      addStep('Understanding your intent...');
      const profile = await analyzeIntent(englishInput);
      customerDispatch({ type: 'SET_INTENT', profile });
      addStep(`Detected: ${profile.intent} (${Math.round(profile.confidence * 100)}% confidence)`);

      // 3. Run agent
      setPhase('acting');
      addStep('Preparing your personalised journey...');
      const agentResult = await runAgent(profile, customerState.scannedData?.full_name ?? undefined);

      // 4. Store journey
      if (agentResult.journey) {
        customerDispatch({ type: 'SET_JOURNEY', journey: agentResult.journey });
        addStep('Branch journey created');
      }

      // 5. Notify banker queue
      if (agentResult.bankerNotification) {
        const token = `A0${46 + Math.floor(Math.random() * 10)}`;
        customerDispatch({ type: 'SET_TOKEN', token });
        queueDispatch({
          type: 'ADD_CUSTOMER',
          customer: {
            token,
            name: customerState.scannedData?.full_name ?? 'Walk-in Customer',
            task: profile.intent,
            taskType: (profile.taskType as any) ?? 'query',
            docsScanned: customerState.scannedData ? 1 : 0,
            docsTotal: agentResult.documents?.length ?? 2,
            language: language.code,
            languageFlag: language.flag,
            isA11y: false,
            isBereavement: profile.emotion === 'bereavement',
            arrivedAt: new Date(),
            status: 'waiting',
            aiSuggestion: agentResult.bankerNotification,
          },
        });
        addStep('Banker dashboard notified');
      }

      // 6. Speak the result
      const bannerText = agentResult.banner ?? 'I have prepared everything for you.';
      const localBanner = language.code !== 'en'
        ? await translate(bannerText, 'en', language.code)
        : bannerText;
      setMascotText(localBanner);
      await speakWithVita(bannerText, { voice: profile.emotion === 'bereavement' ? 'bf_emma' : 'af_heart' });

      addStep('All done — navigating now');
      setPhase('done');

      // 7. Navigate after short delay
      setTimeout(() => {
        navigate(agentResult.route);
        onSessionReady?.();
      }, 1800);

    } catch (err) {
      setPhase('error');
      setMascotText('I had trouble understanding that. Please try again or use the menu.');
      speakWithVita('I had trouble understanding that. Please try the menu.', { voice: 'af_heart' });
    }
  };

  const ringColor = {
    idle: '#0ABFA3', listening: '#22C55E', thinking: '#1B3A8E',
    acting: '#7C5CBF', done: '#16A34A', error: '#DC2626',
  }[phase];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px 0', maxWidth: '420px', margin: '0 auto' }}>

      {/* Row: Avatar + Speech bubble */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', width: '100%' }}>
        {/* Compact Mascot Avatar */}
        <div style={{ position: 'relative', width: '52px', height: '52px', flexShrink: 0 }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: phase === 'idle' ? 'linear-gradient(135deg, #0D1B3E, #1B3A8E)' : `linear-gradient(135deg, ${ringColor}22, ${ringColor}55)`,
            border: `2.5px solid ${ringColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.4s ease',
            boxShadow: `0 0 12px ${ringColor}33`,
          }}>
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <rect x="10" y="9" width="3.5" height="22" rx="1.75" fill="white" />
              <path d="M13.5 9 Q30 9 30 20 Q30 31 13.5 31" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <line x1="15" y1="27" x2="26" y2="14" stroke="#0ABFA3" strokeWidth="3" strokeLinecap="round" />
              <path d="M26 14 L21 14 M26 14 L26 19" stroke="#0ABFA3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{
            position: 'absolute', bottom: '0px', right: '0px',
            width: '12px', height: '12px', borderRadius: '50%',
            background: phase === 'done' ? '#16A34A' : phase === 'error' ? '#DC2626' : ringColor,
            border: '2px solid white', transition: 'background 0.3s',
          }} />
        </div>

        {/* Speech bubble */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mascotText}
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            style={{
              flex: 1, background: 'white', border: '1px solid #DDE4F5',
              borderRadius: '12px 12px 12px 4px',
              padding: '10px 14px',
              fontSize: '13px', lineHeight: 1.5, color: '#0D1B3E',
              boxShadow: '0 1px 8px rgba(13,27,62,0.06)',
            }}
          >
            {mascotText}
            {vitaReady && (
              <span style={{ marginLeft: '6px', fontSize: '9px', padding: '1px 6px', borderRadius: '20px', background: '#E0F7F3', color: '#089B84', fontWeight: 600 }}>
                Kokoro
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Steps log */}
      <AnimatePresence>
        {stepsLog.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ width: '100%', background: '#F2F5FC', borderRadius: '10px', padding: '10px 14px', border: '1px solid #DDE4F5' }}
          >
            {stepsLog.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '11px', color: '#3D4F7C', padding: '2px 0' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0ABFA3', flexShrink: 0 }} />
                {s}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <AnimatePresence>
        {(phase === 'idle' || phase === 'error') && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end' }}>
              <textarea
                ref={inputRef}
                value={userText}
                onChange={e => setUserText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                placeholder="Tell me what you need... (e.g. I want to close my father's FD)"
                rows={1}
                style={{
                  flex: 1, border: '1.5px solid #DDE4F5', borderRadius: '10px',
                  padding: '10px 12px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
                  resize: 'none', outline: 'none', lineHeight: 1.4,
                }}
                onFocus={e => (e.target.style.borderColor = '#0ABFA3')}
                onBlur={e => (e.target.style.borderColor = '#DDE4F5')}
              />
              <button
                onClick={handleMic}
                style={{
                  width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                  border: `2px solid ${micActive ? '#22C55E' : '#DDE4F5'}`,
                  background: micActive ? '#F0FDF4' : 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: micActive ? '#16A34A' : '#6B7A99',
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!userText.trim()}
              style={{
                width: '100%', height: '42px', borderRadius: '10px',
                background: userText.trim() ? 'linear-gradient(135deg, #0D1B3E, #1B3A8E)' : '#DDE4F5',
                color: userText.trim() ? 'white' : '#9FADC8', border: 'none',
                fontSize: '14px', fontWeight: 700, cursor: userText.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Let DISHA help me
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

