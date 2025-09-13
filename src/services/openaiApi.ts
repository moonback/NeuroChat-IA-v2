export interface OpenAIGenerationConfig {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  model?: string;
}

interface ChatMessage {
  text: string;
  isUser: boolean;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function sendMessageToOpenAI(
  messages: ChatMessage[],
  images: File[] | undefined,
  systemPrompt: string,
  generationConfig?: OpenAIGenerationConfig,
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error("Clé API OpenAI introuvable. Ajoute VITE_OPENAI_API_KEY dans .env.local.");
  }

  const model = (generationConfig?.model || import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini') as string;

  // Construire les messages pour Chat Completions
  type OAContent = string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
  const openaiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: OAContent }> = [];

  openaiMessages.push({ role: 'system', content: systemPrompt });

  // Déterminer si on doit joindre une image au dernier message utilisateur
  const lastIndex = messages.length - 1;
  const hasImageForLastUser = images && images.length > 0 && messages[lastIndex]?.isUser;
  let imageDataUrl: string | null = null;
  if (hasImageForLastUser) {
    try {
      imageDataUrl = await fileToDataUrl(images![0]);
    } catch {
      imageDataUrl = null;
    }
  }

  messages.forEach((m, idx) => {
    const role = m.isUser ? 'user' : 'assistant' as const;
    if (idx === lastIndex && hasImageForLastUser && imageDataUrl) {
      openaiMessages.push({
        role,
        content: [
          { type: 'text', text: m.text },
          { type: 'image_url', image_url: { url: imageDataUrl } },
        ],
      });
    } else {
      openaiMessages.push({ role, content: m.text });
    }
  });

  const body: { model: string; messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }>; temperature: number; top_p: number; max_tokens: number } = {
    model,
    messages: openaiMessages,
    temperature: generationConfig?.temperature ?? 0.7,
    top_p: generationConfig?.top_p ?? 0.95,
    max_tokens: generationConfig?.max_tokens ?? 4096,
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API ${res.status} ${res.statusText} – ${text}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new Error("Réponse vide ou invalide depuis l'API OpenAI");
  }
  return content.trim();
}


// Streaming SSE pour Chat Completions OpenAI
export async function streamMessageToOpenAI(
  messages: ChatMessage[],
  images: File[] | undefined,
  systemPrompt: string,
  generationConfig: OpenAIGenerationConfig | undefined,
  callbacks: { onToken: (token: string) => void; onDone?: () => void; onError?: (err: Error) => void },
): Promise<void> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error("Clé API OpenAI introuvable. Ajoute VITE_OPENAI_API_KEY dans .env.local.");
  }

  const model = (generationConfig?.model || import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini') as string;

  type OAContent = string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
  const openaiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: OAContent }> = [];
  openaiMessages.push({ role: 'system', content: systemPrompt });

  const lastIndex = messages.length - 1;
  const hasImageForLastUser = images && images.length > 0 && messages[lastIndex]?.isUser;
  let imageDataUrl: string | null = null;
  if (hasImageForLastUser) {
    try {
      imageDataUrl = await fileToDataUrl(images![0]);
    } catch {
      imageDataUrl = null;
    }
  }

  messages.forEach((m, idx) => {
    const role = m.isUser ? 'user' : 'assistant' as const;
    if (idx === lastIndex && hasImageForLastUser && imageDataUrl) {
      openaiMessages.push({
        role,
        content: [
          { type: 'text', text: m.text },
          { type: 'image_url', image_url: { url: imageDataUrl } },
        ],
      });
    } else {
      openaiMessages.push({ role, content: m.text });
    }
  });

  const body: { model: string; messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }>; temperature: number; top_p: number; max_tokens: number; stream: boolean } = {
    model,
    messages: openaiMessages,
    temperature: generationConfig?.temperature ?? 0.7,
    top_p: generationConfig?.top_p ?? 0.95,
    max_tokens: generationConfig?.max_tokens ?? 4096,
    stream: true,
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API ${res.status} ${res.statusText} – ${text}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error('Streaming non supporté par le navigateur');
  }
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
            // ignorer lignes non JSON
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


