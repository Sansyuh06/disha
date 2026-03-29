import { createWorker, PSM } from 'tesseract.js';

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

/**
 * Pre-processes an image for Tesseract OCR to massively improve accuracy.
 * Performs:
 * 1. Grayscale conversion
 * 2. High-contrast thresholding (binarization to strip out shadows/noise)
 */
async function preprocessImage(imageBlob: File | Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(imageBlob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return resolve(imageBlob); // fallback
      
      // Calculate scale if image is too small (Tesseract likes text height ~30px)
      let scale = 1;
      if (img.width < 1000) scale = 2; // upscale small mobile uploads
      
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      // Draw scaled image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Apply Binarization (Grayscale + Contrast Threshold)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      const threshold = 128; // Mid-point threshold
      for (let i = 0; i < data.length; i += 4) {
        // Human-eye weighting for grayscale
        const luminance = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
        
        // Push to sheer black or pure white based on threshold
        const v = luminance > threshold ? 255 : 0;
        data[i] = data[i+1] = data[i+2] = v;
        // Alpha remains untouched
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else resolve(imageBlob);
      }, 'image/png');
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(imageBlob); // fallback to original on error
    };
    
    img.src = url;
  });
}

export async function performOCR(
  imageData: File | Blob,
  onProgress?: (pct: number, status: string) => void
): Promise<{ text: string; confidence: number }> {
  onProgress?.(2, 'Enhancing image for OCR...');
  
  // Clean up the image before giving it to Tesseract
  const enhancedBlob = await preprocessImage(imageData);

  onProgress?.(5, 'Preparing OCR engine...');

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
    // Set parameters to improve structural block reading
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.AUTO,
      preserve_interword_spaces: '1',
    });

    onProgress?.(35, 'Scanning document...');

    // Race against a 60-second timeout
    const result = await Promise.race([
      worker.recognize(enhancedBlob),
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
