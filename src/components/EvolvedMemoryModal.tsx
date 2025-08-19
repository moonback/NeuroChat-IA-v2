/**
 * 🧠 Modal de Visualisation de la Mémoire Évolutive
 * 
 * Interface pour :
 * - Visualiser les préférences apprises
 * - Suivre l'évolution de la personnalité
 * - Analyser les patterns de conversation
 * - Gérer la mémoire contextuelle
 */

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Settings, 
  Download, 
  Upload, 
  Trash2,
  Eye,
  BarChart3,
  User,
  MessageSquare,
  Clock,
  Star
} from 'lucide-react';
import { evolvedMemory } from '@/services/evolvedMemory';
import { personalityAnalyzer } from '@/services/personalityAnalyzer';
import { 
  UserPreference, 
  ConversationPattern, 
  PersonalityTrait, 
  ContextualMemory, 
  LearningMetrics 
} from '@/services/evolvedMemory';

interface EvolvedMemoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EvolvedMemoryModal: React.FC<EvolvedMemoryModalProps> = ({
  open,
  onOpenChange
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null);
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [personality, setPersonality] = useState<PersonalityTrait[]>([]);
  const [patterns, setConversationPatterns] = useState<ConversationPattern[]>([]);
  const [contextualMemories, setContextualMemories] = useState<ContextualMemory[]>([]);
  const [analysisReport, setAnalysisReport] = useState<any>(null);

  // Chargement des données
  useEffect(() => {
    if (open) {
      loadEvolvedMemoryData();
    }
  }, [open]);

  const loadEvolvedMemoryData = () => {
    try {
      // Chargement des métriques
      const learningMetrics = evolvedMemory.getLearningMetrics();
      setMetrics(learningMetrics);

      // Chargement des préférences (simulation - à adapter selon l'implémentation)
      // setPreferences(evolvedMemory.getAllPreferences());

      // Chargement de la personnalité
      const personalityProfile = evolvedMemory.getPersonalityProfile();
      setPersonality(Object.values(personalityProfile));

      // Chargement des patterns (simulation - à adapter selon l'implémentation)
      // setConversationPatterns(evolvedMemory.getAllPatterns());

      // Chargement des mémoires contextuelles (simulation - à adapter selon l'implémentation)
      // setContextualMemories(evolvedMemory.getAllContextualMemories());

      // Génération du rapport d'analyse
      const report = personalityAnalyzer.generatePersonalAnalysisReport();
      setAnalysisReport(report);
    } catch (error) {
      console.error('Erreur lors du chargement des données de mémoire évolutive:', error);
    }
  };

  // Fonctions de gestion
  const handleExportData = () => {
    try {
      const data = evolvedMemory.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neurochat-evolved-memory-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string;
          const success = evolvedMemory.importData(data);
          if (success) {
            loadEvolvedMemoryData();
            alert('Données importées avec succès !');
          } else {
            alert('Erreur lors de l\'import des données');
          }
        } catch (error) {
          console.error('Erreur lors de l\'import:', error);
          alert('Format de fichier invalide');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearAll = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les données d\'apprentissage ? Cette action est irréversible.')) {
      evolvedMemory.clearAll();
      loadEvolvedMemoryData();
      alert('Toutes les données ont été effacées');
    }
  };

  // Composants d'affichage
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalInteractions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total des conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Préférences</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.preferencesLearned || 0}</div>
            <p className="text-xs text-muted-foreground">
              Préférences apprises
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patterns</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.patternsIdentified || 0}</div>
            <p className="text-xs text-muted-foreground">
              Patterns identifiés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Évolutions</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.personalityEvolutions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Changements de personnalité
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rapport d'analyse */}
      {analysisReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Analyse Personnalisée
            </CardTitle>
            <CardDescription>
              Résumé de l'apprentissage et des évolutions détectées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{analysisReport.summary}</p>
            
            {analysisReport.evolution.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Évolutions récentes :</h4>
                <ul className="space-y-1">
                  {analysisReport.evolution.slice(0, 3).map((change: string, index: number) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysisReport.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Suggestions :</h4>
                <ul className="space-y-1">
                  {analysisReport.suggestions.slice(0, 3).map((suggestion: string, index: number) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dernière mise à jour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Dernière Mise à Jour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {metrics?.lastLearningUpdate ? 
              new Date(metrics.lastLearningUpdate).toLocaleString('fr-FR') : 
              'Aucune donnée disponible'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Préférences Apprises</h3>
        <Badge variant="secondary">
          {preferences.length} préférences
        </Badge>
      </div>

      {preferences.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Aucune préférence n'a encore été apprise.
              <br />
              Continuez à utiliser l'assistant pour qu'il apprenne vos préférences !
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {preferences.map((pref) => (
            <Card key={pref.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-sm">{pref.key}</CardTitle>
                    <CardDescription className="text-xs">
                      Catégorie : {pref.category}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {pref.confidence > 0.8 ? 'Élevée' : 
                     pref.confidence > 0.5 ? 'Moyenne' : 'Faible'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Valeur :</span>
                    <span className="font-mono">
                      {typeof pref.value === 'boolean' ? 
                        (pref.value ? 'Oui' : 'Non') : 
                        String(pref.value)
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Confiance :</span>
                    <span>{(pref.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Observations :</span>
                    <span>{pref.evidenceCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Dernière observation :</span>
                    <span>
                      {new Date(pref.lastObserved).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderPersonality = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Profil de Personnalité</h3>
        <Badge variant="secondary">
          {personality.length} traits
        </Badge>
      </div>

      {personality.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Aucun trait de personnalité n'a encore été détecté.
              <br />
              L'assistant apprendra votre style de communication au fil du temps !
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {personality.map((trait) => (
            <Card key={trait.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base capitalize">
                    {trait.trait.replace('_', ' ')}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {trait.trend === 'increasing' && <TrendingUp className="h-4 w-4 text-green-500" />}
                    {trait.trend === 'decreasing' && <TrendingDown className="h-4 w-4 text-red-500" />}
                    {trait.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
                    <Badge variant="outline">
                      {trait.confidence > 0.8 ? 'Élevée' : 
                       trait.confidence > 0.5 ? 'Moyenne' : 'Faible'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Barre de progression pour la valeur */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Valeur actuelle :</span>
                      <span className="font-mono">{trait.value.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          trait.value > 0.5 ? 'bg-blue-500' : 
                          trait.value < -0.5 ? 'bg-red-500' : 'bg-gray-400'
                        }`}
                        style={{ 
                          width: `${Math.abs(trait.value) * 100}%`,
                          marginLeft: trait.value < 0 ? 'auto' : '0'
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>-1</span>
                      <span>0</span>
                      <span>+1</span>
                    </div>
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Confiance :</span>
                      <br />
                      <span className="font-medium">{(trait.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Observations :</span>
                      <br />
                      <span className="font-medium">{trait.evidenceCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tendance :</span>
                      <br />
                      <span className="font-medium capitalize">
                        {trait.trend === 'increasing' ? 'Augmente' :
                         trait.trend === 'decreasing' ? 'Diminue' : 'Stable'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Dernière observation :</span>
                      <br />
                      <span className="font-medium">
                        {new Date(trait.lastObserved).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderPatterns = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Patterns de Conversation</h3>
        <Badge variant="secondary">
          {patterns.length} patterns
        </Badge>
      </div>

      {patterns.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Aucun pattern de conversation n'a encore été identifié.
              <br />
              Les patterns se développent au fur et à mesure des conversations !
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {patterns.map((pattern) => (
            <Card key={pattern.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-sm font-mono">
                      {pattern.pattern.length > 50 ? 
                        pattern.pattern.substring(0, 50) + '...' : 
                        pattern.pattern
                      }
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Contexte : {pattern.context}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {(pattern.successRate * 100).toFixed(0)}% succès
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fréquence :</span>
                    <span>{pattern.frequency} utilisations</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taux de succès :</span>
                    <span>{(pattern.successRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Dernière utilisation :</span>
                    <span>
                      {new Date(pattern.lastUsed).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Créé le :</span>
                    <span>
                      {new Date(pattern.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderContextualMemories = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Mémoires Contextuelles</h3>
        <Badge variant="secondary">
          {contextualMemories.length} contextes
        </Badge>
      </div>

      {contextualMemories.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Aucune mémoire contextuelle n'a encore été créée.
              <br />
              Les contextes se développent avec l'utilisation de l'assistant !
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {contextualMemories.map((memory) => (
            <Card key={memory.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-sm">
                      {memory.context.length > 60 ? 
                        memory.context.substring(0, 60) + '...' : 
                        memory.context
                      }
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {memory.memories.length} souvenirs associés
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {(memory.relevance * 100).toFixed(0)}% pertinence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pertinence :</span>
                    <span>{(memory.relevance * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Accès :</span>
                    <span>{memory.accessCount} fois</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Dernier accès :</span>
                    <span>
                      {new Date(memory.lastAccessed).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Créé le :</span>
                    <span>
                      {new Date(memory.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gestion des Données
          </CardTitle>
          <CardDescription>
            Export, import et gestion de la mémoire évolutive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter les Données
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importer des Données
              </Button>
            </div>

            <Button onClick={handleClearAll} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Effacer Tout
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• <strong>Export :</strong> Sauvegarde toutes les données d'apprentissage</p>
            <p>• <strong>Import :</strong> Restaure des données d'apprentissage sauvegardées</p>
            <p>• <strong>Effacer :</strong> Supprime définitivement toutes les données (irréversible)</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations Système</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Version de la mémoire évolutive :</span>
            <span className="font-mono">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Dernière sauvegarde :</span>
            <span>
              {metrics?.lastLearningUpdate ? 
                new Date(metrics.lastLearningUpdate).toLocaleString('fr-FR') : 
                'Jamais'
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span>Apprentissage automatique :</span>
            <span className="text-green-600">Actif</span>
          </div>
          <div className="flex justify-between">
            <span>Nettoyage automatique :</span>
            <span className="text-green-600">Actif</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Mémoire Évolutive et Apprentissage
          </DialogTitle>
          <DialogDescription>
            Visualisez et gérez l'apprentissage automatique de l'assistant
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Préférences
            </TabsTrigger>
            <TabsTrigger value="personality" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Personnalité
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="contextual" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Contexte
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            {renderPreferences()}
          </TabsContent>

          <TabsContent value="personality" className="mt-6">
            {renderPersonality()}
          </TabsContent>

          <TabsContent value="patterns" className="mt-6">
            {renderPatterns()}
          </TabsContent>

          <TabsContent value="contextual" className="mt-6">
            {renderContextualMemories()}
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            {renderSettings()}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
