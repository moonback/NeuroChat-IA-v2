import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Image, 
  Sparkles, 
  Settings, 
  Download, 
  Copy, 
  RefreshCw, 
  Zap, 
  Clock, 
  Palette,
  X,
  Check,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  generateImage, 
  generateMultipleImages, 
  AVAILABLE_MODELS, 
  HuggingFaceImageConfig,
  ImageGenerationRequest,
  ImageGenerationResponse,
  getModelInfo,
  getRecommendedModels
} from '@/services/huggingFaceApi';

interface ImageGenerationModalProps {
  open: boolean;
  onClose: () => void;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  initialPrompt?: string;
}

export function ImageGenerationModal({ 
  open, 
  onClose, 
  onImageGenerated, 
  initialPrompt = '' 
}: ImageGenerationModalProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, distorted, ugly, deformed');
  const [selectedModel, setSelectedModel] = useState('stabilityai/stable-diffusion-xl-base-1.0');
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [numInferenceSteps, setNumInferenceSteps] = useState(20);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<ImageGenerationResponse[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generationType, setGenerationType] = useState<'portrait' | 'landscape' | 'artistic' | 'realistic'>('realistic');

  // Réinitialiser les valeurs quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setPrompt(initialPrompt);
      setGeneratedImages([]);
      setIsGenerating(false);
    }
  }, [open, initialPrompt]);

  // Mettre à jour le modèle recommandé quand le type change
  useEffect(() => {
    const recommended = getRecommendedModels(generationType);
    if (recommended.length > 0) {
      setSelectedModel(recommended[0].id);
    }
  }, [generationType]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Veuillez saisir un prompt pour générer l\'image');
      return;
    }

    setIsGenerating(true);
    try {
      const config: HuggingFaceImageConfig = {
        model: selectedModel,
        width,
        height,
        numInferenceSteps,
        guidanceScale,
        negativePrompt: negativePrompt.trim() || undefined,
        seed
      };

      const request: ImageGenerationRequest = { prompt: prompt.trim(), config };
      const result = await generateImage(request);
      
      setGeneratedImages(prev => [result, ...prev]);
      toast.success('Image générée avec succès !');
    } catch (error) {
      console.error('Erreur génération image:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, selectedModel, width, height, numInferenceSteps, guidanceScale, negativePrompt, seed]);

  const handleGenerateMultiple = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Veuillez saisir un prompt pour générer les images');
      return;
    }

    setIsGenerating(true);
    try {
      const config: HuggingFaceImageConfig = {
        model: selectedModel,
        width,
        height,
        numInferenceSteps,
        guidanceScale,
        negativePrompt: negativePrompt.trim() || undefined,
        seed
      };

      // Générer 4 images avec des seeds différents
      const requests: ImageGenerationRequest[] = Array.from({ length: 4 }, (_, i) => ({
        prompt: prompt.trim(),
        config: { ...config, seed: seed ? seed + i : Math.floor(Math.random() * 1000000) }
      }));

      const results = await generateMultipleImages(requests);
      setGeneratedImages(prev => [...results, ...prev]);
      toast.success(`${results.length} image(s) générée(s) avec succès !`);
    } catch (error) {
      console.error('Erreur génération multiple:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la génération multiple');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, selectedModel, width, height, numInferenceSteps, guidanceScale, negativePrompt, seed]);

  const handleUseImage = useCallback((imageUrl: string, prompt: string) => {
    onImageGenerated(imageUrl, prompt);
    onClose();
  }, [onImageGenerated, onClose]);

  const handleCopyPrompt = useCallback((prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copié dans le presse-papier');
  }, []);

  const handleDownloadImage = useCallback(async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Image téléchargée');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  }, []);

  const selectedModelInfo = getModelInfo(selectedModel);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Image className="w-5 h-5 text-white" />
            </div>
            Génération d'Images IA
            <Badge variant="secondary" className="ml-2">
              Hugging Face
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration */}
          <div className="space-y-6">
            {/* Type de génération */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Type de génération</Label>
              <Select value={generationType} onValueChange={(value: any) => setGenerationType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realistic">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Réaliste
                    </div>
                  </SelectItem>
                  <SelectItem value="portrait">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Portrait
                    </div>
                  </SelectItem>
                  <SelectItem value="landscape">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Paysage
                    </div>
                  </SelectItem>
                  <SelectItem value="artistic">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Artistique
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prompt principal */}
            <div className="space-y-3">
              <Label htmlFor="prompt" className="text-sm font-semibold">
                Prompt de génération *
              </Label>
              <Textarea
                id="prompt"
                placeholder="Décrivez l'image que vous souhaitez générer..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <div className="text-xs text-slate-500 text-right">
                {prompt.length}/500 caractères
              </div>
            </div>

            {/* Modèle */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Modèle IA</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-slate-500">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedModelInfo && (
                <div className="flex gap-2 text-xs">
                  <Badge variant="outline">{selectedModelInfo.maxResolution}</Badge>
                  <Badge variant="outline">{selectedModelInfo.estimatedTime}s</Badge>
                  <Badge variant={selectedModelInfo.cost === 'free' ? 'default' : 'secondary'}>
                    {selectedModelInfo.cost === 'free' ? 'Gratuit' : 'Payant'}
                  </Badge>
                </div>
              )}
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Largeur</Label>
                <Select value={width.toString()} onValueChange={(value) => setWidth(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="256">256px</SelectItem>
                    <SelectItem value="512">512px</SelectItem>
                    <SelectItem value="768">768px</SelectItem>
                    <SelectItem value="1024">1024px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Hauteur</Label>
                <Select value={height.toString()} onValueChange={(value) => setHeight(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="256">256px</SelectItem>
                    <SelectItem value="512">512px</SelectItem>
                    <SelectItem value="768">768px</SelectItem>
                    <SelectItem value="1024">1024px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Paramètres avancés */}
            <div className="space-y-3">
              <Button
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full justify-start"
              >
                <Settings className="w-4 h-4 mr-2" />
                Paramètres avancés
                {showAdvanced ? <X className="w-4 h-4 ml-auto" /> : <RefreshCw className="w-4 h-4 ml-auto" />}
              </Button>

              {showAdvanced && (
                <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  {/* Prompt négatif */}
                  <div className="space-y-2">
                    <Label className="text-sm">Prompt négatif</Label>
                    <Input
                      placeholder="Ce que vous ne voulez pas voir..."
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                    />
                  </div>

                  {/* Nombre d'étapes */}
                  <div className="space-y-2">
                    <Label className="text-sm">Qualité (étapes d'inférence)</Label>
                    <div className="px-3">
                      <Slider
                        value={[numInferenceSteps]}
                        onValueChange={([value]) => setNumInferenceSteps(value)}
                        min={10}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Rapide (10)</span>
                        <span className="font-medium">{numInferenceSteps}</span>
                        <span>Qualité (50)</span>
                      </div>
                    </div>
                  </div>

                  {/* Guidance scale */}
                  <div className="space-y-2">
                    <Label className="text-sm">Cohérence avec le prompt</Label>
                    <div className="px-3">
                      <Slider
                        value={[guidanceScale]}
                        onValueChange={([value]) => setGuidanceScale(value)}
                        min={1}
                        max={20}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Libre (1)</span>
                        <span className="font-medium">{guidanceScale}</span>
                        <span>Strict (20)</span>
                      </div>
                    </div>
                  </div>

                  {/* Seed */}
                  <div className="space-y-2">
                    <Label className="text-sm">Seed (optionnel)</Label>
                    <Input
                      type="number"
                      placeholder="Laissez vide pour aléatoire"
                      value={seed || ''}
                      onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Générer 1 image
                  </>
                )}
              </Button>
              <Button
                onClick={handleGenerateMultiple}
                disabled={isGenerating || !prompt.trim()}
                variant="outline"
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Générer 4 images
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Résultats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Images générées</h3>
              {generatedImages.length > 0 && (
                <Badge variant="secondary">
                  {generatedImages.length} image(s)
                </Badge>
              )}
            </div>

            {generatedImages.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Image className="w-12 h-12 text-slate-400 mb-4" />
                  <p className="text-slate-500 text-center">
                    Aucune image générée pour le moment.<br />
                    Saisissez un prompt et cliquez sur "Générer" pour commencer.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {generatedImages.map((result, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative group">
                        <img
                          src={result.imageUrl}
                          alt={`Image générée: ${result.prompt}`}
                          className="w-full h-auto object-cover"
                          loading="lazy"
                        />
                        
                        {/* Overlay avec actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUseImage(result.imageUrl, result.prompt)}
                            className="bg-white/90 hover:bg-white text-black"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Utiliser
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadImage(result.imageUrl, result.prompt)}
                            className="bg-white/90 hover:bg-white text-black"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Télécharger
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyPrompt(result.prompt)}
                            className="bg-white/90 hover:bg-white text-black"
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copier prompt
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {result.prompt.length > 60 ? `${result.prompt.substring(0, 60)}...` : result.prompt}
                          </span>
                          <div className="flex items-center gap-2 text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>{Math.round(result.generationTime / 1000)}s</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 text-xs">
                          <Badge variant="outline">{result.model.split('/')[1]}</Badge>
                          <Badge variant="outline">{width}x{height}</Badge>
                          {result.metadata?.steps && (
                            <Badge variant="outline">{result.metadata.steps} étapes</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Informations */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">💡 Conseils pour de meilleurs résultats :</p>
              <ul className="space-y-1 text-xs">
                <li>• Soyez précis dans votre description (style, couleurs, composition)</li>
                <li>• Utilisez des mots-clés artistiques (photorealistic, digital art, oil painting)</li>
                <li>• Plus d'étapes = meilleure qualité mais plus lent</li>
                <li>• Le prompt négatif aide à éviter les éléments indésirables</li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
