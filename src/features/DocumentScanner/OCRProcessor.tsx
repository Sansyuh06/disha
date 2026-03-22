import React, { useState } from 'react';
import { performOCR } from '../../utils/tesseract';
import { askOllamaJSON } from '../../utils/ollama';

interface ExtractedKYC {
  document_type: string;
  full_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  pincode: string | null;
  id_number: string | null;
  father_name: string | null;
  mobile: string | null;
  email: string | null;
  employer_name: string | null;
  monthly_salary: string | null;
}

interface Props {
  imageData: File | Blob;
  onComplete: (data: Record<string, string | null>) => void;
}

export default function OCRProcessor({ imageData, onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const [started, setStarted] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setStarted(true);
    setError(null);
    try {
      // OCR
      const { text, confidence: conf } = await performOCR(imageData, (pct, msg) => {
        setProgress(pct);
        setStatus(msg);
      });
      setConfidence(conf);
      setProgress(80);
      setStatus('Extracting document fields...');

      // Ollama extraction
      const extracted = await askOllamaJSON<ExtractedKYC>(
        `You are a data extraction AI. Extract the person's details from this document scan.

RULES:
1. Return ONLY a valid JSON object.
2. If a field is missing, set its value to null.
3. For "document_type", choose exactly one of: Aadhaar, PAN, Passport, Salary Slip, Passbook, Unknown.

Use this exact JSON format:
{
  "document_type": null,
  "full_name": null,
  "date_of_birth": null,
  "gender": null,
  "address": null,
  "pincode": null,
  "id_number": null,
  "father_name": null,
  "mobile": null,
  "email": null,
  "employer_name": null,
  "monthly_salary": null
}

DOCUMENT TEXT:
${text}`,
        { timeout: 25000 }
      );

      setProgress(100);
      setStatus('Complete!');
      onComplete(extracted as unknown as Record<string, string | null>);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (!started) {
    return (
      <div className="mt-4">
        <button
          onClick={run}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm"
          style={{ backgroundColor: 'var(--teal)' }}
        >
          🔍 Scan This Document
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <div>
        <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
          <span>{status}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, backgroundColor: 'var(--teal)' }}
          />
        </div>
      </div>
      {confidence > 0 && (
        <p className="text-xs text-[var(--text-muted)]">Scan quality: {Math.round(confidence)}%</p>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
          ⚠️ {error}
          <button onClick={run} className="ml-2 underline">Retry</button>
        </div>
      )}
    </div>
  );
}
