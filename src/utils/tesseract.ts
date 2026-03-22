import { createWorker } from 'tesseract.js';

let warmupDone = false;

// Pre-download the WASM + language pack silently on app mount
export async function warmUpTesseract(): Promise<void> {
  if (warmupDone) return;
  try {
    const w = await createWorker('eng');
    await w.terminate();
    warmupDone = true;
    console.log('[DISHA] Tesseract warmed up — OCR ready');
  } catch (err) {
    console.warn('[DISHA] Tesseract warm-up failed (non-fatal):', err);
  }
}

export async function performOCR(
  imageData: File | Blob,
  onProgress?: (pct: number, status: string) => void
): Promise<{ text: string; confidence: number }> {
  onProgress?.(5, 'Preparing OCR engine...');

  // tesseract.js v7 API: createWorker(lang, oem, workerOptions)
  // oem = 1 (LSTM only), logger goes in the THIRD arg
  const worker = await createWorker('eng', 1, {
    logger: (m: any) => {
      if (typeof m.progress === 'number') {
        if (m.status === 'loading tesseract core') {
          onProgress?.(5 + Math.floor(m.progress * 10), 'Loading OCR engine...');
        } else if (m.status === 'initializing tesseract') {
          onProgress?.(15 + Math.floor(m.progress * 10), 'Initializing...');
        } else if (m.status === 'loading language traineddata') {
          onProgress?.(25 + Math.floor(m.progress * 10), 'Loading language data...');
        } else if (m.status === 'recognizing text') {
          onProgress?.(35 + Math.floor(m.progress * 60), `Scanning... ${Math.floor(m.progress * 100)}%`);
        }
      }
    },
  });

  try {
    onProgress?.(35, 'Scanning document...');

    // Race against a 60-second timeout
    const result = await Promise.race([
      worker.recognize(imageData),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('OCR timed out after 60 seconds. Try a clearer image.')), 60000)
      ),
    ]);

    onProgress?.(95, 'Finalizing...');

    const text = result.data.text?.trim() || '';
    const confidence = result.data.confidence ?? 0;

    onProgress?.(100, 'Complete!');
    return { text, confidence };
  } finally {
    try { await worker.terminate(); } catch {}
  }
}
