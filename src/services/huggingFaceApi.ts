/**
 * 🔥 Service Hugging Face API - Génération d'Images IA
 * 
 * Service pour la génération d'images via l'API Hugging Face
 * - Support des modèles Stable Diffusion XL, SD 1.5, etc.
 * - Génération asynchrone avec polling
 * - Gestion des erreurs et fallbacks
 * - Optimisation des performances
 */

export interface HuggingFaceImageConfig {
  model?: string;
  apiKey?: string;
  width?: number;
  height?: number;
  numInferenceSteps?: number;
  guidanceScale?: number;
  negativePrompt?: string;
  seed?: number;
}

export interface ImageGenerationRequest {
  prompt: string;
  config: HuggingFaceImageConfig;
}

export interface ImageGenerationResponse {
  imageUrl: string;
  model: string;
  prompt: string;
  generationTime: number;
  metadata?: {
    seed?: number;
    steps?: number;
    guidance?: number;
  };
}

export interface HuggingFaceModel {
  id: string;
  name: string;
  description: string;
  category: 'stable-diffusion' | 'dall-e' | 'midjourney' | 'other';
  maxResolution: string;
  estimatedTime: number;
  cost: 'free' | 'paid';
}

// Modèles disponibles pour la génération d'images
export const AVAILABLE_MODELS: HuggingFaceModel[] = [
  {
    id: 'stabilityai/stable-diffusion-xl-base-1.0',
    name: 'Stable Diffusion XL',
    description: 'Modèle haute qualité, excellent pour les images détaillées',
    category: 'stable-diffusion',
    maxResolution: '1024x1024',
    estimatedTime: 15,
    cost: 'free'
  },
  {
    id: 'runwayml/stable-diffusion-v1-5',
    name: 'Stable Diffusion 1.5',
    description: 'Modèle rapide et efficace pour la génération générale',
    category: 'stable-diffusion',
    maxResolution: '512x512',
    estimatedTime: 8,
    cost: 'free'
  },
  {
    id: 'CompVis/stable-diffusion-v1-4',
    name: 'Stable Diffusion 1.4',
    description: 'Version classique, très stable',
    category: 'stable-diffusion',
    maxResolution: '512x512',
    estimatedTime: 10,
    cost: 'free'
  },
  {
    id: 'stabilityai/stable-diffusion-2-1',
    name: 'Stable Diffusion 2.1',
    description: 'Version améliorée avec de meilleurs résultats',
    category: 'stable-diffusion',
    maxResolution: '768x768',
    estimatedTime: 12,
    cost: 'free'
  }
];

/**
 * Vérifie et retourne la clé API Hugging Face
 */
function ensureApiKey(): string {
  const key = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  if (!key || key.trim().length === 0) {
    throw new Error('Clé API Hugging Face manquante. Veuillez configurer VITE_HUGGINGFACE_API_KEY dans votre fichier .env');
  }
  return key;
}

/**
 * Génère une image via l'API Hugging Face
 */
export async function generateImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse> {
  const apiKey = ensureApiKey();
  const startTime = Date.now();
  
  const {
    prompt,
    config: {
      model = 'stabilityai/stable-diffusion-xl-base-1.0',
      width = 512,
      height = 512,
      numInferenceSteps = 20,
      guidanceScale = 7.5,
      negativePrompt = 'blurry, low quality, distorted, ugly',
      seed
    }
  } = request;

  // Validation des paramètres
  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Le prompt ne peut pas être vide');
  }

  if (prompt.length > 500) {
    throw new Error('Le prompt ne peut pas dépasser 500 caractères');
  }

  // Préparation du payload
  const payload: Record<string, any> = {
    inputs: prompt.trim(),
    parameters: {
      width: Math.min(Math.max(width, 256), 1024),
      height: Math.min(Math.max(height, 256), 1024),
      num_inference_steps: Math.min(Math.max(numInferenceSteps, 10), 50),
      guidance_scale: Math.min(Math.max(guidanceScale, 1.0), 20.0),
      negative_prompt: negativePrompt
    }
  };

  // Ajouter le seed si fourni
  if (seed !== undefined) {
    payload.parameters.seed = Math.floor(seed);
  }

  try {
    console.log('🎨 Génération d\'image en cours...', { model, prompt: prompt.substring(0, 50) + '...' });

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Erreur Hugging Face API (${response.status})`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        errorMessage += `: ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    // Vérifier si la réponse est une image
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('image')) {
      const errorText = await response.text();
      throw new Error(`Réponse inattendue de l'API: ${errorText}`);
    }

    // Convertir l'image en URL de données
    const imageBlob = await response.blob();
    const imageUrl = await blobToDataUrl(imageBlob);
    
    const generationTime = Date.now() - startTime;
    
    console.log('✅ Image générée avec succès', { 
      model, 
      generationTime: `${generationTime}ms`,
      size: `${width}x${height}` 
    });

    return {
      imageUrl,
      model,
      prompt: prompt.trim(),
      generationTime,
      metadata: {
        seed,
        steps: numInferenceSteps,
        guidance: guidanceScale
      }
    };

  } catch (error) {
    console.error('❌ Erreur lors de la génération d\'image:', error);
    
    if (error instanceof Error) {
      // Gestion des erreurs spécifiques
      if (error.message.includes('quota')) {
        throw new Error('Quota API Hugging Face dépassé. Veuillez réessayer plus tard.');
      }
      if (error.message.includes('model')) {
        throw new Error('Modèle non disponible. Veuillez choisir un autre modèle.');
      }
      if (error.message.includes('timeout')) {
        throw new Error('Timeout lors de la génération. Le modèle peut être surchargé.');
      }
    }
    
    throw error;
  }
}

/**
 * Convertit un Blob en URL de données
 */
async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Génère plusieurs images en parallèle
 */
export async function generateMultipleImages(
  requests: ImageGenerationRequest[]
): Promise<ImageGenerationResponse[]> {
  if (requests.length === 0) {
    return [];
  }

  if (requests.length > 4) {
    throw new Error('Maximum 4 images peuvent être générées simultanément');
  }

  try {
    const promises = requests.map(request => generateImage(request));
    const results = await Promise.allSettled(promises);
    
    const successful: ImageGenerationResponse[] = [];
    const failed: string[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful.push(result.value);
      } else {
        failed.push(`Image ${index + 1}: ${result.reason.message}`);
      }
    });
    
    if (failed.length > 0) {
      console.warn('⚠️ Certaines images ont échoué:', failed);
    }
    
    return successful;
  } catch (error) {
    throw new Error(`Erreur lors de la génération multiple: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
}

/**
 * Teste la connectivité avec l'API Hugging Face
 */
export async function testHuggingFaceConnection(): Promise<boolean> {
  try {
    const apiKey = ensureApiKey();
    
    const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: 'test',
        parameters: { width: 256, height: 256, num_inference_steps: 1 }
      }),
    });
    
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Obtient les informations d'un modèle spécifique
 */
export function getModelInfo(modelId: string): HuggingFaceModel | undefined {
  return AVAILABLE_MODELS.find(model => model.id === modelId);
}

/**
 * Obtient les modèles recommandés selon le type de génération
 */
export function getRecommendedModels(type: 'portrait' | 'landscape' | 'artistic' | 'realistic'): HuggingFaceModel[] {
  const recommendations: Record<string, string[]> = {
    portrait: ['stabilityai/stable-diffusion-xl-base-1.0', 'stabilityai/stable-diffusion-2-1'],
    landscape: ['stabilityai/stable-diffusion-xl-base-1.0', 'runwayml/stable-diffusion-v1-5'],
    artistic: ['stabilityai/stable-diffusion-2-1', 'CompVis/stable-diffusion-v1-4'],
    realistic: ['stabilityai/stable-diffusion-xl-base-1.0', 'stabilityai/stable-diffusion-2-1']
  };
  
  const modelIds = recommendations[type] || recommendations.realistic;
  return modelIds
    .map(id => getModelInfo(id))
    .filter((model): model is HuggingFaceModel => model !== undefined);
}
