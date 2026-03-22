// src/features/PreVisit/PreVisitAssistant.tsx
// WhatsApp-style chat interface — plan your branch visit BEFORE you leave home.

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useCustomer } from '../../contexts/CustomerContext';
import { useQueue } from '../../contexts/QueueContext';
import { askOllamaJSON } from '../../utils/ollama';
import { speakWithVita } from '../../utils/vita';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  role: 'user' | 'disha';
  text: string;
  timestamp: Date;
}

interface PreVisitPlan {
  documents: string[];
  estimated_wait_minutes: number;
  best_time_to_visit: string;
  counter_sequence: string[];
  quick_tip: string;
}

function generateSessionCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function PreVisitAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'intro',
      role: 'disha',
      text: "Hello! I'm DISHA. Tell me what you need to do at the bank and I'll prepare everything before you arrive — documents, estimated wait, and a QR code for the kiosk.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PreVisitPlan | null>(null);
  const [sessionCode, setSessionCode] = useState('');
  const [qrData, setQrData] = useState('');
  const { dispatch: customerDispatch } = useCustomer();
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role: 'user' | 'disha', text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, text, timestamp: new Date() }]);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput('');
    addMessage('user', userText);
    setLoading(true);

    try {
      const result = await askOllamaJSON<PreVisitPlan>(
        `You are DISHA, a smart pre-visit banking assistant. A customer planning to visit Union Bank says: "${userText}".

Return ONLY this JSON (no markdown):
{
  "documents": ["Document 1 — what it is + why needed", "Document 2"],
  "estimated_wait_minutes": 25,
  "best_time_to_visit": "10:30 AM to 12:00 PM on weekdays",
  "counter_sequence": ["Token Desk", "Counter 3 — Account Services", "Manager Cabin B"],
  "quick_tip": "One practical tip to make their visit faster"
}

Generate realistic documents for their task. Estimated wait: 15-45 minutes depending on task complexity.`,
        { timeout: 25000 }
      );

      setPlan(result);
      const code = generateSessionCode();
      setSessionCode(code);

      const qrPayload = JSON.stringify({
        code,
        task: userText,
        documents: result.documents,
        journey: result.counter_sequence,
        timestamp: new Date().toISOString(),
      });
      setQrData(qrPayload);

      customerDispatch({
        type: 'SET_PRE_VISIT',
        session: {
          sessionCode: code,
          qrData: qrPayload,
          task: userText,
          documents: result.documents,
          estimatedWait: result.estimated_wait_minutes,
          bestTime: result.best_time_to_visit,
          createdAt: new Date(),
        },
      });

      const responseText = `I've prepared your visit plan! You'll need ${result.documents.length} document${result.documents.length > 1 ? 's' : ''}. Estimated wait is about ${result.estimated_wait_minutes} minutes. The best time to visit is ${result.best_time_to_visit}. Your session code is ${code} — scan the QR at the kiosk and everything will be pre-loaded.`;
      addMessage('disha', responseText);
      speakWithVita(responseText, { voice: 'af_heart' });

    } catch {
      addMessage('disha', "I couldn't reach the AI assistant. Make sure Ollama is running. Type 'ollama serve' in your terminal.");
    } finally {
      setLoading(false);
    }
  };

  const handleKioskScan = () => {
    if (qrData) {
      try {
        const data = JSON.parse(qrData);

        // Restore pre-visit context so documents aren't lost
        customerDispatch({
          type: 'SET_PRE_VISIT',
          session: {
            sessionCode: data.code,
            qrData,
            task: data.task,
            documents: data.documents || [],
            estimatedWait: plan?.estimated_wait_minutes ?? 25,
            bestTime: plan?.best_time_to_visit ?? '',
            createdAt: new Date(data.timestamp || Date.now()),
          },
        });

        customerDispatch({
          type: 'SET_JOURNEY',
          journey: {
            task_summary: data.task.slice(0, 30),
            total_minutes: plan?.estimated_wait_minutes ?? 25,
            journey: (data.journey ?? []).map((counter: string, i: number) => ({
              step: i + 1, counter, service: counter,
              purpose: `Proceed to ${counter}`,
              wait_minutes: Math.floor((plan?.estimated_wait_minutes ?? 25) / (data.journey?.length ?? 3)),
              documents: i === 0 ? data.documents : [],
              tip: i === 0 ? (plan?.quick_tip ?? '') : '',
            })),
          },
        });
        navigate('/customer/journey');
      } catch {
        navigate('/customer/journey');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', maxWidth: '700px', margin: '0 auto', padding: '0' }}>

      {/* Header */}
      <div style={{ background: '#0D1B3E', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '3px solid #0ABFA3' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0ABFA3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
            <rect x="10" y="9" width="3.5" height="22" rx="1.75" fill="white" />
            <path d="M13.5 9 Q30 9 30 20 Q30 31 13.5 31" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p style={{ color: 'white', fontFamily: '"Plus Jakarta Sans"', fontWeight: 700, fontSize: '15px', lineHeight: 1.2 }}>DISHA Pre-Visit Assistant</p>
          <p style={{ color: '#0ABFA3', fontSize: '11px', fontWeight: 500 }}>Plan before you arrive</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
          <span style={{ fontSize: '11px', color: '#22C55E', fontWeight: 600 }}>Online</span>
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#E8EDF8', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            {msg.role === 'disha' && (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0D1B3E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '8px', alignSelf: 'flex-end' }}>
                <svg width="14" height="14" viewBox="0 0 40 40" fill="none"><rect x="10" y="9" width="3.5" height="22" rx="1.75" fill="white" /><path d="M13.5 9 Q30 9 30 20 Q30 31 13.5 31" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" /></svg>
              </div>
            )}
            <div style={{
              maxWidth: '75%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user' ? '#0D1B3E' : 'white',
              color: msg.role === 'user' ? 'white' : '#0D1B3E',
              fontSize: '13px', lineHeight: 1.6, boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}>
              {msg.text}
              <div style={{ fontSize: '10px', color: msg.role === 'user' ? 'rgba(255,255,255,0.5)' : '#9FADC8', marginTop: '4px', textAlign: 'right' }}>
                {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0D1B3E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #0ABFA3', borderTopColor: 'transparent', animation: 'compassSpin 0.8s linear infinite' }} />
            </div>
            <div style={{ background: 'white', padding: '12px 16px', borderRadius: '18px 18px 18px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0ABFA3', animation: 'breathe 1.2s infinite', animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Plan + QR card */}
        <AnimatePresence>
          {plan && qrData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 16px rgba(13,27,62,0.12)', border: '1px solid #DDE4F5' }}
            >
              <p style={{ fontFamily: '"Plus Jakarta Sans"', fontWeight: 700, fontSize: '14px', color: '#0D1B3E', marginBottom: '14px' }}>
                Your Visit Plan — Session #{sessionCode}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#6B7A99', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Documents to bring</p>
                  {plan.documents.map((doc, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#E0F7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                        <svg width="10" height="10" fill="none" stroke="#089B84" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p style={{ fontSize: '12px', color: '#3D4F7C', lineHeight: 1.5 }}>{doc}</p>
                    </div>
                  ))}

                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <svg width="14" height="14" fill="none" stroke="#1B3A8E" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p style={{ fontSize: '12px', color: '#3D4F7C' }}>Est. wait: ~{plan.estimated_wait_minutes} min</p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <svg width="14" height="14" fill="none" stroke="#1B3A8E" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <p style={{ fontSize: '12px', color: '#3D4F7C' }}>Best time: {plan.best_time_to_visit}</p>
                    </div>
                  </div>

                  {plan.quick_tip && (
                    <div style={{ marginTop: '10px', padding: '8px 12px', background: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                      <p style={{ fontSize: '11px', color: '#92400E' }}>💡 {plan.quick_tip}</p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ padding: '10px', background: 'white', border: '2px solid #0ABFA3', borderRadius: '12px' }}>
                    <QRCodeSVG value={qrData} size={100} fgColor="#0D1B3E" bgColor="white" />
                  </div>
                  <p style={{ fontSize: '10px', color: '#6B7A99', textAlign: 'center', maxWidth: '100px' }}>Scan at kiosk to pre-load your session</p>
                  <p style={{ fontSize: '12px', fontWeight: 800, fontFamily: '"Plus Jakarta Sans"', color: '#0ABFA3', letterSpacing: '0.1em' }}>{sessionCode}</p>
                </div>
              </div>

              <button
                onClick={handleKioskScan}
                style={{ marginTop: '16px', width: '100%', padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #0D1B3E, #1B3A8E)', color: 'white', border: 'none', fontSize: '14px', fontWeight: 700, fontFamily: '"Plus Jakarta Sans"', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5c0 .828-.672 1.5-1.5 1.5S17 16.328 17 15.5 17.672 14 18.5 14s1.5.672 1.5 1.5z" /></svg>
                I am at the kiosk — Load my session
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ background: 'white', padding: '12px 16px', borderTop: '1px solid #DDE4F5', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="e.g. I want to update my KYC documents..."
          style={{ flex: 1, border: '1.5px solid #DDE4F5', borderRadius: '24px', padding: '10px 16px', fontSize: '14px', fontFamily: 'DM Sans, sans-serif', outline: 'none' }}
          onFocus={e => (e.target.style.borderColor = '#0ABFA3')}
          onBlur={e => (e.target.style.borderColor = '#DDE4F5')}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          style={{ width: '44px', height: '44px', borderRadius: '50%', background: input.trim() && !loading ? '#0ABFA3' : '#DDE4F5', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: 0 }}
        >
          <svg width="18" height="18" fill="none" stroke={input.trim() && !loading ? 'white' : '#9FADC8'} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
