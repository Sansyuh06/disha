import React from 'react';
import { useCustomer } from '../../contexts/CustomerContext';
import { generateJourneyPDF } from '../../utils/pdf';
import { QRCodeSVG } from 'qrcode.react';

interface JourneyData {
  task_summary: string;
  total_minutes: number;
  journey: Array<{
    step: number; counter: string; service: string;
    purpose: string; wait_minutes: number; documents: string[]; tip: string;
  }>;
}

export default function JourneySlip({ journey }: { journey: JourneyData }) {
  const { state } = useCustomer();
  const token = state.token || 'Walk-in';

  const qrContent = JSON.stringify({
    token,
    task: journey.task_summary,
    total_minutes: journey.total_minutes,
    steps: journey.journey.length,
    timestamp: new Date().toISOString(),
  });

  const handlePrint = () => {
    generateJourneyPDF(journey, token);
  };

  return (
    <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="shrink-0">
        <QRCodeSVG value={qrContent} size={72} level="M" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-[var(--navy-900)]">Token: <span style={{ color: 'var(--teal)' }}>{token}</span></p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{journey.task_summary} · {journey.journey.length} stops · ~{journey.total_minutes} min</p>
      </div>
      <button
        onClick={handlePrint}
        className="shrink-0 px-4 py-2 text-sm font-medium border rounded-xl hover:bg-gray-50 transition-colors"
        style={{ borderColor: 'var(--teal)', color: 'var(--teal)' }}
      >
        🖨️ Print Slip
      </button>
    </div>
  );
}
