import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyPin, getBalance, getMiniStatement, getFDDetails, applyForLoan, CustomerProfile } from '../../utils/mockBank';
import { speakWithVita } from '../../utils/vita';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

export default function ContactCenter() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'start', sender: 'bot', text: 'Welcome to Union Bank of India. How can I assist you today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [awaitingPinFor, setAwaitingPinFor] = useState<string | null>(null);

  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Speak first message automatically
    setIsSpeaking(true);
    speakWithVita(messages[0].text, { voice: 'af_heart' }).finally(() => setIsSpeaking(false));
  }, []);

  const handleUserInput = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    const cleanText = text.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text: cleanText }]);
    setInputText('');

    const lowerText = cleanText.toLowerCase();

    // Check if we are awaiting a PIN
    if (awaitingPinFor) {
      // Extract exactly 4 digits from the text
      const pinMatch = lowerText.match(/\d{4}/);
      if (pinMatch) {
        const pin = pinMatch[0];
        const custProfile = await verifyPin(pin);
        if (custProfile) {
          setProfile(custProfile);
          await processCommand(awaitingPinFor, custProfile);
        } else {
          botReply(`I'm sorry, I could not verify that PIN. Please say or type your 4-digit PIN again.`);
        }
      } else {
        botReply(`Please provide a valid 4-digit PIN or biometrics to continue.`);
      }
      return;
    }

    // Standard routing intent
    if (lowerText.includes('balance') || lowerText.includes('how much money')) {
      if (profile) await processCommand('balance', profile);
      else requestPin('balance');
    } 
    else if (lowerText.includes('statement') || lowerText.includes('transactions') || lowerText.includes('mini')) {
      if (profile) await processCommand('statement', profile);
      else requestPin('statement');
    }
    else if (lowerText.includes('fixed deposit') || lowerText.includes('fd') || lowerText.includes('interest')) {
      if (profile) await processCommand('fd', profile);
      else requestPin('fd');
    }
    else if (lowerText.includes('loan')) {
      if (profile) await processCommand('loan', profile);
      else requestPin('loan');
    }
    else {
      botReply(`I am a digital assistant. I can help you check your account balance, view your last three transactions, get your Fixed Deposit details, or apply for a loan. How can I help?`);
    }
  };

  const processCommand = async (command: string, cust: CustomerProfile) => {
    let reply = '';
    setAwaitingPinFor(null);
    try {
      if (command === 'balance') {
        const bal = await getBalance(cust.id);
        reply = `Thank you, ${cust.name}. Your current savings account balance is ₹${bal.toLocaleString('en-IN')}.`;
      } else if (command === 'statement') {
        const stmt = await getMiniStatement(cust.id);
        reply = `Alright ${cust.name}. Here are your recent transactions. You had a Zomato debit of ₹450, an IMPS transfer debit of ₹15,000, and a Salary credit of ₹75,000.`;
      } else if (command === 'fd') {
        reply = await getFDDetails(cust.id);
      } else if (command === 'loan') {
        reply = await applyForLoan(cust.id);
      }
    } catch (err) {
      reply = 'I encountered an issue processing your request. Please hold while I transfer you to a human agent.';
    }
    botReply(reply);
  };

  const requestPin = (command: string) => {
    setAwaitingPinFor(command);
    botReply(`I can help you with that. But first, for your security, please tell me or type your 4-digit verification PIN.`);
  };

  const botReply = async (text: string) => {
    setMessages(prev => [...prev, { id: 'bot_' + Date.now().toString(), sender: 'bot', text }]);
    setIsSpeaking(true);
    try {
      if (isListening) stopListening();
      await speakWithVita(text, { voice: 'af_heart' });
    } catch {
      // ignore
    } finally {
      setIsSpeaking(false);
    }
  };

  // ----- Microphone Logic -----
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support the Web Speech API. Please use the text input fallback.");
      return;
    }
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      handleUserInput(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // ----- UI Render -----
  return (
    <div className="flex h-screen overflow-hidden text-white" style={{ background: 'var(--navy-900)' }}>
      {/* Sidebar Layout */}
      <div className="w-80 border-r" style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'var(--navy-800)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <button onClick={() => navigate('/')} className="hover:text-blue-400 flex items-center gap-2 text-sm transition-colors text-gray-400">
            ← End Call & Return
          </button>
          <h2 className="text-xl font-heading font-bold mt-6">Contact Center</h2>
          <p className="text-sm text-blue-300 opacity-80 mt-1">IVR Voice Automation Demo</p>
        </div>

        <div className="p-6">
          <p className="text-sm font-semibold mb-4 text-gray-400">Available Intents Supported:</p>
          <ul className="text-sm space-y-3 opacity-80 list-disc pl-5">
            <li>"What is my balance?"</li>
            <li>"Get my mini statement"</li>
            <li>"Fixed Deposit details"</li>
            <li>"Apply for a loan"</li>
          </ul>

          <div className="mt-8 p-4 bg-black/20 rounded-xl border border-white/5">
            <p className="text-xs text-gray-400 mb-2">Test Credentials:</p>
            <ul className="text-xs space-y-1 text-gray-300">
              <li><strong>1111</strong> - Rajesh (Standard)</li>
              <li><strong>2222</strong> - Meena (Elderly)</li>
              <li><strong>3333</strong> - Arjun (First-Job)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Call Area */}
      <div className="flex-1 flex flex-col relative w-full items-center">
        {/* Dynamic Waveform Simulation */}
        <div className="mt-16 flex items-center justify-center gap-1.5 h-32 mb-8 relative">
          <div className={`absolute -inset-10 rounded-full bg-blue-500/10 blur-xl transition-opacity duration-1000 ${isSpeaking ? 'opacity-100' : 'opacity-0'}`} />
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="w-2 rounded-full transition-all duration-300"
              style={{
                height: isSpeaking ? `${Math.random() * 80 + 20}px` : isListening ? `${Math.random() * 40 + 10}px` : '4px',
                backgroundColor: isSpeaking ? '#0ABFA3' : isListening ? '#3B82F6' : '#475569',
                transform: `scaleY(${isSpeaking ? 1 : 0.6})`
              }}
            />
          ))}
        </div>

        <div className="text-center mb-8">
          <p className="text-lg font-medium opacity-80">
            {isSpeaking ? 'DISHA IVR is talking...' : isListening ? 'Listening on mic...' : 'Call Active — Waiting for input'}
          </p>
        </div>

        {/* Live Transcription Box */}
        <div className="w-full max-w-2xl flex-1 bg-black/30 rounded-t-3xl border-t border-x border-white/10 p-6 flex flex-col mt-4">
          <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    m.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-sm' 
                      : 'bg-white/10 text-white rounded-bl-sm border border-white/5'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed font-medium">{m.text}</p>
                </div>
                <span className="text-[10px] mt-1.5 text-gray-400 font-semibold uppercase tracking-wider px-2">
                  {m.sender === 'bot' ? 'DISHA IVR' : 'You (Live Transcript)'}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Controls Bar */}
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3">
            <button
              onClick={toggleListening}
              className={`h-14 w-14 rounded-full flex items-center justify-center shrink-0 transition-all shadow-lg ${
                isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isListening ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                )}
              </svg>
            </button>
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex items-center px-4 overflow-hidden">
              <input
                type="text"
                placeholder="Type fallback message if mic fails..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUserInput(inputText)}
                className="w-full h-14 bg-transparent focus:outline-none text-white text-[15px]"
                disabled={isListening}
              />
              <button 
                onClick={() => handleUserInput(inputText)}
                className="text-white/50 hover:text-white transition-colors h-14 w-10 flex items-center justify-end"
                disabled={!inputText.trim()}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
