export interface OllamaOptions {
  model?: string;
  stream?: boolean;
  timeout?: number;
  format?: 'json' | string;
}

export async function askOllama(
  prompt: string,
  options: OllamaOptions = {}
): Promise<string> {
  const { model = 'llama3:latest', stream = false, timeout = 30000, format } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const payload: any = { model, prompt, stream };
    if (format) payload.format = format;

    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(payload),
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
  const raw = await askOllama(prompt, { ...options, format: 'json' });
  
  // Ollama native json format guarantees valid JSON, so we can skip regex stripping usually
  try {
    return JSON.parse(raw) as T;
  } catch (initialParseError) {
    // Fallback extraction block just in case
    const match = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!match) {
      throw new Error('AI returned unexpected format. Please try rephrasing your request.');
    }

    let jsonStr = match[0];

  // Try parsing as-is first
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    // Sanitize common Ollama JSON issues:
    jsonStr = sanitizeJSON(jsonStr);
    try {
      return JSON.parse(jsonStr) as T;
    } catch {
      // Last resort: try from outermost braces
      const start = raw.indexOf('{') !== -1 ? raw.indexOf('{') : raw.indexOf('[');
      const end = Math.max(raw.lastIndexOf('}'), raw.lastIndexOf(']'));
      if (start === -1 || end === -1) {
        throw new Error('AI returned unexpected format. Please try rephrasing your request.');
      }
      return JSON.parse(sanitizeJSON(raw.slice(start, end + 1))) as T;
    }
  }
  }
}

/**
 * Sanitize messy LLM-generated JSON:
 * - Replace single-quoted strings with double-quoted
 * - Remove trailing commas before } or ]
 * - Strip control characters inside strings
 */
function sanitizeJSON(str: string): string {
  let result = str;

  // Fix unquoted keys (e.g., { key: "value" } -> { "key": "value" })
  // Looks for word characters followed by a colon, optionally prefixed by whitespace and { or ,
  result = result.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

  // Remove trailing commas before } or ]
  result = result.replace(/,\s*([}\]])/g, '$1');

  // Remove any control characters except \n \r \t
  result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

  // Escape literal newlines inside double-quoted string values
  result = result.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (_match, content) => {
    return '"' + content.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"';
  });

  return result;
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
