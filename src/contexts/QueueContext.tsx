import React, { createContext, useContext, useReducer } from 'react';
import { ExtractedData, JourneyStep } from './CustomerContext';

export type TaskType = 'account' | 'deposit' | 'loan' | 'emergency' | 'query';

export interface QueueItem {
  token: string;
  name: string;
  task: string;
  taskType: TaskType;
  docsScanned: number;
  docsTotal: number;
  language: string;
  languageFlag: string;
  isA11y: boolean;
  isBereavement: boolean;
  arrivedAt: Date;
  journey?: JourneyStep[];
  extractedData?: ExtractedData;
  status: 'waiting' | 'serving' | 'complete';
  notes?: string;
  escalated?: boolean;
  referredToLoan?: boolean;
  completedAt?: Date;
}

interface QueueStats {
  servedToday: number;
  avgServiceMinutes: number;
}

interface QueueState {
  queue: QueueItem[];
  stats: QueueStats;
  activeCustomerToken: string | null;
}

type QueueAction =
  | { type: 'ADD_CUSTOMER'; customer: QueueItem }
  | { type: 'SELECT_CUSTOMER'; token: string }
  | { type: 'COMPLETE_CUSTOMER'; token: string }
  | { type: 'ESCALATE_CUSTOMER'; token: string }
  | { type: 'REFER_TO_LOAN'; token: string }
  | { type: 'UPDATE_NOTES'; token: string; notes: string }
  | { type: 'COMPLETE_STEP'; token: string; stepNum: number };

const MOCK_CUSTOMERS: QueueItem[] = [
  {
    token: 'A041', name: 'Meena Krishnaswamy', task: 'FD Renewal',
    taskType: 'deposit', docsScanned: 2, docsTotal: 2,
    language: 'ta', languageFlag: '🇮🇳', isA11y: false, isBereavement: false,
    arrivedAt: new Date(Date.now() - 25 * 60 * 1000), status: 'waiting',
  },
  {
    token: 'A042', name: 'Suresh Patil', task: 'Home Loan Enquiry',
    taskType: 'loan', docsScanned: 3, docsTotal: 5,
    language: 'mr', languageFlag: '🇮🇳', isA11y: false, isBereavement: false,
    arrivedAt: new Date(Date.now() - 18 * 60 * 1000), status: 'waiting',
  },
  {
    token: 'A043', name: 'Kamala Venkataraman', task: 'Bereavement FD Claim',
    taskType: 'emergency', docsScanned: 1, docsTotal: 3,
    language: 'ta', languageFlag: '🇮🇳', isA11y: true, isBereavement: true,
    arrivedAt: new Date(Date.now() - 10 * 60 * 1000), status: 'waiting',
  },
  {
    token: 'A044', name: 'Arjun Singh', task: 'Account Opening',
    taskType: 'account', docsScanned: 2, docsTotal: 2,
    language: 'hi', languageFlag: '🇮🇳', isA11y: false, isBereavement: false,
    arrivedAt: new Date(Date.now() - 5 * 60 * 1000), status: 'waiting',
  },
  {
    token: 'A045', name: 'Fatima Sheikh', task: 'KYC Update',
    taskType: 'query', docsScanned: 1, docsTotal: 1,
    language: 'ar', languageFlag: '🇸🇦', isA11y: false, isBereavement: false,
    arrivedAt: new Date(Date.now() - 2 * 60 * 1000), status: 'waiting',
  },
];

function reducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case 'ADD_CUSTOMER':
      return { ...state, queue: [...state.queue, action.customer] };

    case 'SELECT_CUSTOMER':
      return {
        ...state,
        activeCustomerToken: action.token,
        queue: state.queue.map(c =>
          c.token === action.token && c.status === 'waiting'
            ? { ...c, status: 'serving' }
            : c
        ),
      };

    case 'COMPLETE_CUSTOMER': {
      const customer = state.queue.find(c => c.token === action.token);
      const completedAt = new Date();
      const serviceMins = customer
        ? (completedAt.getTime() - customer.arrivedAt.getTime()) / 60000
        : 0;
      const newServed = state.stats.servedToday + 1;
      const newAvg = (state.stats.avgServiceMinutes * state.stats.servedToday + serviceMins) / newServed;
      return {
        ...state,
        activeCustomerToken: null,
        stats: { servedToday: newServed, avgServiceMinutes: Math.round(newAvg) },
        queue: state.queue.map(c =>
          c.token === action.token ? { ...c, status: 'complete', completedAt } : c
        ),
      };
    }

    case 'ESCALATE_CUSTOMER':
      return {
        ...state,
        queue: state.queue.map(c =>
          c.token === action.token ? { ...c, escalated: true } : c
        ),
      };

    case 'REFER_TO_LOAN':
      return {
        ...state,
        queue: state.queue.map(c =>
          c.token === action.token ? { ...c, referredToLoan: true } : c
        ),
      };

    case 'UPDATE_NOTES':
      return {
        ...state,
        queue: state.queue.map(c =>
          c.token === action.token ? { ...c, notes: action.notes } : c
        ),
      };

    case 'COMPLETE_STEP':
      return {
        ...state,
        queue: state.queue.map(c => {
          if (c.token !== action.token || !c.journey) return c;
          return {
            ...c,
            journey: c.journey.map(s =>
              s.step === action.stepNum ? { ...s, completed: true } : s
            ),
          };
        }),
      };

    default:
      return state;
  }
}

interface QueueContextType {
  state: QueueState;
  dispatch: React.Dispatch<QueueAction>;
}

const QueueContext = createContext<QueueContextType | null>(null);

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    queue: MOCK_CUSTOMERS,
    stats: { servedToday: 8, avgServiceMinutes: 22 },
    activeCustomerToken: null,
  });

  return (
    <QueueContext.Provider value={{ state, dispatch }}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error('useQueue must be used within QueueProvider');
  return ctx;
}
