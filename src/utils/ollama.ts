export interface OllamaOptions {
  model?: string;
  stream?: boolean;
  timeout?: number;
}

export async function askOllama(
  prompt: string,
  options: OllamaOptions = {}
): Promise<string> {
  const { model = 'llama3:latest', stream = false, timeout = 30000 } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ model, prompt, stream }),
    });
    if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
    const data = await res.json();
    return data.response as string;
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new Error('Ollama timed out. Make sure it is running: ollama serve');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function askOllamaJSON<T>(
  prompt: string,
  options: OllamaOptions = {}
): Promise<T> {
  const raw = await askOllama(prompt, options);
  // REVIEWER FIX: regex-based extraction handles markdown fences + preamble text
  const match = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!match) {
    throw new Error('AI returned unexpected format. Please try rephrasing your request.');
  }
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    // Second attempt: try to find the largest JSON block
    const start = raw.lastIndexOf('{') !== -1 ? raw.indexOf('{') : raw.indexOf('[');
    const end = Math.max(raw.lastIndexOf('}'), raw.lastIndexOf(']'));
    if (start === -1 || end === -1) {
      throw new Error('AI returned unexpected format. Please try rephrasing your request.');
    }
    return JSON.parse(raw.slice(start, end + 1)) as T;
  }
}

export async function checkOllamaStatus(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('http://localhost:11434/api/tags', { signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}
