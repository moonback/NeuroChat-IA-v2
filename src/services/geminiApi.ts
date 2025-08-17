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

const API_URL = '/api/gemini';

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
  generationConfig?: GeminiGenerationConfig,
  options?: { soft?: boolean }
): Promise<string> {
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
    const response = await fetch(`${API_URL}`, {
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
      if (options?.soft) return '';
      throw new Error(`Échec de la requête API : ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }

    const data: GeminiResponse = await response.json();
    // Essayez de récupérer n'importe quel texte disponible
    const texts: string[] = [];
    if (Array.isArray(data.candidates)) {
      for (const c of data.candidates) {
        const parts = (c as any)?.content?.parts || [];
        for (const p of parts) {
          if (typeof p.text === 'string') texts.push(p.text);
        }
      }
    }
    const finalText = texts.join('\n').trim();
    if (!finalText) {
      if (options?.soft) return '';
      throw new Error('Format de réponse invalide depuis l\'API Gemini');
    }
    return finalText;
  } catch (error) {
    if (!options?.soft) {
      console.error('Gemini API error:', error);
      throw error;
    }
    return '';
  }
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