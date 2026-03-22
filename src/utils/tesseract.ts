import { createWorker } from 'tesseract.js';

let warmupWorker: Awaited<ReturnType<typeof createWorker>> | null = null;

// Pre-download the 30MB language pack silently on app mount
export async function warmUpTesseract(): Promise<void> {
  try {
    // v7: no OEM argument — just language array
    warmupWorker = await createWorker(['eng', 'hin']);
    console.log('[DISHA] Tesseract.js v7 warmed up — OCR ready');
  } catch (err) {
    console.warn('[DISHA] Tesseract warm-up failed (non-fatal):', err);
  }
}

export async function performOCR(
  imageData: File | Blob,
  onProgress?: (pct: number, status: string) => void
): Promise<{ text: string; confidence: number }> {
  onProgress?.(0, 'Initializing...');

  let worker = warmupWorker;
  let owned = false;

  if (!worker) {
    // v7: createWorker(langs, options?)
    worker = await createWorker(['eng', 'hin'], {
      logger: (m: any) => {
        if (m.status === 'loading tesseract core') onProgress?.(5, 'Loading OCR engine...');
        else if (m.status === 'initializing tesseract') onProgress?.(15, 'Initializing...');
        else if (m.status === 'loading language traineddata') onProgress?.(30, 'Loading language data...');
        else if (m.status === 'recognizing text') onProgress?.(30 + Math.floor(m.progress * 65), `Scanning... ${Math.floor(m.progress * 100)}%`);
      },
    } as any);
    owned = true;
  } else {
    onProgress?.(30, 'Language data ready...');
  }

  try {
    onProgress?.(35, 'Scanning document...');
    const { data } = await worker.recognize(imageData);
    onProgress?.(100, 'Complete!');
    return { text: data.text, confidence: data.confidence };
  } finally {
    if (owned) await worker.terminate();
  }
}
