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
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function sendMessageToGemini(messages: { text: string; isUser: boolean }[]): Promise<string> {
  if (!API_KEY) {
    throw new Error('Clé API Gemini introuvable. Merci d’ajouter VITE_GEMINI_API_KEY dans ton fichier .env.local.');
  }

  // Construction du format attendu par Gemini
  const formattedMessages = messages.map(msg => ({
    role: msg.isUser ? 'user' : 'model',
    text: msg.text
  }));

  // Gemini attend un tableau de 'contents' avec des 'parts' pour chaque message
  const contents = formattedMessages.map(msg => ({
    parts: [{ text: msg.text }],
    role: msg.role
  }));

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
      throw new Error('Format de réponse invalide depuis l’API Gemini');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}