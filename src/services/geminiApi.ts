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

export async function sendMessageToGemini(
  messages: { text: string; isUser: boolean }[],
  files?: File[],
  systemPrompt?: string
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
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
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

// Utilitaire pour convertir un fichier en base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}