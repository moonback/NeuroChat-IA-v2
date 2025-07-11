import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Search, 
  Settings, 
  BarChart3, 
  Zap,
  TrendingUp,
  Calendar,
  Tag,
  Plus
} from "lucide-react";

// Import des nouveaux composants et services
import { 
  MemoryAdvancedSearch,
  MemorySearchResults,
  MemoryCategorySummary,
  MemoryPreferences as MemoryPreferencesComponent,
  MemoryFactEditor,
  MemoryStats,
  MemoryDetectionService,
  MemorySearchService,
  type MemoryFact,
  type SearchResult,
  MEMORY_CATEGORIES
} from './index';

// Import du type séparément pour éviter les conflits
import type { MemoryPreferences } from './types';

interface MemoryDashboardProps {
  facts: MemoryFact[];
  onFactAdd?: (fact: Partial<MemoryFact>) => void;
  onFactEdit?: (fact: MemoryFact) => void;
  onFactDelete?: (fact: MemoryFact) => void;
}

export function MemoryDashboard({ 
  facts, 
  onFactAdd, 
  onFactEdit, 
  onFactDelete 
}: MemoryDashboardProps) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [preferences, setPreferences] = useState<MemoryPreferences>({
    autoDetection: true,
    sensitivityLevel: 'medium',
    enabledCategories: MEMORY_CATEGORIES.map(cat => cat.id),
    retentionDays: 365,
    privacyLevel: 'basic'
  });
  const [selectedFact, setSelectedFact] = useState<MemoryFact | null>(null);
  const [showFactEditor, setShowFactEditor] = useState(false);
  const [editingFact, setEditingFact] = useState<MemoryFact | null>(null);
  
  // Services
  const detectionService = useMemo(() => MemoryDetectionService.getInstance(), []);
  const searchService = useMemo(() => MemorySearchService.getInstance(), []);

  // Statistiques calculées
  const stats = useMemo(() => {
    const total = facts.length;
    const byCategory = detectionService.getCategoryStats(facts);
    const byImportance = facts.reduce((acc, fact) => {
      const importance = fact.importance || 'low';
      acc[importance] = (acc[importance] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const recentFacts = facts.filter(fact => {
      const factDate = new Date(fact.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return factDate >= weekAgo;
    }).length;

    return {
      total,
      byCategory,
      byImportance,
      recentFacts,
      avgConfidence: facts.reduce((sum, fact) => sum + (fact.confidence || 0), 0) / facts.length || 0
    };
  }, [facts, detectionService]);

  // Analyse automatique des nouveaux faits
  const analyzeNewFact = (content: string) => {
    const analysis = detectionService.analyzeText(content);
    if (onFactAdd) {
      onFactAdd({
        id: Date.now().toString(),
        content,
        ...analysis
      });
    }
  };

  // Ajouter un exemple à une catégorie manquante
  const addExampleToCategory = (categoryId: string) => {
    const category = MEMORY_CATEGORIES.find(cat => cat.id === categoryId);
    if (category && category.examples.length > 0) {
      const randomExample = category.examples[Math.floor(Math.random() * category.examples.length)];
      analyzeNewFact(randomExample);
    }
  };

  // Gestionnaire pour l'ajout rapide de fait
  const handleQuickAdd = () => {
    setEditingFact(null);
    setShowFactEditor(true);
  };

  // Gestionnaire pour l'édition d'un fait
  const handleEditFact = (fact: MemoryFact) => {
    setEditingFact(fact);
    setShowFactEditor(true);
  };

  // Gestionnaire pour la sauvegarde d'un fait
  const handleSaveFact = (factData: Partial<MemoryFact>) => {
    if (editingFact && onFactEdit) {
      onFactEdit({ ...editingFact, ...factData } as MemoryFact);
    } else if (onFactAdd) {
      onFactAdd(factData);
    }
    setShowFactEditor(false);
    setEditingFact(null);
  };

  // Gestion des préférences
  const handlePreferencesChange = (newPreferences: MemoryPreferences) => {
    setPreferences(newPreferences);
    // Sauvegarder en localStorage
    try {
      localStorage.setItem('memory-preferences', JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Impossible de sauvegarder les préférences:', error);
    }
  };

  // Charger les préférences au montage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('memory-preferences');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Impossible de charger les préférences:', error);
    }
  }, []);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N pour ajouter un nouveau fait
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleQuickAdd();
      }
      // Ctrl/Cmd + F pour focus sur la recherche
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        // Focus sur l'input de recherche si disponible
        const searchInput = document.querySelector('input[placeholder*="Rechercher"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
      // Échap pour fermer les modales
      if (e.key === 'Escape') {
        setShowFactEditor(false);
        setSelectedFact(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header du dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Tableau de bord mémoire
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez et explorez vos souvenirs intelligemment
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Ctrl+N</kbd>
              Nouveau fait
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Ctrl+F</kbd>
              Rechercher
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">Esc</kbd>
              Fermer
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="w-4 h-4" />
            IA activée
          </Badge>
          <Button onClick={handleQuickAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un fait
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des faits</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.recentFacts} cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confiance moyenne</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.avgConfidence * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Précision de l'IA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catégories actives</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(stats.byCategory).filter(cat => stats.byCategory[cat] > 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              sur {MEMORY_CATEGORIES.length} disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faits importants</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.byImportance.high || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              haute importance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Recherche
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analyse
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Préférences
          </TabsTrigger>
          <TabsTrigger value="detection" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Détection
          </TabsTrigger>
        </TabsList>

        {/* Onglet Recherche */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recherche avancée</CardTitle>
              <CardDescription>
                Trouvez vos souvenirs avec la recherche intelligente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MemoryAdvancedSearch
                facts={facts}
                onResults={setSearchResults}
                placeholder="Recherchez dans vos souvenirs..."
              />
            </CardContent>
          </Card>

          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Résultats de recherche</CardTitle>
              </CardHeader>
              <CardContent>
                <MemorySearchResults
                  results={searchResults}
                  onEdit={handleEditFact}
                  onDelete={onFactDelete}
                  onView={setSelectedFact}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onglet Analyse */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par catégories</CardTitle>
              </CardHeader>
              <CardContent>
                <MemoryCategorySummary facts={facts} maxVisible={8} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Évolution dans le temps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Graphique temporel à venir</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistiques détaillées */}
          <MemoryStats facts={facts} />
        </TabsContent>

        {/* Onglet Préférences */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Configuration avancée</CardTitle>
              <CardDescription>
                Personnalisez le comportement de votre système de mémoire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MemoryPreferencesComponent
                preferences={preferences}
                onChange={handlePreferencesChange}
                onReset={() => setPreferences({
                  autoDetection: true,
                  sensitivityLevel: 'medium',
                  enabledCategories: MEMORY_CATEGORIES.map(cat => cat.id),
                  retentionDays: 365,
                  privacyLevel: 'basic'
                })}
                onExport={() => {
                  const dataStr = JSON.stringify(preferences, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = 'memory-preferences.json';
                  link.click();
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Détection */}
        <TabsContent value="detection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test de détection automatique</CardTitle>
              <CardDescription>
                Testez la détection automatique de catégories et d'importance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <textarea
                  placeholder="Entrez un texte pour tester la détection automatique..."
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
                  onChange={(e) => {
                    const analysis = detectionService.analyzeText(e.target.value);
                    console.log('Analyse:', analysis);
                  }}
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  L'analyse apparaîtra dans la console du navigateur
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suggestions d'amélioration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {detectionService.suggestMissingCategories(facts).map(categoryId => {
                  const category = MEMORY_CATEGORIES.find(cat => cat.id === categoryId);
                  return category ? (
                    <div key={categoryId} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Aucun fait détecté dans cette catégorie
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => addExampleToCategory(categoryId)}
                      >
                        Ajouter exemple
                      </Button>
                    </div>
                  ) : null;
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Éditeur de fait modal */}
      <MemoryFactEditor
        open={showFactEditor}
        onClose={() => {
          setShowFactEditor(false);
          setEditingFact(null);
        }}
        fact={editingFact}
        onSave={handleSaveFact}
        isEditing={!!editingFact}
      />
    </div>
  );
} 