import { createWorker } from 'tesseract.js';

let warmupWorker: Awaited<ReturnType<typeof createWorker>> | null = null;

// REVIEWER FIX: warm up on app mount so the 30MB lang pack is pre-downloaded
export async function warmUpTesseract(): Promise<void> {
  try {
    warmupWorker = await createWorker(['eng', 'hin'], 1);
    console.log('[DISHA] Tesseract.js warmed up — OCR ready');
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
    worker = await createWorker(['eng', 'hin'], 1, {
      logger: (m) => {
        if (m.status === 'loading tesseract core') onProgress?.(5, 'Loading OCR engine...');
        else if (m.status === 'initializing tesseract') onProgress?.(10, 'Initializing...');
        else if (m.status === 'loading language traineddata') onProgress?.(20, 'Loading language data...');
        else if (m.status === 'recognizing text') onProgress?.(20 + Math.floor(m.progress * 75), `Recognizing text... ${Math.floor(m.progress * 100)}%`);
      },
    });
    owned = true;
  } else {
    onProgress?.(20, 'Loading language data...');
  }
  
  try {
    onProgress?.(25, 'Scanning document...');
    const { data } = await worker.recognize(imageData);
    onProgress?.(100, 'Complete!');
    return { text: data.text, confidence: data.confidence };
  } finally {
    if (owned) {
      await worker.terminate();
    }
  }
}
