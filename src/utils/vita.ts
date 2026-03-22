// src/utils/vita.ts
// Vita TTS — Kokoro-82M realistic voice synthesis
// Fallback: browser SpeechSynthesis if Vita server is not running

export interface VitaOptions {
  voice?: 'af_heart' | 'af_bella' | 'am_adam' | 'am_echo' | 'bf_emma' | 'bm_george';
  speed?: number;
  lang?: string; // BCP-47 for fallback SpeechSynthesis
}

let vitaAvailable: boolean | null = null;

export async function checkVitaStatus(): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:8181/status', {
      signal: AbortSignal.timeout(2000),
    });
    vitaAvailable = res.ok;
    return res.ok;
  } catch {
    vitaAvailable = false;
    return false;
  }
}

export async function speakWithVita(text: string, opts: VitaOptions = {}): Promise<void> {
  const { voice = 'af_heart', speed = 1.0, lang = 'en-IN' } = opts;

  // Try Vita (Kokoro-82M) first
  if (vitaAvailable !== false) {
    try {
      const res = await fetch('http://localhost:8181/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 500), voice, speed }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        vitaAvailable = true;
        return new Promise((resolve, reject) => {
          audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
          audio.onerror = () => { URL.revokeObjectURL(url); reject(); };
          audio.play().catch(reject);
        });
      }
    } catch {
      vitaAvailable = false;
    }
  }

  // Fallback: browser SpeechSynthesis with best available voice
  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    utt.rate = Math.max(0.85, speed); // slightly slower = more natural
    utt.pitch = 1.0;

    // Try to find a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Priority: Google > Microsoft Neural > any female > any English
      const preferred = voices.find(v =>
        v.name.includes('Google') && v.lang.startsWith('en')
      ) ?? voices.find(v =>
        v.name.includes('Neural') && v.lang.startsWith('en')
      ) ?? voices.find(v =>
        v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Karen')
      ) ?? voices.find(v => v.lang.startsWith('en') && v.name.includes('Female'))
        ?? voices.find(v => v.lang.startsWith(lang.slice(0, 2)))
        ?? voices.find(v => v.lang.startsWith('en'));
      if (preferred) utt.voice = preferred;
    }

    utt.onend = () => resolve();
    utt.onerror = () => resolve();
    window.speechSynthesis.speak(utt);
  });
}
