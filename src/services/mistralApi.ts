export interface MistralGenerationConfig {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  model?: string;
}

type ChatMessage = { text: string; isUser: boolean };

function ensureApiKey(): string {
  const key = import.meta.env.VITE_MISTRAL_API_KEY as string | undefined;
  if (!key) {
    throw new Error("Clé API Mistral introuvable. Ajoute VITE_MISTRAL_API_KEY dans .env.local.");
  }
  return key;
}

export async function sendMessageToMistral(
  messages: ChatMessage[],
  _images: File[] | undefined,
  systemPrompt: string,
  generationConfig?: MistralGenerationConfig,
): Promise<string> {
  const apiKey = ensureApiKey();
  const model = (generationConfig?.model || (import.meta.env.VITE_MISTRAL_MODEL as string) || 'mistral-small-latest') as string;

  const mistralMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
  if (systemPrompt && systemPrompt.trim().length > 0) {
    mistralMessages.push({ role: 'system', content: systemPrompt });
  }
  for (const m of messages) {
    mistralMessages.push({ role: m.isUser ? 'user' : 'assistant', content: m.text });
  }

  const body: { model: string; messages: Array<{ role: string; content: string }>; temperature: number; top_p: number; max_tokens: number } = {
    model,
    messages: mistralMessages,
    temperature: generationConfig?.temperature ?? 0.7,
    top_p: generationConfig?.top_p ?? 0.95,
    max_tokens: generationConfig?.max_tokens ?? 4096,
  };

  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mistral API ${res.status} ${res.statusText} – ${text}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new Error("Réponse vide ou invalide depuis l'API Mistral");
  }
  return content.trim();
}


// Streaming SSE pour Chat Completions Mistral
export async function streamMessageToMistral(
  messages: ChatMessage[],
  _images: File[] | undefined,
  systemPrompt: string,
  generationConfig: MistralGenerationConfig | undefined,
  callbacks: { onToken: (token: string) => void; onDone?: () => void; onError?: (err: Error) => void },
): Promise<void> {
  const apiKey = ensureApiKey();
  const model = (generationConfig?.model || (import.meta.env.VITE_MISTRAL_MODEL as string) || 'mistral-small-latest') as string;

  const mistralMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
  if (systemPrompt && systemPrompt.trim().length > 0) {
    mistralMessages.push({ role: 'system', content: systemPrompt });
  }
  for (const m of messages) {
    mistralMessages.push({ role: m.isUser ? 'user' : 'assistant', content: m.text });
  }

  const body: { model: string; messages: Array<{ role: string; content: string }>; temperature: number; top_p: number; max_tokens: number; stream: boolean } = {
    model,
    messages: mistralMessages,
    temperature: generationConfig?.temperature ?? 0.7,
    top_p: generationConfig?.top_p ?? 0.95,
    max_tokens: generationConfig?.max_tokens ?? 4096,
    stream: true,
  };

  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mistral API ${res.status} ${res.statusText} – ${text}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('Streaming non supporté par le navigateur');
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';
      for (const evt of events) {
        const lines = evt.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') {
            callbacks.onDone?.();
            return;
          }
          try {
            const json = JSON.parse(data);
            const token = json?.choices?.[0]?.delta?.content;
            if (typeof token === 'string' && token.length > 0) {
              callbacks.onToken(token);
            }
          } catch {
            // ignorer
          }
        }
      }
    }
    callbacks.onDone?.();
  } catch (err) {
    callbacks.onError?.(err);
    throw err;
  }
}


