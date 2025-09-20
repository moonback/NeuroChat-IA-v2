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
    name: 'SDXL Ultra',
    description: 'Modèle haute qualité - Qualité professionnelle',
    category: 'stable-diffusion',
    maxResolution: '1024x1024',
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
 * Optimise automatiquement les paramètres selon le modèle sélectionné
 */
function getOptimizedConfig(
  model: string, 
  config: {
    width: number;
    height: number;
    numInferenceSteps: number;
    guidanceScale: number;
    negativePrompt: string;
  }
) {
  const { width, height, numInferenceSteps, guidanceScale, negativePrompt } = config;
  
  // Configuration optimisée pour SDXL Ultra uniquement
  const optimization = {
    defaultSteps: 25, // SDXL optimisé pour 25 étapes
    defaultGuidance: 7.5,
    defaultNegativePrompt: 'blurry, low quality, distorted, ugly, deformed, bad anatomy',
    maxResolution: 1024
  };
  
  return {
    width: Math.min(width, optimization.maxResolution),
    height: Math.min(height, optimization.maxResolution),
    numInferenceSteps: numInferenceSteps || optimization.defaultSteps,
    guidanceScale: guidanceScale || optimization.defaultGuidance,
    negativePrompt: negativePrompt || optimization.defaultNegativePrompt
  };
}

/**
 * Génère une image via l'API Hugging Face avec paramètres optimisés
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

  // Optimisation automatique des paramètres selon le modèle
  const optimizedConfig = getOptimizedConfig(model, {
    width,
    height,
    numInferenceSteps,
    guidanceScale,
    negativePrompt
  });

  // Validation des paramètres
  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Le prompt ne peut pas être vide');
  }

  if (prompt.length > 500) {
    throw new Error('Le prompt ne peut pas dépasser 500 caractères');
  }

  // Préparation du payload avec paramètres optimisés
  const payload: Record<string, any> = {
    inputs: prompt.trim(),
    parameters: {
      width: Math.min(Math.max(optimizedConfig.width, 256), optimizedConfig.width),
      height: Math.min(Math.max(optimizedConfig.height, 256), optimizedConfig.height),
      num_inference_steps: Math.min(Math.max(optimizedConfig.numInferenceSteps, 1), 50),
      guidance_scale: Math.min(Math.max(optimizedConfig.guidanceScale, 0.0), 20.0),
      negative_prompt: optimizedConfig.negativePrompt
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
  // Avec un seul modèle, on retourne toujours SDXL Ultra
  return AVAILABLE_MODELS;
}

/**
 * Obtient les modèles les plus performants
 */
export function getTopPerformingModels(): HuggingFaceModel[] {
  return AVAILABLE_MODELS;
}

/**
 * Obtient les modèles les plus rapides
 */
export function getFastestModels(): HuggingFaceModel[] {
  return AVAILABLE_MODELS;
}
