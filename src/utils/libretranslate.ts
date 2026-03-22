export async function translate(
  text: string,
  source: string,
  target: string
): Promise<string> {
  if (source === target) return text;
  if (!text.trim()) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Translation unavailable');
    const data = await res.json();
    return data[0].map((item: any) => item[0]).join('');
  } catch {
    return text;
  }
}
