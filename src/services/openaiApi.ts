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

  const body: any = {
    model,
    messages: openaiMessages,
    temperature: generationConfig?.temperature ?? 0.7,
    top_p: generationConfig?.top_p ?? 0.95,
    max_tokens: generationConfig?.max_tokens ?? 4096,
  };

  const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '';
  const res = await fetch(`${API_BASE}/api/openai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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


