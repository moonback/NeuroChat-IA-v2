import { SYSTEM_PROMPT } from './geminiSystemPrompt';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const THINKING_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

export interface GeminiGenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  candidateCount?: number;
}

export async function sendMessageToGemini(
  messages: { text: string; isUser: boolean }[],
  files?: File[],
  systemPrompt?: string,
  generationConfig?: GeminiGenerationConfig
): Promise<string> {
  if (!API_KEY) {
    throw new Error('Clé API Gemini introuvable. Merci d\'ajouter VITE_GEMINI_API_KEY dans ton fichier .env.local.');
  }

  const systemMessage = { role: 'user', text: systemPrompt || SYSTEM_PROMPT };
  const formattedMessages = [systemMessage, ...messages.map(msg => ({
    role: msg.isUser ? 'user' : 'model',
    text: msg.text
  }))];

  let contents: any[] = [];
  if (files && files.length > 0) {
    for (const file of files) {
      const base64Image = await fileToBase64(file);
      contents.push({
        parts: [
          {
            inline_data: {
              mime_type: file.type,
              data: base64Image.split(',')[1],
            }
          }
        ],
        role: 'user'
      });
    }
  }
  contents = [
    ...contents,
    ...formattedMessages.map(msg => ({
      parts: [{ text: msg.text }],
      role: msg.role
    }))
  ];

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: generationConfig?.temperature ?? 0.7,
          topK: generationConfig?.topK ?? 40,
          topP: generationConfig?.topP ?? 0.95,
          maxOutputTokens: generationConfig?.maxOutputTokens ?? 4096,
          stopSequences: generationConfig?.stopSequences ?? [],
          candidateCount: generationConfig?.candidateCount ?? 1,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Échec de la requête API : ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Format de réponse invalide depuis l\'API Gemini');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export interface GeminiThinkingResult {
  thinking: string;
  answer: string;
}

export async function sendMessageWithThinking(
  messages: { text: string; isUser: boolean }[],
  files?: File[],
  systemPrompt?: string,
  generationConfig?: GeminiGenerationConfig
): Promise<GeminiThinkingResult> {
  if (!API_KEY) {
    throw new Error(
      "Clé API Gemini introuvable. Merci d'ajouter VITE_GEMINI_API_KEY dans ton fichier .env.local."
    );
  }

  const systemMessage = { role: 'user', text: systemPrompt || SYSTEM_PROMPT };
  const formattedMessages = [
    systemMessage,
    ...messages.map((msg) => ({ role: msg.isUser ? 'user' : 'model', text: msg.text })),
  ];

  let contents: any[] = [];
  if (files && files.length > 0) {
    for (const file of files) {
      const base64Image = await fileToBase64(file);
      contents.push({
        parts: [
          {
            inline_data: { mime_type: file.type, data: base64Image.split(',')[1] },
          },
        ],
        role: 'user',
      });
    }
  }
  contents = [
    ...contents,
    ...formattedMessages.map((msg) => ({ parts: [{ text: msg.text }], role: msg.role })),
  ];

  const basePayload = {
    generationConfig: {
      temperature: generationConfig?.temperature ?? 0.7,
      topK: generationConfig?.topK ?? 40,
      topP: generationConfig?.topP ?? 0.95,
      maxOutputTokens: generationConfig?.maxOutputTokens ?? 4096,
      stopSequences: generationConfig?.stopSequences ?? [],
      candidateCount: generationConfig?.candidateCount ?? 1,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
    tools: [
      {
        function_declarations: [
          {
            name: 'thinking',
            description: 'Réflexion interne avant la réponse finale',
            parameters: {
              type: 'object',
              properties: { text: { type: 'string' } },
              required: ['text'],
            },
          },
        ],
      },
    ],
    toolConfig: { functionCallingConfig: { mode: 'auto' } },
  };

  const first = await fetch(`${THINKING_API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents, ...basePayload }),
  });

  if (!first.ok) {
    const err = await first.json().catch(() => ({}));
    throw new Error(`Échec de la requête API : ${first.status} ${first.statusText}. ${err.error?.message || ''}`);
  }

  const firstData: any = await first.json();
  const call = firstData.candidates?.[0]?.content?.parts?.[0]?.functionCall;
  const thinking = call ? JSON.parse(call.args || '{}').text || '' : '';

  const contents2 = [
    ...contents,
    call ? { role: 'model', parts: [{ functionCall: call }] } : null,
    call
      ? {
          role: 'function',
          parts: [{ functionResponse: { name: 'thinking', response: { text: thinking } } }],
        }
      : null,
  ].filter(Boolean);

  const final = await fetch(`${THINKING_API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: contents2, ...basePayload }),
  });

  if (!final.ok) {
    const err = await final.json().catch(() => ({}));
    throw new Error(`Échec de la requête API : ${final.status} ${final.statusText}. ${err.error?.message || ''}`);
  }

  const finalData: GeminiResponse = await final.json();
  const answer = finalData.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return { thinking, answer };
}

// Utilitaire pour convertir un fichier en base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}