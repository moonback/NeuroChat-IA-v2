import React, { useState, useRef, useEffect } from 'react';
import { X, Search, Download, Plus, Edit2, Trash2, Save, Brain, Target, CheckCircle, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useMemory } from '@/hooks/useMemory';
import { memoryService, type MemoryCategory } from '@/services/memoryService';

interface EnhancedMemoryModalProps {
  open: boolean;
  onClose: () => void;
  examples: string[];
  setExamples: (ex: string[]) => void;
  semanticThreshold: number;
  setSemanticThreshold: (v: number) => void;
  semanticLoading?: boolean;
}

interface MemoryFactWithMeta {
  id: string;
  content: string;
  category?: MemoryCategory;
  confidence?: number;
  source?: 'auto' | 'manual';
  date: string;
}

export function EnhancedMemoryModal({ 
  open, 
  onClose, 
  examples, 
  setExamples, 
  semanticThreshold, 
  setSemanticThreshold, 
  semanticLoading 
}: EnhancedMemoryModalProps) {
  const { memory, addFact, removeFact, editFact } = useMemory();
  
  // États locaux
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newFact, setNewFact] = useState('');
  const [newExampleText, setNewExampleText] = useState('');
  const [newExampleCategory, setNewExampleCategory] = useState<MemoryCategory>('autre');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | 'all'>('all');
  const [showStats, setShowStats] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Obtenir les catégories disponibles
  const categories = memoryService.getAvailableCategories();
  
  // Statistiques des patterns
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    if (open) {
      setStats(memoryService.getDetectionStats());
    }
  }, [open]);
  
  // Filtrer les faits de mémoire par recherche et catégorie
  const filteredMemory = memory.filter((fact: any) => {
    const matchesSearch = search.trim() === '' || 
      fact.content.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      fact.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Obtenir la couleur de la catégorie
  const getCategoryColor = (category: MemoryCategory) => {
    const colors: Record<MemoryCategory, string> = {
      'identité': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'localisation': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'préférences': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'professionnel': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'personnel': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'relations': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'habitudes': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'objectifs': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'santé': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      'loisirs': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
      'éducation': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
      'autre': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[category] || colors.autre;
  };
  
  // Analyser un nouveau fait
  const analyzeNewFact = async () => {
    if (!newFact.trim()) return;
    
    setAnalyzing(true);
    try {
      const result = await memoryService.processText(newFact, semanticThreshold);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      toast.error('Erreur lors de l\'analyse');
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Ajouter un fait
  const handleAddFact = async () => {
    if (!newFact.trim()) return;
    
    try {
      if (analysisResult) {
        // Utiliser le résultat de l'analyse
        if (analysisResult.autoDetectedFacts.length > 0) {
          // Ajouter les faits détectés automatiquement
          for (const fact of analysisResult.autoDetectedFacts) {
            addFact(fact.content);
          }
          toast.success(`${analysisResult.autoDetectedFacts.length} fait(s) ajouté(s) automatiquement`);
        } else if (analysisResult.semanticAnalysis.isRelevant) {
          // Ajouter le fait avec analyse sémantique
          addFact(newFact);
          toast.success('Fait ajouté avec analyse sémantique');
        } else {
          // Demander confirmation
          if (confirm('L\'analyse suggère que cette information pourrait ne pas être pertinente. Voulez-vous l\'ajouter quand même ?')) {
            addFact(newFact);
            toast.success('Fait ajouté manuellement');
          }
        }
      } else {
        addFact(newFact);
        toast.success('Fait ajouté');
      }
      
      setNewFact('');
      setAnalysisResult(null);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      toast.error('Erreur lors de l\'ajout du fait');
    }
  };
  
  // Ajouter un exemple sémantique
  const handleAddExample = () => {
    if (!newExampleText.trim()) return;
    
    try {
      memoryService.addSemanticExample(newExampleText, newExampleCategory);
      setExamples([...examples, newExampleText]);
      setNewExampleText('');
      setNewExampleCategory('autre');
      toast.success('Exemple ajouté');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'exemple:', error);
      toast.error('Erreur lors de l\'ajout de l\'exemple');
    }
  };
  
  // Gérer l'édition
  const handleEdit = (fact: any) => {
    setEditingId(fact.id);
    setEditValue(fact.content);
  };
  
  const handleEditSave = (id: string) => {
    if (editValue.trim()) {
      editFact(id, editValue.trim());
      setEditingId(null);
      setEditValue('');
      toast.success('Fait modifié');
    }
  };
  
  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };
  
  // Exporter la mémoire
  const handleExport = () => {
    const exportData = {
      memory: memory,
      examples: examples,
      semanticThreshold: semanticThreshold,
      exportDate: new Date().toISOString(),
      stats: stats
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurochat-memory-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Mémoire exportée');
  };
  
  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="w-[98vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] max-w-4xl h-[95vh] mx-auto rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl ring-1 ring-white/20 dark:ring-slate-700/20">
        <DrawerHeader className="text-center border-b border-gray-200 dark:border-slate-700 pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <Brain className="w-6 h-6 text-blue-600" />
              Mémoire Utilisateur Améliorée
            </DrawerTitle>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DrawerDescription className="text-sm text-muted-foreground">
            Gérez vos informations personnelles avec détection automatique et analyse sémantique
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Statistiques */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                Statistiques de Détection
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowStats(!showStats)}
              >
                <Info className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">{memory.length}</div>
                <div className="text-sm text-muted-foreground">Faits totaux</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">{stats?.totalPatterns || 0}</div>
                <div className="text-sm text-muted-foreground">Patterns détection</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-600">{examples.length}</div>
                <div className="text-sm text-muted-foreground">Exemples sémantiques</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-600">{(semanticThreshold * 100).toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Seuil sémantique</div>
              </div>
            </div>
            
            {showStats && stats && (
              <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-lg">
                <h4 className="font-semibold mb-2">Patterns par catégorie:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(stats.patternsByCategory).map(([cat, count]) => (
                    <div key={cat} className="flex justify-between">
                      <span className="capitalize">{cat}:</span>
                      <span className="font-mono">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Ajout de nouveau fait */}
          <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-3 text-green-900 dark:text-green-200">
              Ajouter une Information
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={newFact}
                  onChange={(e) => setNewFact(e.target.value)}
                  placeholder="Entrez une information personnelle..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFact()}
                />
                <Button 
                  onClick={analyzeNewFact}
                  disabled={!newFact.trim() || analyzing}
                  variant="outline"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Analyser
                </Button>
                <Button 
                  onClick={handleAddFact}
                  disabled={!newFact.trim()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
              
              {/* Résultat d'analyse */}
              {analyzing && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                  Analyse en cours...
                </div>
              )}
              
              {analysisResult && (
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    {analysisResult.autoDetectedFacts.length > 0 ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : analysisResult.semanticAnalysis.isRelevant ? (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-medium">
                      {analysisResult.autoDetectedFacts.length > 0 
                        ? `${analysisResult.autoDetectedFacts.length} fait(s) détecté(s) automatiquement`
                        : analysisResult.semanticAnalysis.isRelevant 
                          ? `Information pertinente (${(analysisResult.semanticAnalysis.confidence * 100).toFixed(1)}%)`
                          : `Information non pertinente (${(analysisResult.semanticAnalysis.confidence * 100).toFixed(1)}%)`
                      }
                    </span>
                  </div>
                  
                  {analysisResult.autoDetectedFacts.length > 0 && (
                    <div className="space-y-1">
                      {analysisResult.autoDetectedFacts.map((fact: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Badge className={getCategoryColor(fact.category)}>
                            {fact.category}
                          </Badge>
                          <span className="text-sm">{fact.content}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(fact.confidence * 100).toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {analysisResult.semanticAnalysis.isRelevant && (
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(analysisResult.semanticAnalysis.suggestedCategory)}>
                        {analysisResult.semanticAnalysis.suggestedCategory}
                      </Badge>
                      <span className="text-sm">Catégorie suggérée</span>
                    </div>
                  )}
                  
                  {analysisResult.recommendations.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      {analysisResult.recommendations.map((rec: string, idx: number) => (
                        <div key={idx}>• {rec}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Contrôles et filtres */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher dans la mémoire..."
                  className="pl-10"
                />
              </div>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value as MemoryCategory | 'all')}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="capitalize">{cat}</option>
                ))}
              </select>
            </div>
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
          
          {/* Seuil sémantique */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4">
            <label className="text-sm font-semibold text-blue-700 dark:text-blue-200 flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Seuil de similarité sémantique : 
              <span className="font-mono bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs">
                {semanticThreshold}
              </span>
            </label>
            <input
              type="range"
              min={0.5}
              max={0.95}
              step={0.01}
              value={semanticThreshold}
              onChange={(e) => setSemanticThreshold(Number(e.target.value))}
              className="w-full h-2 bg-blue-200 dark:bg-blue-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Plus le seuil est élevé, plus la détection est stricte.
            </div>
          </div>
          
          {/* Liste des faits */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              Faits mémorisés ({filteredMemory.length})
            </h3>
            
            {filteredMemory.length === 0 ? (
              <div className="text-center text-muted-foreground py-8 bg-gray-50 dark:bg-slate-800 rounded-xl">
                <Brain className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Aucune information mémorisée{search && ' correspondant à votre recherche'}.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMemory.map((fact: any) => (
                  <div
                    key={fact.id}
                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-3 hover:shadow-md transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-500"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {editingId === fact.id ? (
                          <div className="flex gap-2">
                            <Textarea
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 resize-none"
                              rows={2}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleEditSave(fact.id);
                                }
                              }}
                            />
                            <div className="flex flex-col gap-1">
                              <Button 
                                size="sm" 
                                onClick={() => handleEditSave(fact.id)}
                                className="px-2"
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={handleEditCancel}
                                className="px-2"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {fact.category && (
                                <Badge className={getCategoryColor(fact.category)}>
                                  {fact.category}
                                </Badge>
                              )}
                              {fact.confidence && (
                                <span className="text-xs text-muted-foreground">
                                  {(fact.confidence * 100).toFixed(1)}%
                                </span>
                              )}
                              {fact.source && (
                                <Badge variant="outline" className="text-xs">
                                  {fact.source === 'auto' ? 'Auto' : 'Manuel'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                              {fact.content}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(fact.date).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {editingId !== fact.id && (
                        <div className="flex gap-1 ml-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEdit(fact)}
                            className="px-2"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => {
                              if (confirm('Êtes-vous sûr de vouloir supprimer cette information ?')) {
                                removeFact(fact.id);
                                toast.success('Information supprimée');
                              }
                            }}
                            className="px-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-800 rounded-b-3xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {memory.length} information(s) mémorisée(s)
            </div>
            <Button onClick={onClose} variant="outline">
              Fermer
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 