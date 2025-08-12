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

  const formattedMessages = messages.map(msg => ({
    role: msg.isUser ? 'user' : 'model',
    text: msg.text
  }));

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
        systemInstruction: {
          role: 'system',
          parts: [{ text: systemPrompt || SYSTEM_PROMPT }],
        },
        generationConfig: {
          temperature: generationConfig?.temperature ?? 0.7,
          topK: generationConfig?.topK ?? 40,
          topP: generationConfig?.topP ?? 0.95,
          maxOutputTokens: generationConfig?.maxOutputTokens ?? 4096,
          stopSequences: generationConfig?.stopSequences ?? [],
          candidateCount: generationConfig?.candidateCount ?? 1,
          responseMimeType: 'text/plain',
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

    const data: any = await response.json();

    // Vérifie un éventuel blocage sécurité
    const blockReason = data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason;
    if (blockReason && String(blockReason).toUpperCase().includes('SAFETY')) {
      throw new Error(`Contenu bloqué par la sécurité (${blockReason})`);
    }

    const candidates: any[] = Array.isArray(data?.candidates) ? data.candidates : [];
    let joined = '';
    // 1) Nouveau format: texte au niveau "text" (quand responseMimeType = text/plain)
    if (typeof candidates?.[0]?.content?.parts?.[0]?.text === 'string') {
      const parts: any[] = candidates[0].content.parts;
      joined = parts
        .map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
        .filter((t: string) => t.trim().length > 0)
        .join('\n')
        .trim();
    }
    // 2) Fallback: texte directement sur le candidat
    if (!joined && typeof candidates?.[0]?.text === 'string') {
      joined = String(candidates[0].text).trim();
    }
    // 3) Fallback étendu: concaténer tous les candidats/parts
    if (!joined) {
      const texts: string[] = [];
      for (const cand of candidates) {
        if (typeof cand?.text === 'string') texts.push(cand.text);
        const parts: any[] = Array.isArray(cand?.content?.parts) ? cand.content.parts : [];
        for (const part of parts) {
          if (typeof part?.text === 'string' && part.text.trim().length > 0) {
            texts.push(part.text);
          }
        }
      }
      joined = texts.join('\n').trim();
    }

    if (!joined) {
      console.error('Gemini raw response (no text parts found):', data);
      throw new Error('Format de réponse invalide depuis l\'API Gemini');
    }

    return joined;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
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