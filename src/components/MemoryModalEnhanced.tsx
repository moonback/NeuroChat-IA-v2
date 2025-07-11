import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, Settings, TrendingUp, AlertTriangle, Search, Plus, Edit3, Trash2, 
  Download, Upload, RefreshCw, Lightbulb, Target, BookOpen, BarChart3
} from 'lucide-react';
import { useMemory } from '@/hooks/useMemory';
import { learningService } from '@/services/learningService';
import { smartSuggestionsService } from '@/services/smartSuggestions';
import { contextualDetectionService } from '@/services/contextualDetection';

interface MemoryModalEnhancedProps {
  open: boolean;
  onClose: () => void;
  conversationHistory: string[];
}

export const MemoryModalEnhanced: React.FC<MemoryModalEnhancedProps> = ({
  open,
  onClose,
  conversationHistory
}) => {
  const { memory, addFact, removeFact, editFact } = useMemory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingFact, setEditingFact] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [newFact, setNewFact] = useState('');
  const [activeTab, setActiveTab] = useState('memory');

  // États pour les analytics
  const [insights, setInsights] = useState(learningService.getInsights());
  const [suggestions, setSuggestions] = useState(smartSuggestionsService.generateSuggestions(
    conversationHistory, memory, 5
  ));
  const [gapAnalysis, setGapAnalysis] = useState(
    smartSuggestionsService.analyzeMemoryGaps(memory)
  );

  // Catégories et emojis
  const categories = [
    'all', 'identité', 'localisation', 'profession', 'préférences', 'dates',
    'relations', 'habitudes', 'santé', 'loisirs', 'voyages', 'personnalité'
  ];

  const categoryEmojis = {
    all: "🗂️", identité: "👤", localisation: "📍", profession: "💼", 
    préférences: "❤️", dates: "📅", relations: "👥", habitudes: "🔄", 
    santé: "🏥", loisirs: "🎯", voyages: "✈️", personnalité: "🧠"
  };

  // Filtrer les faits
  const filteredMemory = memory.filter(fact => {
    const matchesSearch = fact.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || fact.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Statistiques
  const stats = {
    total: memory.length,
    byCategory: memory.reduce((acc, fact) => {
      const category = fact.category || 'non-catégorisé';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    recent: memory.filter(fact => {
      const factDate = new Date(fact.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return factDate >= weekAgo;
    }).length
  };

  // Mettre à jour les analytics
  useEffect(() => {
    if (open) {
      setInsights(learningService.getInsights());
      setSuggestions(smartSuggestionsService.generateSuggestions(
        conversationHistory, memory, 5
      ));
      setGapAnalysis(smartSuggestionsService.analyzeMemoryGaps(memory));
    }
  }, [open, memory, conversationHistory]);

  const handleAddFact = () => {
    if (newFact.trim()) {
      addFact(newFact.trim());
      setNewFact('');
    }
  };

  const handleEditFact = (id: string) => {
    const fact = memory.find(f => f.id === id);
    if (fact) {
      setEditingFact(id);
      setEditContent(fact.content);
    }
  };

  const handleSaveEdit = () => {
    if (editingFact && editContent.trim()) {
      editFact(editingFact, editContent.trim());
      setEditingFact(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingFact(null);
    setEditContent('');
  };

  const handleAddSuggestion = (suggestion: any) => {
    addFact(suggestion.question);
    smartSuggestionsService.markSuggestionUsed(suggestion.id);
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const exportMemory = () => {
    const data = {
      memory,
      exportDate: new Date().toISOString(),
      stats
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memoire-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importMemory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.memory && Array.isArray(data.memory)) {
            data.memory.forEach((fact: any) => {
              addFact(fact.content, fact.category);
            });
          }
        } catch (error) {
          console.error('Erreur import:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-4xl w-full h-[90vh] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Brain className="w-6 h-6 text-blue-500" />
              Mémoire Intelligente
            </CardTitle>
            <Button variant="ghost" onClick={onClose} className="text-xl">
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent className="h-full pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="memory" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Mémoire
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Suggestions
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Paramètres
              </TabsTrigger>
            </TabsList>

            {/* Onglet Mémoire */}
            <TabsContent value="memory" className="h-full space-y-4">
              {/* Statistiques rapides */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <p className="text-sm text-gray-600">Total faits</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">{stats.recent}</div>
                    <p className="text-sm text-gray-600">Cette semaine</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {Object.keys(stats.byCategory).length}
                    </div>
                    <p className="text-sm text-gray-600">Catégories</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recherche et filtres */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher dans la mémoire..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-white dark:bg-slate-800"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {categoryEmojis[cat as keyof typeof categoryEmojis]} {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ajout rapide */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter un fait à la mémoire..."
                  value={newFact}
                  onChange={(e) => setNewFact(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddFact()}
                  className="flex-1"
                />
                <Button onClick={handleAddFact} disabled={!newFact.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>

              {/* Liste des faits */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredMemory.map((fact) => (
                  <Card key={fact.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">
                        {categoryEmojis[fact.category as keyof typeof categoryEmojis] || "💭"}
                      </span>
                      <div className="flex-1">
                        {editingFact === fact.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSaveEdit}>
                                Sauvegarder
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                Annuler
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium">{fact.content}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {fact.category || 'non-catégorisé'}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(fact.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditFact(fact.id)}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFact(fact.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Onglet Suggestions */}
            <TabsContent value="suggestions" className="h-full space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Suggestions Intelligentes</h3>
                
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">
                        {categoryEmojis[suggestion.category as keyof typeof categoryEmojis] || "💭"}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{suggestion.question}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{suggestion.category}</Badge>
                          <Badge variant="secondary">
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddSuggestion(suggestion)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  </Card>
                ))}

                {/* Analyse des lacunes */}
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Lacunes Détectées</h4>
                  <div className="space-y-2">
                    {gapAnalysis.missingCategories.map(category => (
                      <Badge key={category} variant="outline">
                        {categoryEmojis[category as keyof typeof categoryEmojis]} {category}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Analytics */}
            <TabsContent value="analytics" className="h-full space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Précision de l'IA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Taux de réussite</span>
                        <span className="font-semibold">{insights.accuracyRate}%</span>
                      </div>
                      <Progress value={insights.accuracyRate} />
                      <p className="text-sm text-gray-600">
                        Basé sur {insights.totalFeedbacks} retours
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Catégories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {insights.topCategories.map((category, index) => (
                        <div key={category} className="flex items-center gap-2">
                          <span className="text-lg">
                            {categoryEmojis[category as keyof typeof categoryEmojis]}
                          </span>
                          <span className="flex-1">{category}</span>
                          {index === 0 && <span className="text-yellow-500">🏆</span>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Paramètres */}
            <TabsContent value="settings" className="h-full space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Import/Export</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <Button onClick={exportMemory} className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Exporter
                      </Button>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="file"
                          accept=".json"
                          onChange={importMemory}
                          className="hidden"
                        />
                        <Button variant="outline" className="flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Importer
                        </Button>
                      </label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Maintenance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="outline"
                      onClick={() => learningService.cleanOldData()}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Nettoyer les données
                    </Button>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Le nettoyage supprime les données d'apprentissage anciennes
                        pour optimiser les performances.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}; 