// src/utils/intentEngine.ts
// Central intelligence layer. Detects intent, user type, emotion.
// Returns routing decisions without asking the user.

import { askOllamaJSON } from './ollama';
import type { IntentProfile, UserType, EmotionalContext, UIMode } from '../contexts/CustomerContext';

const BEREAVEMENT_KEYWORDS = ['died', 'passed away', 'death', 'deceased', 'late husband',
  'late wife', 'father died', 'mother died', 'close account of', 'claim fd',
  'bereavement', 'demise', 'no more'];

const ELDERLY_SIGNALS = ['my son brought me', 'daughter helped', 'pension', 'senior',
  'retirement', 'I am old', '60 years', '70 years', 'difficult to understand'];

const DISTRESS_SIGNALS = ['please help', 'urgent', 'emergency', 'stolen', 'fraud',
  'hacked', 'lost my card', 'money gone', 'cheated'];

function detectFromKeywords(text: string): Partial<IntentProfile> {
  const lower = text.toLowerCase();
  const isBereavement = BEREAVEMENT_KEYWORDS.some(k => lower.includes(k));
  const isElderly = ELDERLY_SIGNALS.some(k => lower.includes(k));
  const isDistressed = DISTRESS_SIGNALS.some(k => lower.includes(k));

  return {
    emotion: isBereavement ? 'bereavement' : isDistressed ? 'urgent' : 'normal',
    userType: isElderly ? 'elderly' : 'standard',
    uiMode: isBereavement ? 'compassionate' : isElderly ? 'guided' : 'standard',
    autoRoute: isBereavement ? '/customer/bereavement' : null,
  };
}

export async function analyzeIntent(userInput: string): Promise<IntentProfile> {
  // Fast keyword pass first (instant, no Ollama needed)
  const keywordHints = detectFromKeywords(userInput);

  // If clearly bereavement, skip Ollama for speed
  if (keywordHints.emotion === 'bereavement') {
    return {
      intent: 'bereavement claim',
      taskType: 'bereavement',
      userType: keywordHints.userType ?? 'standard',
      emotion: 'bereavement',
      uiMode: 'compassionate',
      autoRoute: '/customer/bereavement',
      confidence: 0.95,
    };
  }

  try {
    const result = await askOllamaJSON<IntentProfile>(
      `Analyze this bank customer request and return a JSON profile.
Customer says: "${userInput}"

Return ONLY this JSON (no markdown, no explanation):
{
  "intent": "2-4 word summary of what they want",
  "taskType": "one of: bereavement|loan|account|kyc|complaint|deposit|journey|salary|scan",
  "userType": "one of: standard|elderly|firstTime|distressed",
  "emotion": "one of: normal|confused|bereavement|urgent",
  "uiMode": "one of: standard|simplified|compassionate|guided",
  "autoRoute": "one of: /customer/bereavement|/customer/loan|/customer/scan|/customer/journey|/customer/voice|/customer/salary|null",
  "confidence": 0.85
}

Rules:
- If they mention death/deceased/passed away → emotion=bereavement, autoRoute=/customer/bereavement
- If they seem elderly or confused → uiMode=guided, userType=elderly
- If urgent/emergency/stolen → emotion=urgent, userType=distressed
- confidence between 0.5 and 1.0`,
      { timeout: 10000 }
    );

    return {
      ...keywordHints,
      ...result,
      confidence: result.confidence ?? 0.7,
    };
  } catch {
    // Graceful fallback — use keyword hints + safe defaults
    return {
      intent: userInput.slice(0, 40),
      taskType: 'journey',
      userType: keywordHints.userType ?? 'standard',
      emotion: keywordHints.emotion ?? 'normal',
      uiMode: keywordHints.uiMode ?? 'standard',
      autoRoute: keywordHints.autoRoute ?? '/customer/journey',
      confidence: 0.5,
    };
  }
}
