import React, { createContext, useContext, useReducer } from 'react';

export type UserType = 'standard' | 'elderly' | 'firstTime' | 'distressed';
export type EmotionalContext = 'normal' | 'confused' | 'bereavement' | 'urgent';
export type UIMode = 'standard' | 'simplified' | 'compassionate' | 'guided';

export interface IntentProfile {
  intent: string;
  taskType: string;
  userType: UserType;
  emotion: EmotionalContext;
  uiMode: UIMode;
  autoRoute: string | null;
  confidence: number;
}

export interface PreVisitSession {
  sessionCode: string;
  qrData: string;
  task: string;
  documents: string[];
  estimatedWait: number;
  bestTime: string;
  createdAt: Date;
}

export interface ExtractedData {
  document_type?: string;
  full_name?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  address?: string | null;
  pincode?: string | null;
  id_number?: string | null;
  father_name?: string | null;
  mobile?: string | null;
  email?: string | null;
  employer_name?: string | null;
  monthly_salary?: string | null;
}

export interface JourneyStep {
  step: number;
  counter: string;
  service: string;
  purpose: string;
  wait_minutes: number;
  documents: string[];
  tip: string;
  completed?: boolean;
}

export interface JourneyData {
  task_summary: string;
  total_minutes: number;
  journey: JourneyStep[];
}

interface CustomerState {
  scannedData: ExtractedData | null;
  journey: JourneyData | null;
  token: string;
  sessionId: string;
  intentProfile: IntentProfile | null;
  preVisitSession: PreVisitSession | null;
}

type CustomerAction =
  | { type: 'SET_SCANNED_DATA'; data: ExtractedData }
  | { type: 'SET_JOURNEY'; journey: JourneyData }
  | { type: 'COMPLETE_STEP'; stepNum: number }
  | { type: 'SET_TOKEN'; token: string }
  | { type: 'SET_INTENT'; profile: IntentProfile }
  | { type: 'SET_PRE_VISIT'; session: PreVisitSession }
  | { type: 'CLEAR_SESSION' };

const initialState: CustomerState = {
  scannedData: null,
  journey: null,
  token: '',
  sessionId: `S${Date.now()}`,
  intentProfile: null,
  preVisitSession: null,
};

function reducer(state: CustomerState, action: CustomerAction): CustomerState {
  switch (action.type) {
    case 'SET_SCANNED_DATA':
      return { ...state, scannedData: action.data };
    case 'SET_JOURNEY':
      return { ...state, journey: action.journey };
    case 'COMPLETE_STEP':
      if (!state.journey) return state;
      return {
        ...state,
        journey: {
          ...state.journey,
          journey: state.journey.journey.map(s =>
            s.step === action.stepNum ? { ...s, completed: true } : s
          ),
        },
      };
    case 'SET_TOKEN':
      return { ...state, token: action.token };
    case 'SET_INTENT':
      return { ...state, intentProfile: action.profile };
    case 'SET_PRE_VISIT':
      return { ...state, preVisitSession: action.session };
    case 'CLEAR_SESSION':
      return { ...initialState, sessionId: `S${Date.now()}` };
    default:
      return state;
  }
}

interface CustomerContextType {
  state: CustomerState;
  dispatch: React.Dispatch<CustomerAction>;
}

const CustomerContext = createContext<CustomerContextType | null>(null);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <CustomerContext.Provider value={{ state, dispatch }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomer must be used within CustomerProvider');
  return ctx;
}
