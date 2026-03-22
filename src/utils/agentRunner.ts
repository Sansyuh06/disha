// src/utils/agentRunner.ts
// Agentic AI: given an intent, automatically executes a multi-step flow.
// "I want to close my father's FD" → triggers bereavement, docs, journey, banker notify.

import { askOllamaJSON } from './ollama';
import type { IntentProfile, JourneyData } from '../contexts/CustomerContext';

export interface AgentResult {
  intent: string;
  steps_executed: string[];
  journey?: JourneyData;
  documents?: string[];
  banner?: string;          // message to show customer
  route: string;            // where to navigate
  bankerNotification?: string; // pre-load message for banker
}

export async function runAgent(
  profile: IntentProfile,
  customerName?: string
): Promise<AgentResult> {
  // Build the agentic prompt based on detected intent
  const prompt = `You are an agentic banking AI. A customer wants: "${profile.intent}".
Their emotional state: ${profile.emotion}. User type: ${profile.userType}.

Generate a complete action plan. Return ONLY this JSON:
{
  "intent": "${profile.intent}",
  "steps_executed": [
    "Detected intent: ${profile.intent}",
    "Generated document checklist",
    "Created branch journey",
    "Prepared banker briefing"
  ],
  "journey": {
    "task_summary": "2-word task",
    "total_minutes": 35,
    "journey": [
      {
        "step": 1, "counter": "Token Desk", "service": "Priority Token",
        "purpose": "Get your priority token for fast service",
        "wait_minutes": 3, "documents": ["Any valid ID"],
        "tip": "Mention your specific task at the token desk"
      }
    ]
  },
  "documents": ["Document 1", "Document 2", "Document 3"],
  "banner": "One warm sentence acknowledging what you need",
  "route": "${profile.autoRoute ?? '/customer/journey'}",
  "bankerNotification": "One sentence briefing for the bank staff: what this customer needs and how to approach them"
}

Generate 3-5 journey steps appropriate for: ${profile.intent}
If emotion is bereavement: use compassionate language, route to /customer/bereavement
Include the right documents for the task.`;

  try {
    const result = await askOllamaJSON<AgentResult>(prompt, { timeout: 30000 });
    return result;
  } catch {
    // Minimal fallback
    return {
      intent: profile.intent,
      steps_executed: ['Intent detected', 'Routing to best feature'],
      route: profile.autoRoute ?? '/customer/journey',
      banner: profile.emotion === 'bereavement'
        ? 'We are here to help you through this gently.'
        : 'Let me guide you to the right service.',
      bankerNotification: `Customer needs: ${profile.intent}`,
    };
  }
}
