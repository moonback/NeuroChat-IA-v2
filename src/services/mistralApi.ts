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

  const body: any = {
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


