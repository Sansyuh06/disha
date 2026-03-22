export async function translate(
  text: string,
  source: string,
  target: string
): Promise<string> {
  if (source === target) return text;
  if (source === 'en' && target === 'en') return text;
  try {
    const res = await fetch('http://localhost:5000/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source, target, format: 'text' }),
    });
    if (!res.ok) throw new Error('LibreTranslate unavailable');
    const data = await res.json();
    return data.translatedText as string;
  } catch {
    // Graceful fallback: return original if translation fails
    return text;
  }
}
